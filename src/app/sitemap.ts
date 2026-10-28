import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

// 只收本域真实存在且可索引的静态页面：
// - 不带 query / 参数 / 双斜杠
// - 不收 /create（noindex 工作台）、/showcases、/hairstyles、privacy、terms
// - 动态详情页（blog 文章等）依赖数据库，不在此枚举
const staticPaths = [
  '',
  '/pricing',
  '/blog',
  '/updates',
  '/models',
  '/ai-video-generator',
  '/ai-image-generator',
  '/ai-music-generator',
  '/seedance-2-free',
  '/nano-banana-pro',
  '/z-image',
  // 模型页（一个模型一页）
  '/seedance-2-5',
  '/seedance-2-0',
  '/minimax-h3',
  '/veo-3-1',
  '/kling-2-5',
  '/wan-3-0',
  '/gpt-images-2-5',
  '/flux-kontext-max',
  '/seedream-4-0',
  '/nano-banana-2',
  '/seedream-5-lite',
  '/grok-imagine-image',
];

// 各页真实内容更新时间（对应实际提交日期，避免全站同一秒刷新 lastmod 信号）
const pathLastModified: Record<string, string> = {
  '': '2026-10-28',
  '/pricing': '2026-10-28',
  '/blog': '2026-10-27',
  '/updates': '2026-10-28',
  '/models': '2026-10-28',
  '/ai-video-generator': '2026-10-27',
  '/ai-image-generator': '2026-10-27',
  '/seedance-2-free': '2026-10-24',
  '/nano-banana-pro': '2026-10-27',
  '/z-image': '2026-10-24',
  '/grok-imagine-image': '2026-10-28',
};
const modelsLastModified = '2026-10-27';
const fallbackLastModified = '2026-10-28';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url; // 已统一去尾斜杠，不会产生 //

  return locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url:
        locale === defaultLocale
          ? `${appUrl}${path || '/'}`
          : `${appUrl}/${locale}${path}`,
      lastModified: new Date(
        pathLastModified[path] ??
          (path.startsWith('/') && path !== '/' && isModelPage(path)
            ? modelsLastModified
            : fallbackLastModified)
      ),
    }))
  );
}

const MODEL_PAGE_PATHS = new Set([
  '/seedance-2-5',
  '/seedance-2-0',
  '/minimax-h3',
  '/veo-3-1',
  '/kling-2-5',
  '/wan-3-0',
  '/gpt-images-2-5',
  '/flux-kontext-max',
  '/seedream-4-0',
  '/nano-banana-2',
  '/seedream-5-lite',
  '/nano-banana-pro',
]);

function isModelPage(path: string): boolean {
  return MODEL_PAGE_PATHS.has(path);
}
