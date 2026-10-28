import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import { JsonLd } from '@/shared/blocks/common/json-ld';

export interface BreadcrumbItem {
  name: string;
  /** 中间层级带链接；最后一级不带链接 */
  href?: string;
}

/**
 * 全站面包屑：可见 <nav aria-label="breadcrumb"><ol> 与 BreadcrumbList JSON-LD
 * 由同一份 items 驱动，保证逐字一致；最后一级为当前页（无链接、无 item URL）。
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) {
    return null;
  }

  const base = envConfigs.app_url;

  return (
    <>
      <nav aria-label="breadcrumb" className="landing-muted text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="opacity-60">
                    /
                  </span>
                ) : null}
                {!isLast && item.href ? (
                  <Link href={item.href} className="hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span aria-current="page">{item.name}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            // 最后一级不带 item URL
            ...(index < items.length - 1 && item.href
              ? { item: `${base}${item.href}` }
              : {}),
          })),
        }}
      />
    </>
  );
}
