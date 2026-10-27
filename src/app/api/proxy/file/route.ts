import { NextRequest, NextResponse } from 'next/server';

import dns from 'node:dns/promises';

// SEC-11：SSRF 加固 —— 解析后验证 + redirect: 'manual' 逐跳复检

const MAX_REDIRECTS = 5;

function isPrivateIPv4(ip: string): boolean {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const parts = m.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return true; // 非法格式一律视为私有（拒绝）
  const [a, b] = parts;
  return (
    a === 0 || // 0.0.0.0/8
    a === 10 || // 10/8
    a === 127 || // 127/8 环回
    (a === 100 && b >= 64 && b <= 127) || // 100.64/10 CGNAT
    (a === 169 && b === 254) || // 169.254/16 链路本地
    (a === 172 && b >= 16 && b <= 31) || // 172.16/12
    (a === 192 && b === 168) || // 192.168/16
    (a === 192 && b === 0) || // 192.0.0.0/24 与 192.0.2.0/24
    (a === 198 && (b === 18 || b === 19)) || // 198.18/15
    (a === 203 && b === 0) || // 203.0.113.0/24
    a >= 224 // 组播与保留段
  );
}

function isPrivateIPv6(ip: string): boolean {
  const addr = ip.split('%')[0].toLowerCase(); // 去掉 zone id
  if (addr === '::' || addr === '::1') return true; // 未指定/环回
  // IPv4-mapped（::ffff:127.0.0.1 等）
  const mapped = addr.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  const first = addr.split(':')[0];
  const h = parseInt(first, 16);
  if (Number.isNaN(h)) return true; // 非法格式一律拒绝
  if ((h & 0xfe00) === 0xfc00) return true; // fc00::/7 唯一本地
  if ((h & 0xffc0) === 0xfe80) return true; // fe80::/10 链路本地
  if ((h & 0xff00) === 0xff00) return true; // 组播
  return false;
}

function isPrivateIp(ip: string): boolean {
  return ip.includes(':') ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

// SEC-11：解析后验证 —— DNS 解析出全部 A/AAAA 记录，逐个校验非环回/非私有/非链路本地
async function isAllowedProxyUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return false;
  }

  let addresses: string[];
  try {
    const result = await dns.lookup(hostname, { all: true, verbatim: true });
    addresses = result.map((r) => r.address);
  } catch {
    return false; // 解析失败直接拒绝
  }

  if (!addresses.length) {
    return false;
  }

  return addresses.every((addr) => !isPrivateIp(addr));
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // SEC-11：redirect: 'manual'，每一跳都重新做解析后验证，防 302 跳内网
    let currentUrl = url;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isAllowedProxyUrl(currentUrl))) {
        return new NextResponse('Invalid url parameter', { status: 400 });
      }

      const response = await fetch(currentUrl, { redirect: 'manual' });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return new NextResponse('Invalid redirect response', {
            status: 502,
          });
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      if (!response.ok) {
        return new NextResponse('Failed to fetch file', {
          status: response.status,
        });
      }

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';

      if (!contentType.startsWith('image/')) {
        return new NextResponse('Unsupported file type', { status: 400 });
      }

      return new NextResponse(response.body, {
        headers: {
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return new NextResponse('Too many redirects', { status: 508 });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
