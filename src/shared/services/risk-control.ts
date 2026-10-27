'use server';

import { eq, and, gte, lte, desc, count } from 'drizzle-orm';
import { db } from '@/core/db';
import * as schema from '@/config/db/schema'; // SEC-08：改用 PostgreSQL schema（login_attempt/ip_blacklist 已迁入）
import { getClientIp } from '@/shared/lib/ip';
import { headers } from 'next/headers';

// 风控配置
const RISK_CONTROL_CONFIG = {
  MAX_LOGIN_ATTEMPTS_PER_IP: 10, // 同一IP最大登录次数
  LOGIN_WINDOW_HOURS: 24, // 统计时间窗口（小时）
  BLACKLIST_DURATION_HOURS: 24, // 黑名单持续时间（小时）
  FINGERPRINT_ENABLED: true, // 是否启用浏览器指纹
};

// SEC-08：DB 异常时的内存降级结构（避免 catch 后无条件放行）
const MEMORY_WINDOW_MS = RISK_CONTROL_CONFIG.LOGIN_WINDOW_HOURS * 3600 * 1000;
const memoryAttempts = new Map<string, number[]>(); // ip -> 尝试时间戳列表
const memoryBlacklist = new Map<string, number>(); // ip -> 封禁截止时间戳

function pruneMemoryAttempts(ip: string): number[] {
  const now = Date.now();
  const list = (memoryAttempts.get(ip) ?? []).filter(
    (t) => now - t < MEMORY_WINDOW_MS
  );
  memoryAttempts.set(ip, list);
  return list;
}

function recordMemoryAttempt(ip: string): void {
  const list = pruneMemoryAttempts(ip);
  list.push(Date.now());
  memoryAttempts.set(ip, list);
}

function getMemoryAttempts(ip: string): number {
  return pruneMemoryAttempts(ip).length;
}

function isMemoryBlocked(ip: string): boolean {
  const until = memoryBlacklist.get(ip);
  if (!until) return false;
  if (Date.now() > until) {
    memoryBlacklist.delete(ip);
    return false;
  }
  return true;
}

function blockMemory(ip: string): void {
  memoryBlacklist.set(
    ip,
    Date.now() + RISK_CONTROL_CONFIG.BLACKLIST_DURATION_HOURS * 3600 * 1000
  );
}

/**
 * 生成浏览器指纹
 */
