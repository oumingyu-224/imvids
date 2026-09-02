'use client';

import '@/config/style/seevideo-missing.css';
import { Fragment, useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Gem,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { Button } from '@/shared/components/ui/button';
import { CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useAppContext } from '@/shared/contexts/app';
import { getCookie } from '@/shared/lib/cookie';
import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import {
  PricingBenefit,
  PricingCurrency,
  PricingItem,
  PricingModel,
  PricingModelCredit,
  PricingModelsSection,
  Pricing as PricingType,
} from '@/shared/types/blocks/pricing';

// Helper function to get all available currencies from a pricing item
function getCurrenciesFromItem(item: PricingItem | null): PricingCurrency[] {
  if (!item) return [];

  // Always include the default currency first
  const defaultCurrency: PricingCurrency = {
    currency: item.currency,
    amount: item.amount,
    price: item.price || '',
    original_price: item.original_price || '',
  };

  // Add additional currencies if available
  if (item.currencies && item.currencies.length > 0) {
    return [defaultCurrency, ...item.currencies];
  }

  return [defaultCurrency];
}

// Helper function to select initial currency based on locale
function getInitialCurrency(
  currencies: PricingCurrency[],
  locale: string,
  defaultCurrency: string
): string {
  if (currencies.length === 0) return defaultCurrency;

  // If locale is 'zh', prefer CNY
  if (locale === 'zh') {
    const cnyCurrency = currencies.find(
      (c) => c.currency.toLowerCase() === 'cny'
    );
    if (cnyCurrency) {
      return cnyCurrency.currency;
    }
  }

  // Otherwise return default currency
  return defaultCurrency;
}

// Benefits row: icon + short title, full description in a hover tooltip
function PricingBenefits({ benefits }: { benefits: PricingBenefit[] }) {
  return (
    <div className="mb-10 flex flex-wrap items-start justify-center gap-x-8 gap-y-5 md:gap-x-12">
      {benefits.map((benefit, i) => (
        <div key={i} className="group relative">
          <div className="flex cursor-default items-center gap-2">
            {benefit.icon && (
              <SmartIcon
                name={benefit.icon}
                size={18}
                className="shrink-0 text-primary"
              />
            )}
            <span className="landing-strong text-sm font-medium">
              {benefit.title}
            </span>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-80 -translate-x-1/2 rounded-lg border bg-popover px-4 py-3 text-left text-xs shadow-xl group-hover:block">
            <p className="landing-strong font-semibold">{benefit.title}</p>
            <p className="landing-body mt-1.5 leading-relaxed text-muted-foreground">
              {benefit.description}
            </p>
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border bg-popover" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Right-side credit cell of a model row:
// number / struck-through original + discounted / "free" badge / ✕ when the
// plan does not include the model
function PricingModelCreditCell({
  credit,
  freeLabel,
  notIncludedLabel,
  highlighted,
}: {
  credit: PricingModelCredit;
  freeLabel?: string;
  notIncludedLabel?: string;
  highlighted?: boolean;
}) {
  if (credit === null || credit === undefined) {
    return (
      <span
        className="flex items-center justify-end"
        title={notIncludedLabel}
      >
        <X className="size-3.5 text-muted-foreground/40" />
      </span>
    );
  }

  const value =
    typeof credit === 'object'
      ? credit.value === 'free'
        ? freeLabel || credit.value
        : credit.value
      : credit === 'free'
        ? freeLabel || credit
        : credit;

  const valueEl = (
    <span
      className={cn(
        'text-sm font-semibold',
        highlighted ? 'text-primary' : 'landing-strong'
      )}
    >
      {value}
    </span>
  );

  if (typeof credit === 'object') {
    return (
      <span className="flex items-center justify-end gap-1.5">
        <span className="landing-muted text-xs line-through">
          {credit.original}
        </span>
        {valueEl}
      </span>
    );
  }

  return <span className="flex items-center justify-end">{valueEl}</span>;
}

// Model credits list: "model name + credits" rows, description hidden in a
// hover tooltip, collapsible, and synced with the selected plan (models not
// included in the plan render as ✕)
function PricingModels({
  models,
  plans,
  planId,
  onPlanChange,
}: {
  models: PricingModelsSection;
  plans: PricingItem[];
  planId: string | null;
  onPlanChange: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visiblePerCategory = models.visible_count ?? 8;

  const videoItems =
    models.items?.filter((m) => m.category === 'video') ?? [];
  const imageItems =
    models.items?.filter((m) => m.category === 'image') ?? [];
  const collapsible =
    videoItems.length > visiblePerCategory ||
    imageItems.length > visiblePerCategory;

  const renderCategory = (title: string, items: PricingModel[]) => {
    if (items.length === 0) return null;
    const shown = expanded ? items : items.slice(0, visiblePerCategory);

    return (
      <div className="space-y-1">
        <p className="landing-strong px-3 pt-4 text-xs font-bold tracking-wide uppercase">
          {title}
        </p>
        {shown.map((model) => (
          <div
            key={model.name}
            className="group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="landing-strong truncate text-sm font-medium">
                {model.name}
              </span>
              {model.badge && (
                <span className="shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {model.badge}
                </span>
              )}
              <Info className="size-3.5 shrink-0 text-muted-foreground/50" />
            </div>

            <PricingModelCreditCell
              credit={model.credits?.[planId ?? '']}
              freeLabel={models.free_label}
              notIncludedLabel={models.not_included_label}
            />

            <div className="pointer-events-none absolute left-3 top-full z-50 mt-1 hidden w-max max-w-md rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl group-hover:block">
              <p className="landing-body leading-relaxed text-muted-foreground">
                {model.description}
              </p>
              <span className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border bg-popover" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto mt-14 w-full max-w-5xl">
      {models.section_title && (
        <h3 className="landing-strong mb-1 text-center text-xl font-bold sm:text-2xl">
          {models.section_title}
        </h3>
      )}
      {models.section_description && (
        <p className="landing-body mb-5 text-center text-sm text-muted-foreground">
          {models.section_description}
        </p>
      )}

      {/* plan selector: credits/✕ follow the selected plan */}
      {plans.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {plans.map((plan) => (
            <button
              key={plan.product_id}
              type="button"
              onClick={() => onPlanChange(plan.product_id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                plan.product_id === planId
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {plan.title}
            </button>
          ))}
        </div>
      )}

      <div className="landing-panel rounded-2xl border py-2">
        {renderCategory(models.video_title || '', videoItems)}
        {renderCategory(models.image_title || '', imageItems)}

        {collapsible && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="landing-body flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {expanded ? models.show_less : models.show_more}
              {expanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages');
  const {
    user,
    isShowPaymentModal,
    setIsShowSignModal,
    setIsShowPaymentModal,
    configs,
  } = useAppContext();

  const [group, setGroup] = useState(() => {
    // find current pricing item
    const currentItem = pricing.items?.find(
      (i) => i.product_id === currentSubscription?.productId
    );

    const yearlyGroup = pricing.groups?.find((g) => g.name === 'yearly');
    // First look for a group with is_featured set to true
    const featuredGroup = pricing.groups?.find((g) => g.is_featured);
    // If no featured group exists, fall back to the first group
    return (
      currentItem?.group ||
      yearlyGroup?.name ||
      featuredGroup?.name ||
      pricing.groups?.[0]?.name
    );
  });

  // current pricing item
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // selected plan of the model-credits section (follows the billing group)
  const [modelPlanId, setModelPlanId] = useState<string | null>(null);

  // Currency state management for each item
  // Store selected currency and displayed item for each product_id
  const [itemCurrencies, setItemCurrencies] = useState<
    Record<string, { selectedCurrency: string; displayedItem: PricingItem }>
  >({});

  // Initialize currency states for all items
  useEffect(() => {
    if (pricing.items && pricing.items.length > 0) {
      const initialCurrencyStates: Record<
        string,
        { selectedCurrency: string; displayedItem: PricingItem }
      > = {};

      pricing.items.forEach((item) => {
        const currencies = getCurrenciesFromItem(item);
        const selectedCurrency = getInitialCurrency(
          currencies,
          locale,
          item.currency
        );

        // Create displayed item with selected currency
        const currencyData = currencies.find(
          (c) => c.currency.toLowerCase() === selectedCurrency.toLowerCase()
        );

        const displayedItem = currencyData
          ? {
              ...item,
              currency: currencyData.currency,
              amount: currencyData.amount,
              price: currencyData.price,
              original_price: currencyData.original_price,
              // Override with currency-specific payment settings if available
              payment_product_id:
                currencyData.payment_product_id || item.payment_product_id,
              payment_providers:
                currencyData.payment_providers || item.payment_providers,
            }
          : item;

        initialCurrencyStates[item.product_id] = {
          selectedCurrency,
          displayedItem,
        };
      });

      setItemCurrencies(initialCurrencyStates);
    }
  }, [pricing.items, locale]);

  // Handler for currency change
  const handleCurrencyChange = (productId: string, currency: string) => {
    const item = pricing.items?.find((i) => i.product_id === productId);
    if (!item) return;

    const currencies = getCurrenciesFromItem(item);
    const currencyData = currencies.find(
      (c) => c.currency.toLowerCase() === currency.toLowerCase()
    );

    if (currencyData) {
      const displayedItem = {
        ...item,
        currency: currencyData.currency,
        amount: currencyData.amount,
        price: currencyData.price,
        original_price: currencyData.original_price,
        // Override with currency-specific payment settings if available
        payment_product_id:
          currencyData.payment_product_id || item.payment_product_id,
        payment_providers:
          currencyData.payment_providers || item.payment_providers,
      };

      setItemCurrencies((prev) => ({
        ...prev,
        [productId]: {
          selectedCurrency: currency,
          displayedItem,
        },
      }));
    }
  };

  const handlePayment = async (item: PricingItem) => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    // Use displayed item with selected currency
    const displayedItem =
      itemCurrencies[item.product_id]?.displayedItem || item;

    if (configs.select_payment_enabled === 'true') {
      setPricingItem(displayedItem);
      setIsShowPaymentModal(true);
    } else {
      handleCheckout(displayedItem, configs.default_payment_provider);
    }
  };

  const getAffiliateMetadata = ({
    paymentProvider,
  }: {
    paymentProvider: string;
  }) => {
    const affiliateMetadata: Record<string, string> = {};

    // get Affonso referral
    if (
      configs.affonso_enabled === 'true' &&
      ['stripe', 'creem'].includes(paymentProvider)
    ) {
      const affonsoReferral = getCookie('affonso_referral') || '';
      affiliateMetadata.affonso_referral = affonsoReferral;
    }

    // get PromoteKit referral
    if (
      configs.promotekit_enabled === 'true' &&
      ['stripe'].includes(paymentProvider)
    ) {
      const promotekitReferral =
        typeof window !== 'undefined' && (window as any).promotekit_referral
          ? (window as any).promotekit_referral
          : getCookie('promotekit_referral') || '';
      affiliateMetadata.promotekit_referral = promotekitReferral;
    }

    return affiliateMetadata;
  };

  const handleCheckout = async (
    item: PricingItem,
    paymentProvider?: string
  ) => {
    try {
      if (!user) {
        setIsShowSignModal(true);
        return;
      }

      const affiliateMetadata = getAffiliateMetadata({
        paymentProvider: paymentProvider || '',
      });

      const params = {
        product_id: item.product_id,
        currency: item.currency,
        locale: locale || 'en',
        payment_provider: paymentProvider || '',
        metadata: affiliateMetadata,
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setPricingItem(null);
        setIsShowSignModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`request failed with status ${response.status}`);
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        throw new Error(message);
      }

      const { checkoutUrl } = data;
      if (!checkoutUrl) {
        throw new Error('checkout url not found');
      }

      window.location.href = checkoutUrl;
    } catch (e: any) {
      console.log('checkout failed: ', e);
      toast.error('checkout failed: ' + e.message);

      setIsLoading(false);
      setProductId(null);
    }
  };

  useEffect(() => {
    if (pricing.items) {
      const visibleItems = pricing.items.filter(
        (item) => !item.group || item.group === group
      );
      const featuredItem = visibleItems.find((i) => i.is_featured);
      setProductId(
        featuredItem?.product_id ||
          visibleItems[0]?.product_id ||
          pricing.items[0]?.product_id
      );
      setIsLoading(false);
    }
  }, [pricing.items, group]);

  // plans of the current billing group; the model-credits section shows a
  // ✕ for models not included in the selected plan
  const groupItems =
    pricing.items?.filter((i) => !i.group || i.group === group) ?? [];
  const effectiveModelPlanId = groupItems.some(
    (i) => i.product_id === modelPlanId
  )
    ? modelPlanId
    : groupItems.find((i) => i.is_featured)?.product_id ||
      groupItems[0]?.product_id ||
      null;

  return (
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

      <div className={compact ? 'w-full px-0' : 'container'}>
        {!compact &&
          pricing.benefits &&
          pricing.benefits.length > 0 && (
            <PricingBenefits benefits={pricing.benefits} />
          )}

        {pricing.groups && pricing.groups.length > 0 && (
          <div
            id="pricing-plans"
            className={cn(
              'flex w-full flex-col items-center',
              compact ? 'mb-3 scroll-mt-24' : 'scroll-mt-24'
            )}
          >
            <div
              className={cn(
                'flex items-center rounded-full bg-card p-0.5',
                compact ? '' : 'mb-4 sm:mb-10 sm:p-1'
              )}
            >
              {pricing.groups.map((item, i) => {
                const isActive = (item.name || '') === group;
                return (
                  <div key={i} className="relative">
                    {item.label && (
                      <div className="absolute -right-1 -top-2.5 z-10 sm:-right-2 sm:-top-3">
                        <div className="rounded-md border border-[hsl(var(--primary))] bg-black/90 px-1 py-0.5 text-[8px] font-bold text-[hsl(var(--primary))] shadow-[0_0_6px_hsl(var(--primary)/0.6),0_0_12px_hsl(var(--primary)/0.3)] sm:px-1.5 sm:text-[10px] md:px-2 md:text-xs">
                          {item.label}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setGroup(item.name || '')}
                      className={cn(
                        'whitespace-nowrap rounded-full px-3 py-2 text-xs transition-all duration-200 sm:px-6 sm:py-2.5 sm:text-sm md:px-8 md:py-3 md:text-base',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md sm:scale-105'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {item.title}
                    </button>
                  </div>
                );
              })}
            </div>
            {!hideHeader && pricing.description && (
              <div className="mb-6 text-center md:mb-12">
                <p className="text-sm font-medium text-primary sm:text-base">
                  {pricing.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'mx-auto w-full',
            compact
              ? 'grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:items-center'
              : 'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-8 pt-8 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:pt-0 lg:gap-8'
          )}
        >
          {pricing.items?.map((item: PricingItem, idx) => {
            if (item.group && item.group !== group) {
              return null;
            }

            let isCurrentPlan = false;
            if (
              currentSubscription &&
              currentSubscription.productId === item.product_id
            ) {
              isCurrentPlan = true;
            }

            // Get currency state for this item
            const currencyState = itemCurrencies[item.product_id];
            const displayedItem = currencyState?.displayedItem || item;
            const selectedCurrency =
              currencyState?.selectedCurrency || item.currency;
            const currencies = getCurrenciesFromItem(item);

            return (
              <div
                key={idx}
                className={cn(
                  'relative mx-auto flex w-full flex-shrink-0 snap-center flex-col bg-[hsl(var(--surface-1))] p-4 transition-all duration-300',
                  !compact &&
                    'min-w-[80%] max-w-[80%] md:min-w-0 md:max-w-none',
                  compact && 'rounded-2xl border',
                  idx === 0 &&
                    'order-1 md:order-1 rounded-sm border border-[hsl(var(--border))] hover:shadow-lg md:p-6',
                  item.is_featured &&
                    'order-2 md:order-2 z-10 scale-[1.02] rounded-2xl border-2 border-transparent md:scale-105 md:p-8',
                  idx === 2 &&
                    'order-3 md:order-3 rounded-2xl border border-transparent shadow-xl hover:shadow-2xl md:p-6'
                )}
              >
                {item.label && (
                  <div className="absolute -right-2 -top-2 z-30">
                    <div className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      {item.label}
                    </div>
                  </div>
                )}

                <CardHeader className={cn(compact ? 'p-4 pb-3 sm:p-4 sm:pb-3' : 'p-6 pb-4')}>
                  <div className="mb-3">
                    <h3 className="text-2xl font-semibold md:text-3xl">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight md:text-4xl">
                        {displayedItem.price}
                      </span>
                      {displayedItem.unit && (
                        <span className="text-base text-muted-foreground md:text-lg">
                          {displayedItem.unit}
                        </span>
                      )}
                      {displayedItem.original_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {displayedItem.original_price}
                        </span>
                      )}
                      {displayedItem.discount_text && (
                        <span className="text-xs font-semibold text-orange-500">
                          {displayedItem.discount_text}
                        </span>
                      )}
                    </div>
                    {displayedItem.total_price_note && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {displayedItem.total_price_note}
                      </div>
                    )}
                  </div>

                  {(item.credits != null || item.credits_label) && (
                    <div className="mb-3 rounded-xl border p-3">
                      <div className="md:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <Gem
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              item.credits_label && 'animate-pulse'
                            )}
                            style={{ color: item.credit_accent }}
                          />
                          <span
                            className={cn(
                              item.interval === 'one-time'
                                ? 'text-lg font-bold'
                                : 'text-lg font-bold sm:text-xl',
                              item.credits_label && 'animate-pulse'
                            )}
                          >
                            {item.credits_display ??
                              item.credits_label ??
                              item.credits!.toLocaleString()}
                          </span>
                          {item.credits_extra && (
                            <span className="text-lg font-bold">
                              <span className="text-lg text-muted-foreground">
                                +
                              </span>
                              {item.credits_extra}
                            </span>
                          )}
                          {!item.credits_label && (
                            <span className="text-[11px] text-muted-foreground">
                              {t('credits_unit')}
                            </span>
                          )}
                        </div>
                        {item.credits_videos && (
                          <div
                            className="mt-2 flex items-center justify-center border-t pt-2"
                            style={
                              item.credit_accent
                                ? { borderColor: `${item.credit_accent}22` }
                                : undefined
                            }
                          >
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                !item.credits_label && 'text-foreground'
                              )}
                            >
                              {item.credits_videos}
                            </span>
                          </div>
                        )}
                        {item.per_video_price && (
                          <div
                            className={cn(
                              'mt-2 flex items-center justify-center border-t pt-2',
                              item.credits_label ? 'gap-2' : 'gap-1.5'
                            )}
                            style={
                              item.credit_accent
                                ? { borderColor: `${item.credit_accent}22` }
                                : undefined
                            }
                          >
                            <span className="text-lg font-bold">
                              {item.per_video_price}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              /video
                            </span>
                            {item.per_video_discount && (
                              <span className="text-[10px] font-semibold text-orange-500">
                                {item.per_video_discount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Gem
                              className={cn(
                                'h-4 w-4 flex-shrink-0',
                                item.credits_label && 'animate-pulse'
                              )}
                              style={{ color: item.credit_accent }}
                            />
                            <span className="text-lg font-bold sm:text-xl">
                              {item.credits_display ??
                                item.credits_label ??
                                item.credits!.toLocaleString()}
                            </span>
                            {item.credits_extra && (
                              <span className="text-lg font-bold">
                                <span className="text-lg text-muted-foreground">
                                  +
                                </span>
                                {item.credits_extra}
                              </span>
                            )}
                            {!item.credits_label && (
                              <span className="text-[11px] text-muted-foreground">
                                {t('credits_unit')}
                              </span>
                            )}
                          </div>
                          {item.credits_videos && (
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                !item.credits_label && 'text-foreground'
                              )}
                            >
                              {item.credits_videos}
                            </span>
                          )}
                        </div>
                        {item.per_video_price && (
                          <div
                            className={cn(
                              'mt-2 flex items-center justify-center border-t pt-2',
                              item.credits_label ? 'gap-2' : 'gap-1.5'
                            )}
                            style={
                              item.credit_accent
                                ? { borderColor: `${item.credit_accent}22` }
                                : undefined
                            }
                          >
                            <span className="text-lg font-bold">
                              {item.per_video_price}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              /video
                            </span>
                            {item.per_video_discount && (
                              <span className="text-[10px] font-semibold text-orange-500">
                                {item.per_video_discount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currencies.length > 1 && (
                    <Select
                      value={selectedCurrency}
                      onValueChange={(currency) =>
                        handleCurrencyChange(item.product_id, currency)
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="landing-input-surface h-6 min-w-[60px] border px-2 text-xs shadow-none"
                      >
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.currency}
                            value={currency.currency}
                            className="text-xs"
                          >
                            {currency.currency.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {item.tip && (
                    <span className="landing-muted text-sm">
                      {item.tip}
                    </span>
                  )}

                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className={cn(
                        'mt-4 h-10 w-full rounded-xl border px-4 py-2 text-sm font-medium',
                        'bg-muted text-muted-foreground opacity-60'
                      )}
                    >
                      <span className="text-sm">
                        {t('current_plan')}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePayment(item)}
                      disabled={isLoading}
                      className={cn(
                        'h-10 w-full rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50',
                        compact ? 'mt-3' : 'mt-4',
                        item.is_featured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {isLoading && item.product_id === productId ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span className="block">{t('processing')}</span>
                        </>
                      ) : (
                        <>
                          {item.button?.icon && (
                            <SmartIcon
                              name={item.button?.icon as string}
                              className="size-4"
                            />
                          )}
                          <span className="block">{item.button?.title}</span>
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>

                <CardContent
                  className={cn(
                    compact ? 'space-y-2 px-4 pb-4' : 'space-y-4 px-6 pb-6'
                  )}
                >
                  <hr className="landing-divider border-dashed" />

                  {item.features_title && (
                    <p className="landing-strong text-sm font-medium">
                      {item.features_title}
                    </p>
                  )}
                  {/* compact highlights only — full model details live in
                      the dedicated model-credits section below */}
                  <ul
                    className={cn(
                      'landing-body list-outside text-sm',
                      compact ? 'space-y-2' : 'space-y-3'
                    )}
                  >
                    {(item.highlights ??
                      item.features?.filter(
                        (f): f is string => typeof f === 'string'
                      ) ??
                      []
                    ).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            );
          })}
        </div>

        {!compact && pricing.models?.items && pricing.models.items.length > 0 && (
          <PricingModels
            models={pricing.models}
            plans={groupItems}
            planId={effectiveModelPlanId}
            onPlanChange={setModelPlanId}
          />
        )}
      </div>

      <PaymentModal
        isLoading={isLoading}
        pricingItem={pricingItem}
        onCheckout={(item, paymentProvider) =>
          handleCheckout(item, paymentProvider)
        }
      />
    </section>
  );
}
