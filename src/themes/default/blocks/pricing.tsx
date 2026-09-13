'use client';

import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import { Pricing as PricingType } from '@/shared/types/blocks/pricing';

import { PricingCompareTable } from './pricing-compare-table';
import { PricingPlans } from './pricing-plans';
import { PricingPromo } from './pricing-promo';
import { PricingWhyYearly } from './pricing-why-yearly';

export function Pricing({
  pricing,
  className,
  currentSubscription,
  hideHeader = false,
  compact = false,
}: {
  pricing: PricingType;
  className?: string;
  currentSubscription?: Subscription;
  hideHeader?: boolean;
  compact?: boolean;
}) {
  return (
    <>
      <PricingPromo />
      <section
        id={pricing.id}
        className={cn(
          compact ? 'py-0 md:py-0' : 'py-24 md:py-36',
          pricing.className,
          className
        )}
      >
        {!hideHeader && (
          <div className="flex flex-col items-center justify-start">
            {pricing.sr_only_title && (
              <h1 className="sr-only">{pricing.sr_only_title}</h1>
            )}
            <div className="mx-auto mb-8 flex max-w-3xl flex-col items-center sm:mb-10">
              <h1 className="text-center text-2xl font-bold tracking-tight text-card-foreground sm:text-4xl lg:text-5xl">
                {pricing.title}
              </h1>
            </div>
          </div>
        )}

        <div
          className={
            compact ? 'w-full px-0' : 'mx-auto w-full max-w-[1500px] px-2 md:px-4'
          }
        >
          <PricingPlans
            pricing={pricing}
            currentSubscription={currentSubscription}
            hideHeader={hideHeader}
            compact={compact}
          />

          <PricingWhyYearly />

          <PricingCompareTable />
        </div>
      </section>
    </>
  );
}
