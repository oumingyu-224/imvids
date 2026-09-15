'use client';

import enPricingMessages from '@/config/locale/messages/en/pages/pricing.json';
import zhPricingMessages from '@/config/locale/messages/zh/pages/pricing.json';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Pricing as PricingData } from '@/shared/types/blocks/pricing';
import { Pricing as PricingBlock } from '@/themes/default/blocks/pricing';

import { useLocale } from 'next-intl';

// Shared pricing dialog for all workbenches.
// Shows the first two sections of the pricing page (promo banner + title +
// plan cards) and hides the rest (why-yearly + compare table).
export function PricingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const locale = useLocale();
  const pricingConfig = (
    locale === 'zh'
      ? zhPricingMessages.pricing
      : enPricingMessages.pricing
  ) as PricingData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full !max-w-none rounded-[26px] p-0 sm:max-w-[1600px] sm:rounded-2xl sm:p-5 sm:pt-0"
        overlayClassName="bg-black/25 backdrop-blur-sm"
      >
        <DialogTitle className="sr-only">{pricingConfig.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {pricingConfig.description}
        </DialogDescription>
        <div className="custom-scrollbar max-h-[calc(100vh-8rem)] overflow-y-auto">
          <PricingBlock
            pricing={pricingConfig}
            className="pt-0 sm:pt-2"
            hideWhyYearly
            hideCompareTable
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