async function generateFingerprint(): Promise<string> {
  const h = await headers();
  
  const fingerprintData = {
    userAgent: h.get('user-agent') || '',
    accept: h.get('accept') || '',
    acceptEncoding: h.get('accept-encoding') || '',
    acceptLanguage: h.get('accept-language') || '',
    platform: (globalThis.navigator?.platform || ''),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${globalThis.screen?.width || 0}x${globalThis.screen?.height || 0}`,
  };

  // 简单的指纹生成（实际项目中建议使用更复杂的算法）
  const fingerprintString = Object.values(fingerprintData).join('|');
  return Buffer.from(fingerprintString).toString('base64');
}

/**
 * 检查IP是否在黑名单中
 */
export async function isIpBlocked(ipAddress: string): Promise<boolean> {
  try {
    const result = await db()
      .select()
      .from(schema.ipBlacklist)
      .where(
        and(
          eq(schema.ipBlacklist.ipAddress, ipAddress),
          gte(schema.ipBlacklist.blockedUntil, new Date())
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('检查IP黑名单失败:', error);
    // SEC-08：DB 异常时降级为内存黑名单判断，不再无条件放行
    return isMemoryBlocked(ipAddress);
  }
}

/**
 * 获取IP在指定时间窗口内的登录尝试次数
 */
export async function getLoginAttemptsCount(
  ipAddress: string,
  fingerprint?: string
): Promise<number> {
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RISK_CONTROL_CONFIG.LOGIN_WINDOW_HOURS);

    const conditions = [
      eq(schema.loginAttempt.ipAddress, ipAddress),
      gte(schema.loginAttempt.attemptTime, windowStart),
    ];

    if (fingerprint && RISK_CONTROL_CONFIG.FINGERPRINT_ENABLED) {
      conditions.push(eq(schema.loginAttempt.fingerprint, fingerprint));
    }

    const result = await db()
      .select({ count: count() })
      .from(schema.loginAttempt)
      .where(and(...conditions));

    return result[0]?.count || 0;
  } catch (error) {
    console.error('获取登录尝试次数失败:', error);
    // SEC-08：DB 异常时降级为内存计数限频，不再返回 0 放行
    return getMemoryAttempts(ipAddress);
  }
}

/**
 * 记录登录尝试
 */
export async function recordLoginAttempt(
  success: boolean,
  userId?: string
): Promise<void> {
  try {
    const ipAddress = await getClientIp();
    const fingerprint = RISK_CONTROL_CONFIG.FINGERPRINT_ENABLED 
      ? await generateFingerprint() 
      : undefined;
    
    const h = await headers();
    const userAgent = h.get('user-agent') || '';

    // SEC-08：内存计数始终记录，作为 DB 异常时的降级数据源
    recordMemoryAttempt(ipAddress);

    await db().insert(schema.loginAttempt).values({
      ipAddress,
      fingerprint,
      userId: userId || null,
      success,
      userAgent,
    });
  } catch (error) {
    console.error('记录登录尝试失败:', error);
  }
}

/**
 * 检查是否超过登录限制
 */
export async function checkLoginLimit(): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  errorMessage?: string;
}> {
  // SEC-08：先取 IP（放 try 外，保证降级分支也能拿到）
  const ipAddress = await getClientIp();
  try {
    // 检查IP是否被封禁
    const isBlocked = await isIpBlocked(ipAddress);
    if (isBlocked) {
      return {
        allowed: false,
        remainingAttempts: 0,
        errorMessage: '此IP地址已被临时封禁，请稍后再试'
      };
    }

    // 获取登录尝试次数
    const fingerprint = RISK_CONTROL_CONFIG.FINGERPRINT_ENABLED 
      ? await generateFingerprint() 
      : undefined;
    
    const attemptsCount = await getLoginAttemptsCount(ipAddress, fingerprint);
    const remainingAttempts = Math.max(0, RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP - attemptsCount);

    if (attemptsCount >= RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP) {
      // 超过限制，加入黑名单
      await blockIpAddress(ipAddress, '超过登录次数限制');
      return {
        allowed: false,
        remainingAttempts: 0,
        errorMessage: `登录次数已达上限 (${RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP}次/24小时)`
      };
    }

    return {
      allowed: true,
      remainingAttempts,
    };
  } catch (error) {
    console.error('检查登录限制失败:', error);
    // SEC-08：DB 异常时降级为内存计数限频（而非完全放行），避免 DB 抖动锁死全站也避免裸奔
    const memoryCount = getMemoryAttempts(ipAddress);
    if (memoryCount >= RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP) {
      blockMemory(ipAddress);
      return {
        allowed: false,
        remainingAttempts: 0,
        errorMessage: `登录次数已达上限 (${RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP}次/24小时)`,
      };
    }
    return {
      allowed: true,
      remainingAttempts:
        RISK_CONTROL_CONFIG.MAX_LOGIN_ATTEMPTS_PER_IP - memoryCount,
    };
  }
}

/**
 * 将IP地址加入黑名单
 */
async function blockIpAddress(ipAddress: string, reason: string): Promise<void> {
  try {
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + RISK_CONTROL_CONFIG.BLACKLIST_DURATION_HOURS);

    // 检查是否已存在
    const existing = await db()
      .select()
      .from(schema.ipBlacklist)
      .where(eq(schema.ipBlacklist.ipAddress, ipAddress))
      .limit(1);

    if (existing.length > 0) {
      // 更新现有记录
      await db()
        .update(schema.ipBlacklist)
        .set({
          reason,
          blockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(schema.ipBlacklist.ipAddress, ipAddress));
    } else {
      // 创建新记录
      await db().insert(schema.ipBlacklist).values({
        ipAddress,
        reason,
        blockedUntil,
      });
    }
  } catch (error) {
    console.error('封禁IP地址失败:', error);
    // SEC-08：DB 封禁失败时至少落到内存黑名单
    blockMemory(ipAddress);
  }
}

/**
 * 清理过期的黑名单记录
 */
export async function cleanupExpiredBlacklist(): Promise<void> {
  try {
    await db()
      .delete(schema.ipBlacklist)
      .where(lte(schema.ipBlacklist.blockedUntil, new Date()));
  } catch (error) {
    console.error('清理过期黑名单失败:', error);
  }
}

/**
 * 获取风控统计信息（管理员使用）
 */
export async function getRiskControlStats(timeWindowHours: number = 24) {
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - timeWindowHours);

    // 获取总登录尝试数
    const totalAttempts = await db()
      .select({ count: count() })
      .from(schema.loginAttempt)
      .where(gte(schema.loginAttempt.attemptTime, windowStart));

    // 获取成功登录数
    const successfulAttempts = await db()
      .select({ count: count() })
      .from(schema.loginAttempt)
      .where(
        and(
          gte(schema.loginAttempt.attemptTime, windowStart),
          eq(schema.loginAttempt.success, true)
        )
      );

    // 获取被阻止的IP数量
    const blockedIps = await db()
      .select({ count: count() })
      .from(schema.ipBlacklist)
      .where(gte(schema.ipBlacklist.blockedUntil, new Date()));

    // 获取高频登录IP（按尝试次数排序）
    const topIps = await db()
      .select({
        ipAddress: schema.loginAttempt.ipAddress,
        attemptCount: count(),
      })
      .from(schema.loginAttempt)
      .where(gte(schema.loginAttempt.attemptTime, windowStart))
      .groupBy(schema.loginAttempt.ipAddress)
      .orderBy(desc(count()))
      .limit(10);

    return {
      totalAttempts: totalAttempts[0]?.count || 0,
      successfulAttempts: successfulAttempts[0]?.count || 0,
      blockedIps: blockedIps[0]?.count || 0,
      topIps,
      timeWindowHours,
    };
  } catch (error) {
    console.error('获取风控统计失败:', error);
    return null;
  }
}