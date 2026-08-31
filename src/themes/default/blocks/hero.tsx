'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { MouseEvent } from 'react';

import { Link } from '@/core/i18n/navigation';
import { LazyImage } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

const createFadeInVariant = (delay: number) => ({
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const highlightText = section.highlight_text ?? '';
  const primaryButton = section.buttons?.[0];
  const trustItems = Array.isArray(section.trust_items)
    ? section.trust_items
    : [];
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }

  const focusPromptInput = () => {
    const promptInput = document.getElementById('image-prompt');
    promptInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => promptInput?.focus(), 320);
  };

  const handlePrimaryButtonClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      primaryButton?.url?.includes('#generator') ||
      primaryButton?.url === '/create'
    ) {
      event.preventDefault();
      focusPromptInput();
    }
  };

  return (
    <>
      <section
        id={section.id}
        className={cn(
          `pt-26 pb-6 md:pt-34 md:pb-4`,
          section.className,
          className
        )}
      >
        {section.announcement && (
          <motion.div {...createFadeInVariant(0)}>
            <Link
              href={section.announcement.url || ''}
              target={section.announcement.target || '_self'}
              className="landing-input-surface group mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border p-1 pl-2 pr-2 shadow-[0_18px_50px_rgba(91,103,214,0.10)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              {section.announcement.badge ? (
                <span className="rounded-full bg-[linear-gradient(135deg,#eff4ff_0%,#f7e8ff_100%)] px-2.5 py-1 text-[11px] font-semibold text-[#6d5efc]">
                  {section.announcement.badge}
                </span>
              ) : null}

              <span className="landing-soft-text text-[13px] font-medium">
                {section.announcement.title}
              </span>

              <div className="size-6 overflow-hidden rounded-full bg-[linear-gradient(135deg,#7b7fff_0%,#cf69ff_100%)] text-white duration-500">
                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <motion.div {...createFadeInVariant(0.15)}>
            {texts && texts.length > 0 ? (
              <h1 className="landing-title mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance sm:mt-5 sm:text-6xl md:text-7xl">
                {texts[0]}
                <span className="bg-[linear-gradient(90deg,#637dff_0%,#9f67ff_48%,#ff5fa8_100%)] bg-clip-text text-transparent">
                  {highlightText}
                </span>
                {texts[1]}
              </h1>
            ) : (
              <h1 className="landing-title mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance sm:mt-5 sm:text-6xl md:text-7xl">
                {section.title}
              </h1>
            )}
          </motion.div>

          <motion.p
            {...createFadeInVariant(0.3)}
            className="landing-body mx-auto mt-4 mb-6 max-w-3xl text-[15px] leading-6 text-balance sm:text-[17px]"
            dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
          />

          {primaryButton && (
            <motion.div
              {...createFadeInVariant(0.45)}
              className="flex items-center justify-center"
            >
              <Link
                href={primaryButton.url ?? ''}
                target={primaryButton.target ?? '_self'}
                onClick={handlePrimaryButtonClick}
                className="group relative inline-flex rounded-full bg-[#dcd6e3] p-px shadow-[0_10px_26px_rgba(24,39,75,0.07)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(24,39,75,0.10)]"
              >
                <span className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#7a5cff_0%,#d34dff_48%,#ff9f67_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="landing-input-surface relative inline-flex h-11 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold">
                  <span className="flex items-center justify-center">
                    <svg
                      aria-hidden
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="hero-cta-play"
                          x1="1.5"
                          y1="1.5"
                          x2="11.5"
                          y2="11.5"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#7C5CFF" />
                          <stop offset="0.56" stopColor="#D84FFF" />
                          <stop offset="1" stopColor="#FF9B5C" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M4.15 3.2C4.15 2.77 4.62 2.5 5 2.73L9.64 5.53C10 5.75 10 6.25 9.64 6.47L5 9.27C4.62 9.5 4.15 9.23 4.15 8.8V3.2Z"
                        fill="url(#hero-cta-play)"
                      />
                    </svg>
                  </span>
                  <span className="bg-[linear-gradient(90deg,#7a5cff_0%,#d34dff_48%,#ff9f67_100%)] bg-clip-text text-transparent">
                    {primaryButton.title}
                  </span>
                </span>
              </Link>
            </motion.div>
          )}

          {trustItems.length > 0 && (
            <motion.div
              {...createFadeInVariant(0.55)}
              className="landing-muted mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium sm:text-[13px]"
            >
              {trustItems.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5">
                  <svg
                    aria-hidden
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path
                      d="M9.82 3.12C10.03 3.31 10.05 3.62 9.86 3.83L5.44 8.69C5.34 8.79 5.21 8.85 5.08 8.85C4.94 8.85 4.81 8.8 4.71 8.7L2.25 6.29C2.05 6.1 2.04 5.78 2.23 5.58C2.42 5.38 2.74 5.37 2.94 5.56L5.03 7.61L9.11 3.16C9.3 2.95 9.61 2.93 9.82 3.12Z"
                      fill="#16C784"
                    />
                  </svg>
                  <span>{item}</span>
                </span>
              ))}
            </motion.div>
          )}

          {section.tip && (
            <motion.p
              {...createFadeInVariant(0.6)}
              className="landing-muted mt-3 block text-center text-xs font-medium tracking-[0.01em] sm:text-sm"
              dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
            />
          )}

          {section.show_avatars && (
            <motion.div {...createFadeInVariant(0.75)}>
              <SocialAvatars tip={section.avatars_tip || ''} />
            </motion.div>
          )}
        </div>
      </section>
      {section.image && (
        <motion.section
          className="border-foreground/10 relative mt-8 border-y sm:mt-16"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.9,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <LazyImage
                className="border-border/25 relative z-2 hidden border dark:block"
                src={section.image_invert?.src || section.image?.src || ''}
                alt={section.image_invert?.alt || section.image?.alt || ''}
              />
              <LazyImage
                className="border-border/25 relative z-2 border dark:hidden"
                src={section.image?.src || section.image_invert?.src || ''}
                alt={section.image?.alt || section.image_invert?.alt || ''}
              />
            </div>
          </div>
        </motion.section>
      )}

      {section.background_image?.src ? (
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
          <div className="from-background/80 via-background/80 to-background absolute inset-0 z-10 bg-gradient-to-b" />
          <LazyImage
            src={section.background_image?.src || ''}
            alt={section.background_image?.alt || ''}
            className="h-full w-full object-cover opacity-20 blur-[0px]"
          />
        </div>
      ) : null}
    </>
  );
}
