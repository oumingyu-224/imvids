'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Menu, Sparkles, X } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

const HEADER_TOP_PROMO_SESSION_KEY = 'header-top-promo-dismissed';

function shouldHideItem(item: NavItem) {
  if (item.hidden) return true;
  const value = `${item.title || ''} ${item.url || ''}`.toLowerCase();
  return value.includes('seedance') || value.includes('topics');
}

function filterNavItems(items?: NavItem[]) {
  return (items || [])
    .filter((item) => !shouldHideItem(item))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !shouldHideItem(child)),
    }));
}

function HeaderTopPromo({
  text,
  buttonText,
  href,
  target,
}: {
  text?: string;
  buttonText?: string;
  href?: string;
  target?: string;
}) {
  const [closed, setClosed] = useState(false);

  useLayoutEffect(() => {
    try {
      setClosed(
        window.sessionStorage.getItem(HEADER_TOP_PROMO_SESSION_KEY) === '1'
      );
    } catch {
      setClosed(false);
    }
  }, []);

  const handleClose = () => {
    try {
      window.sessionStorage.setItem(HEADER_TOP_PROMO_SESSION_KEY, '1');
    } catch {}
    setClosed(true);
  };

  if (closed) {
    return null;
  }

  return (
    <div className="hidden h-10 bg-[linear-gradient(90deg,#0d7df2_0%,#7b3ff5_50%,#c600ff_100%)] text-white md:block">
      <div className="relative container flex h-full items-center justify-center px-4 text-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-4 items-center justify-center">
            <Sparkles className="size-3.5" />
          </span>
          {text ? <span>{text}</span> : null}
          {buttonText ? (
            <Link
              href={href || '/pricing'}
              target={target || '_self'}
              className="ml-2 rounded-md bg-white px-3 py-1 text-xs font-semibold text-[#5f22ff]"
            >
              {buttonText}
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="absolute right-0 flex size-10 items-center justify-center text-white/90"
          aria-label="Close promo"
          onClick={handleClose}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Header({ header }: { header: HeaderType }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRafRef = useRef<number | null>(null);
  const navItems = useMemo(
    () => filterNavItems(header.nav?.items),
    [header.nav]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafRef.current != null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        setIsScrolled(window.scrollY > 6);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const isItemActive = (item: NavItem) => {
    if (!item.url) return false;
    return pathname === item.url || pathname.startsWith(`${item.url}/`);
  };

  return (
    <header
      className={cn(
        'landing-surface-header fixed inset-x-0 top-0 z-50',
        isScrolled &&
          'landing-surface-header-scrolled border-b shadow-[0_8px_28px_rgba(15,23,42,0.06)]'
      )}
    >
      <HeaderTopPromo
        text={header.topbanner?.text}
        buttonText={header.topbanner?.buttonText}
        href={header.topbanner?.href}
        target={header.topbanner?.target}
      />

      <div
        className={cn(
          'bg-transparent',
          isMobileMenuOpen &&
            'bg-[var(--landing-header-bg)] lg:bg-transparent'
        )}
      >
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-10">
              {header.brand ? <BrandLogo brand={header.brand} /> : null}

              <nav className="hidden items-center gap-8 lg:flex">
                {navItems.map((item, idx) => (
                  <div key={idx} className="group relative">
                    {!item.children || item.children.length === 0 ? (
                      <Link
                        href={item.url || ''}
                        target={item.target || '_self'}
                        className={cn(
                          'landing-nav-text landing-nav-text-hover flex items-center gap-1.5 text-[15px] font-medium transition-colors',
                          isItemActive(item) && 'text-[var(--landing-nav-text-hover)]'
                        )}
                      >
                        {idx === 0 ? (
                          <span className="text-base leading-none">🔥</span>
                        ) : item.icon ? (
                          <SmartIcon
                            name={item.icon as string}
                            className="landing-nav-text size-4"
                          />
                        ) : null}
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="landing-nav-text flex items-center gap-1.5 text-[15px] font-medium"
                        >
                          {item.icon ? (
                            <SmartIcon
                              name={item.icon as string}
                              className="landing-nav-text size-4"
                            />
                          ) : null}
                          <span>{item.title}</span>
                          <ChevronDown className="landing-soft-text size-3.5" />
                        </button>

                        <div className="landing-popover invisible absolute top-full left-0 z-50 mt-3 w-72 rounded-2xl border p-2 opacity-0 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all group-hover:visible group-hover:opacity-100">
                          {item.children.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.url || ''}
                              target={subItem.target || '_self'}
                              className="landing-popover-hover block rounded-xl px-3 py-3"
                            >
                              <div className="landing-strong flex items-center gap-2 text-sm font-medium">
                                {subItem.icon ? (
                                  <SmartIcon
                                    name={subItem.icon as string}
                                    className="landing-soft-text size-4"
                                  />
                                ) : null}
                                {subItem.title}
                              </div>
                              {subItem.description ? (
                                <p className="landing-soft-text mt-1 text-xs leading-5">
                                  {subItem.description}
                                </p>
                              ) : null}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              {header.show_locale ? <LocaleSelector type="button" /> : null}

              {header.show_theme ? (
                <div className="landing-input-surface flex size-8 items-center justify-center rounded-full border">
                  <ThemeToggler />
                </div>
              ) : null}

              {header.show_sign ? (
                <SignUser
                  userNav={header.user_nav}
                  showSignUp
                  containerClassName="items-center gap-3 space-y-0"
                  signedInActionsClassName="items-center gap-3"
                  signButtonSize="sm"
                  signInClassName="landing-input-surface ml-0 h-10 rounded-xl border px-5 text-sm font-medium shadow-none hover:opacity-90"
                  signUpClassName="h-10 rounded-xl bg-[#1773ea] px-5 text-sm font-medium text-white shadow-none hover:bg-[#1569d5]"
                  avatarButtonClassName="landing-input-surface border"
                />
              ) : null}
            </div>

            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="landing-input-surface landing-nav-text flex size-10 items-center justify-center rounded-lg border lg:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div className="landing-divider min-h-[calc(100svh-4rem)] border-t bg-[var(--landing-header-bg)] py-4 lg:hidden">
              <Accordion type="single" collapsible className="space-y-1">
                {navItems.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={item.title || ''}
                    className="landing-divider border-b"
                  >
                    {item.children && item.children.length > 0 ? (
                      <>
                        <AccordionTrigger className="landing-strong py-3 text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2">
                            {item.icon ? (
                              <SmartIcon
                                name={item.icon as string}
                                className="landing-soft-text size-4"
                              />
                            ) : null}
                            {item.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="space-y-1">
                            {item.children.map((subItem, subIdx) => (
                              <Link
                                key={subIdx}
                                href={subItem.url || ''}
                                target={subItem.target || '_self'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="landing-soft-text landing-popover-hover block rounded-xl px-3 py-2 text-sm hover:text-[var(--landing-nav-text-hover)]"
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </>
                    ) : (
                      <Link
                        href={item.url || ''}
                        target={item.target || '_self'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="landing-strong flex items-center gap-2 py-3 text-sm font-medium"
                      >
                        {item.icon ? (
                          <SmartIcon
                            name={item.icon as string}
                            className="landing-soft-text size-4"
                          />
                        ) : null}
                        {item.title}
                        {item.badge ? (
                          <span className="ml-0.5 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LocaleSelector type="button" />
                  {header.show_theme ? <ThemeToggler /> : null}
                </div>
                {header.show_sign ? (
                  <SignUser
                    userNav={header.user_nav}
                    showSignUp
                    containerClassName="items-center gap-2 space-y-0"
                    signedInActionsClassName="order-3 flex w-full items-start justify-between gap-3"
                    signButtonSize="sm"
                    signInClassName="landing-input-surface ml-0 h-9 rounded-lg border px-4 text-sm font-medium"
                    signUpClassName="h-9 rounded-lg bg-[#1773ea] px-4 text-sm font-medium text-white"
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
