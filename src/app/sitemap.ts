import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

// 只收本域真实存在的静态页面：
// - 不带 query / 参数 / 双斜杠
// - 不收 /showcases、/hairstyles、privacy、terms（robots 已 Disallow）
// - 动态详情页（blog 文章等）依赖数据库，不在此枚举
const staticPaths = [
  '',
  '/create',
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

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url; // 已统一去尾斜杠，不会产生 //
  // lastmod 取真实生成时间（构建/请求时）
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url:
        locale === defaultLocale
          ? `${appUrl}${path || '/'}`
          : `${appUrl}/${locale}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    }))
  );
}
