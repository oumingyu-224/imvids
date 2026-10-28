import { Link } from '@/core/i18n/navigation';
import { MODEL_PAGES } from '@/config/landing-pages';
import { cn } from '@/shared/lib/utils';

/**
 * 模型页底部「相关系链接区」：
 * - 3~4 个同系列/同分类模型页（锚文本为完整模型名）
 * - 1 个功能页（视频模型链 /ai-video-generator，图像模型链 /ai-image-generator）
 * 数据全部来自 MODEL_PAGES 注册表，不在页面手写。
 */
export function RelatedModels({
  currentSlug,
  title,
  videoLabel = 'AI Video Generator',
  imageLabel = 'AI Image Generator',
}: {
  currentSlug: string;
  title?: string;
  /** 功能页锚文本（含完整名称），由 i18n 注入 */
  videoLabel?: string;
  imageLabel?: string;
}) {
  const current = MODEL_PAGES.find((m) => m.slug === currentSlug);
  if (!current) {
    return null;
  }

  // 同系列优先，不足 4 个用同分类邻近模型补齐
  const seriesOthers = MODEL_PAGES.filter(
    (m) => m.series === current.series && m.slug !== currentSlug
  );
  const categoryOthers = MODEL_PAGES.filter(
    (m) =>
      m.category === current.category &&
      m.slug !== currentSlug &&
      m.series !== current.series
  );
  const related = [...seriesOthers, ...categoryOthers].slice(0, 4);

  if (!related.length) {
    return null;
  }

  const functionHref =
    current.category === 'video' ? '/ai-video-generator' : '/ai-image-generator';
  const functionLabel =
    current.category === 'video' ? videoLabel : imageLabel;

  const links = [
    ...related.map((m) => ({ key: m.slug, href: `/${m.slug}`, label: m.name })),
    { key: 'function', href: functionHref, label: functionLabel },
  ];

  return (
    <section id="related-models" className="py-10 md:py-14">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {title ? (
          <h2 className="landing-title mb-5 text-center text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h2>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                'landing-input-surface inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors',
                'text-[var(--landing-muted)] hover:text-[var(--landing-strong)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
