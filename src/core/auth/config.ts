import 'server-only';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { oneTap } from 'better-auth/plugins';
import { getLocale } from 'next-intl/server';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import * as schema from '@/config/db/schema';
import { VerifyEmail } from '@/shared/blocks/email/verify-email';
import {
  getCookieFromCtx,
  getHeaderValue,
  guessLocaleFromAcceptLanguage,
} from '@/shared/lib/cookie';
import { getUuid } from '@/shared/lib/hash';
import { getClientIp } from '@/shared/lib/ip';
import { grantCreditsForNewUser } from '@/shared/models/credit';
import { getUsersCountByIp } from '@/shared/models/user';
import { getEmailService } from '@/shared/services/email';
import { grantRoleForNewUser } from '@/shared/services/rbac';

// Best-effort dedupe to prevent sending verification emails too frequently.
// This is especially helpful in dev/hot reload, transient network conditions,
// and to add a server-side throttle beyond any client-side cooldown.
const recentVerificationEmailSentAt = new Map<string, number>();
const VERIFICATION_EMAIL_MIN_INTERVAL_MS = 60_000;

// SEC-09：发送验证邮件的公共实现（带 60s 节流），供 emailAndPassword 与 emailVerification 两处复用
async function sendVerificationEmailMessage({
  user,
  url,
  configs,
}: {
  user: any;
  url: string;
  configs: Record<string, string>;
}): Promise<void> {
  try {
    const key = String(user?.email || '').toLowerCase();
    const now = Date.now();
    const last = recentVerificationEmailSentAt.get(key) || 0;
    if (key && now - last < VERIFICATION_EMAIL_MIN_INTERVAL_MS) {
      return;
    }
    if (key) {
      recentVerificationEmailSentAt.set(key, now);
    }

    const emailService = await getEmailService(configs as any);
    const logoUrl = envConfigs.app_logo?.startsWith('http')
      ? envConfigs.app_logo
      : `${envConfigs.app_url}${envConfigs.app_logo?.startsWith('/') ? '' : '/'}${envConfigs.app_logo || ''}`;
    // Avoid blocking auth response on email sending.
    await emailService.sendEmail({
      to: user.email,
      subject: `Verify your email - ${envConfigs.app_name}`,
      react: VerifyEmail({
        appName: envConfigs.app_name,
        logoUrl,
        url,
      }),
    });
  } catch (e) {
    console.log('send verification email failed:', e);
  }
}

