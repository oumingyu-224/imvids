'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  Copyright,
  LazyImage,
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
  const partners = footer.partners?.items || [];
  const partnersLabel = footer.partners?.title || 'Partners';
  const scrollSeconds = footer.partners?.scroll_speed_seconds || 30;
  const railRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  useEffect(() => {
    const updateMarquee = () => {
      const rail = railRef.current;
      const track = trackRef.current;

      if (!rail || !track) return;
      setShouldMarquee(track.scrollWidth >= rail.clientWidth);
    };

    updateMarquee();

    const resizeObserver = new ResizeObserver(() => {
      updateMarquee();
    });

    if (railRef.current) {
      resizeObserver.observe(railRef.current);
    }

    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [partners]);

  const renderPartnerItem = (item: (typeof partners)[number], index: number) => {
    const content = item.logo?.src ? (
      <LazyImage
        src={item.logo.src}
        alt={item.logo.alt || item.title || item.text || 'Partner'}
        className="h-5 w-auto object-contain opacity-85 transition-opacity group-hover:opacity-100 dark:opacity-80 dark:group-hover:opacity-100"
      />
    ) : (
      <span className="text-[12px] font-medium tracking-[0.08em] uppercase">
        {item.title || item.text}
      </span>
    );

    const itemClassName =
      'landing-input-surface group inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-4 text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-strong)]';

    if (item.url) {
      return (
        <Link
          key={`${item.title || item.text || 'partner'}-${index}`}
          href={item.url}
          target={item.target || '_self'}
          className={itemClassName}
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        key={`${item.title || item.text || 'partner'}-${index}`}
        className={itemClassName}
      >
        {content}
      </div>
    );
  };

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
                href={emailItem?.url || 'mailto:ai-image@chatgptimage2.app'}
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
        <div className="container py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="landing-muted shrink-0 text-[11px] font-medium tracking-[0.12em] uppercase">
              {partnersLabel}
            </div>
            <div ref={railRef} className="min-w-0 flex-1 overflow-hidden">
              {shouldMarquee ? (
                <>
                  <style jsx>{`
                    @keyframes footer-partners-marquee {
                      from {
                        transform: translate3d(0, 0, 0);
                      }
                      to {
                        transform: translate3d(calc(-50% - 0.5rem), 0, 0);
                      }
                    }
                  `}</style>
                  <div
                    className="flex w-max gap-2 will-change-transform [animation-iteration-count:infinite] [animation-name:footer-partners-marquee] [animation-timing-function:linear]"
                    style={{
                      animationDuration: `${scrollSeconds}s`,
                    }}
                  >
                    <div ref={trackRef} className="flex w-max gap-2 pr-2">
                      {partners.map(renderPartnerItem)}
                    </div>
                    <div className="flex w-max gap-2 pr-2" aria-hidden="true">
                      {partners.map((item, index) =>
                        renderPartnerItem(item, index + partners.length)
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div ref={trackRef} className="flex flex-wrap gap-2">
                  {partners.map(renderPartnerItem)}
                </div>
              )}
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
