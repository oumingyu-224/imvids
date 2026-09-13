'use client';

import { CircleCheck, DollarSign, Rocket, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PricingWhyYearly() {
  const t = useTranslations('pages.pricing.messages');

  return (
    <section id="why-choose-yearly" className="mb-8 mt-24">
      <h2 className="landing-strong mb-6 text-center text-2xl font-bold sm:text-3xl">
        {t('why_title')}
      </h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-2 sm:grid-cols-2 sm:gap-6 sm:px-0 lg:grid-cols-3">
        <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
          <div className="mb-3 sm:mb-4">
            <DollarSign className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>
          <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            {t('why_value_title')}
          </h3>
          <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_value_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_value_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_value_3')}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
          <div className="mb-3 sm:mb-4">
            <Rocket className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>
          <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            {t('why_discount_title')}
          </h3>
          <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_discount_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_discount_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_discount_3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_discount_4')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_discount_5')}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
          <div className="mb-3 sm:mb-4">
            <Star className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>
          <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            {t('why_perk_title')}
          </h3>
          <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_perk_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_perk_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_perk_3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{t('why_perk_4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