// Static auth options - NO database connection
// This ensures zero database calls during build time
const authOptions = {
  appName: envConfigs.app_name,
  baseURL: envConfigs.auth_url,
  secret: envConfigs.auth_secret,
  trustedOrigins: envConfigs.app_url ? [envConfigs.app_url] : [],
  user: {
    // Allow persisting custom columns on user table.
    // Without this, better-auth may ignore extra properties during create/update.
    additionalFields: {
      utmSource: {
        type: 'string',
        // Not user-editable input; we set it internally.
        input: false,
        required: false,
        defaultValue: '',
      },
      ip: {
        type: 'string',
        input: false,
        required: false,
        defaultValue: '',
      },
      locale: {
        type: 'string',
        input: false,
        required: false,
        defaultValue: '',
      },
    },
  },
  advanced: {
    database: {
      generateId: () => getUuid(),
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  logger: {
    verboseLogging: false,
    // Disable all logs during build and production
    disabled: true,
  },
};

// get auth options with configs
export async function getAuthOptions(configs: Record<string, string>) {
  const emailVerificationEnabled =
    configs.email_verification_enabled === 'true' && !!configs.resend_api_key;

  return {
    ...authOptions,
    // Add database connection only when actually needed (runtime)
    database: envConfigs.database_url
      ? drizzleAdapter(db(), {
          provider: getDatabaseProvider(envConfigs.database_provider),
          schema: schema,
        })
      : null,
    databaseHooks: {
      user: {
        create: {
          before: async (user: any, ctx: any) => {
            try {
              const ip = await getClientIp();
              const locale = await getLocale();
              
              // 添加IP和语言环境信息
              user.ip = ip;
              user.locale = locale;
              
              // 检查风控限制
              const { checkLoginLimit, recordLoginAttempt } = await import('@/shared/services/risk-control');
              const riskCheck = await checkLoginLimit();
              
              if (!riskCheck.allowed) {
                throw new Error(riskCheck.errorMessage || '登录受限');
              }
              
              // 记录成功的注册尝试
              await recordLoginAttempt(true);
              
            } catch (error) {
              console.error('用户创建前风控检查失败:', error);
              throw error;
            }
            
            return user;
          },
          after: async (user: any) => {
            try {
              // 新用户注册后授予角色；同 IP 前 N 个账号才授予初始积分
              // SEC-15：阈值后台可配置（initial_credits_max_accounts_per_ip），默认 1
              const maxAccountsPerIp =
                parseInt(
                  configs.initial_credits_max_accounts_per_ip as string,
                  10
                ) || 1;
              const ipRegisteredCount = await getUsersCountByIp(user.ip || '');
              if (ipRegisteredCount <= maxAccountsPerIp) {
                await grantCreditsForNewUser(user);
              }
              await grantRoleForNewUser(user.id);
            } catch (error) {
              console.error('新用户权益分配失败:', error);
            }
            return user;
          },
        },
      },
    },
    callbacks: {
      // 登录前检查风控
      beforeSignIn: async (signInData: any) => {
        try {
          const { checkLoginLimit } = await import('@/shared/services/risk-control');
          const riskCheck = await checkLoginLimit();
          
          if (!riskCheck.allowed) {
            return {
              error: riskCheck.errorMessage || '登录受限',
              errorCode: 'LOGIN_LIMIT_EXCEEDED',
            };
          }
          
          return {};
        } catch (error) {
          console.error('登录前风控检查失败:', error);
          // 出错时允许登录，避免影响正常用户
          return {};
        }
      },
      
      // 登录后记录尝试
      afterSignIn: async (signInData: any, response: any) => {
        try {
          const { recordLoginAttempt } = await import('@/shared/services/risk-control');
          // 记录成功的登录尝试
          await recordLoginAttempt(true, signInData.user?.id);
        } catch (error) {
          console.error('登录后记录失败:', error);
        }
        
        return response;
      },
    },
    emailAndPassword: {
      enabled: true,
      async sendVerificationEmail(
        { user, url }: { user: any; url: string; token: string },
        _request: Request
      ) {
        // 邮箱验证逻辑保持不变
        if (!emailVerificationEnabled) {
          return;
        }

        await sendVerificationEmailMessage({ user, url, configs });
      },
    },
    // SEC-09：开启开关且配置了 resend key 时，注册即发送验证邮件（灰度第一步：只发送不强制拦截）
    ...(emailVerificationEnabled
      ? {
          emailVerification: {
            sendOnSignUp: true,
            autoSignInAfterVerification: true,
            async sendVerificationEmail(
              { user, url }: { user: any; url: string },
              _request: Request
            ) {
              await sendVerificationEmailMessage({ user, url, configs });
            },
          },
        }
      : {}),
    socialProviders: await getSocialProviders(configs),
    plugins:
      configs.google_client_id && configs.google_one_tap_enabled === 'true'
        ? [oneTap()]
        : [],
  };
}

// get social providers with configs
export async function getSocialProviders(configs: Record<string, string>) {
  const providers: any = {};

  // google auth
  if (configs.google_client_id && configs.google_client_secret) {
    providers.google = {
      clientId: configs.google_client_id,
      clientSecret: configs.google_client_secret,
    };
  }

  // github auth
  if (configs.github_client_id && configs.github_client_secret) {
    providers.github = {
      clientId: configs.github_client_id,
      clientSecret: configs.github_client_secret,
    };
  }

  return providers;
}

// convert database provider to better-auth database provider
export function getDatabaseProvider(
  provider: string
): 'sqlite' | 'pg' | 'mysql' {
  switch (provider) {
    case 'sqlite':
      return 'sqlite';
    case 'turso':
      return 'sqlite';
    case 'postgresql':
      return 'pg';
    case 'mysql':
      return 'mysql';
    default:
      throw new Error(
        `Unsupported database provider for auth: ${envConfigs.database_provider}`
      );
  }
}
