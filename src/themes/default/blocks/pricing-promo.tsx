'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

// promo-bubble 模块：原样复制自 价格修改/sv-onetime.html
export function PricingPromo() {
  const tp = useTranslations('pages.pricing.pricing.promo');

  return (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById('pricing-plans')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      className="promo-bubble group mx-auto mb-6 mt-24 flex min-h-[126px] w-[calc(100%-1rem)] max-w-6xl cursor-pointer flex-col items-start justify-between gap-3 px-5 py-4 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[140px] sm:px-8 sm:py-5 lg:min-h-[160px] lg:px-10 md:mt-36"
    >
      <span className="relative z-10 flex min-w-0 flex-col items-start gap-3">
        <span className="promo-bubble-badge">
          <Sparkles
            className="lucide lucide-sparkles h-3 w-3"
            aria-hidden="true"
          />
          <span>{tp('badge')}</span>
        </span>
        <span className="flex max-w-4xl flex-col gap-1.5">
          <span className="promo-bubble-title">
            {tp('title')}
            <span className="promo-bubble-title-accent"> {tp('title_accent')}</span>
          </span>
          <span className="promo-bubble-copy">{tp('copy')}</span>
        </span>
      </span>
      <span className="relative z-10 flex w-full items-center justify-between gap-3">
        <span className="promo-bubble-footnote hidden sm:inline">
          {tp('footnote')}
        </span>
        <span className="promo-bubble-cta">
          {tp('cta')}
          <ArrowUpRight
            className="lucide lucide-arrow-up-right h-4 w-4"
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  );
}
