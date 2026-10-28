'use client';

import { Send } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  Copyright,
  LocaleSelector,
  // ThemeToggler, // 主题切换已禁用（仅暗色模式）
} from '@/shared/blocks/common';
import { NavItem } from '@/shared/types/blocks/common';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export function Footer({ footer }: { footer: FooterType }) {
  const emailItem = footer.social?.items?.find((item) =>
    item.url?.startsWith('mailto:')
  );
  const navItems = (footer.nav?.items || [])
    .filter((item) => !item.hidden)
    .map((item) => ({
      ...item,
      children: item.children?.filter((subItem) => !subItem.hidden),
    }));

  return (
    <footer
      id={footer.id}
      className={`landing-surface-footer border-t ${footer.className || ''}`}
    >
      <div className="bg-transparent">
        <div className="container py-14">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
            <div className="space-y-5">
              {footer.brand ? <BrandLogo brand={footer.brand} /> : null}

              {footer.brand?.description ? (
                <p
                  className="landing-soft-text max-w-sm text-[15px] leading-8"
                  dangerouslySetInnerHTML={{ __html: footer.brand.description }}
                />
              ) : null}

              <a
                href={emailItem?.url || 'mailto:support@oddbeam.com'}
                target={emailItem?.target || '_self'}
                aria-label={emailItem?.title || 'Subscribe'}
                className="inline-flex size-11 items-center justify-center rounded-xl bg-[#1773ea] text-white shadow-[0_12px_24px_rgba(23,115,234,0.22)] transition-transform hover:-translate-y-0.5"
              >
                <Send className="size-4" />
              </a>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {navItems.map((item, idx) => (
                <div key={idx}>
                  <div className="landing-strong mb-4 text-xs font-semibold tracking-[0.08em] uppercase">
                    {item.title}
                  </div>
                  <div className="space-y-3">
                    {item.children?.map((subItem, iidx) => (
                      <Link
                        key={iidx}
                        href={subItem.url || ''}
                        target={subItem.target || ''}
                        className="landing-soft-text block text-sm transition-colors hover:text-[var(--landing-nav-text-hover)]"
                      >
                        {subItem.title || ''}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <div className="flex items-center gap-3">
              {/* 主题切换已禁用（仅暗色模式）：恢复时取消注释
              {footer.show_theme !== false ? (
                <ThemeToggler type="toggle" />
              ) : null}
              */}
              {footer.show_locale !== false ? (
                <LocaleSelector type="button" />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="landing-divider-soft border-t">
        <div className="container py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {footer.copyright ? (
                <p
                  className="landing-body text-sm"
                  dangerouslySetInnerHTML={{ __html: footer.copyright }}
                />
              ) : footer.brand ? (
                <Copyright brand={footer.brand} />
              ) : null}

              {footer.agreement?.items?.length ? (
                <div className="flex flex-wrap items-center gap-4">
                  {footer.agreement.items.map(
                    (item: NavItem, index: number) => (
                      <Link
                        key={index}
                        href={item.url || ''}
                        target={item.target || ''}
                        className="landing-body text-sm text-[#1773ea] transition-colors hover:text-[#1569d5]"
                      >
                        {item.title || ''}
                      </Link>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
