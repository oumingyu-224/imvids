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
  hidePromo = false,
  hideWhyYearly = false,
  hideCompareTable = false,
}: {
  pricing: PricingType;
  className?: string;
  currentSubscription?: Subscription;
  hideHeader?: boolean;
  compact?: boolean;
  hidePromo?: boolean;
  hideWhyYearly?: boolean;
  hideCompareTable?: boolean;
}) {
  return (
    <>
      {!hidePromo && (
        <>
          {!compact && (
            <div aria-hidden="true" className="mt-4 h-16 md:mt-6" />
          )}
          <PricingPromo />
        </>
      )}
      <section
        id={pricing.id}
        className={cn(pricing.className, className)}
      >
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

          {!hideWhyYearly && <PricingWhyYearly />}

          {!hideCompareTable && <PricingCompareTable />}
        </div>
      </section>
    </>
  );
}
