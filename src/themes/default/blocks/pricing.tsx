'use client';

import '@/config/style/seevideo-missing.css';
import { Fragment, useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Crown,
  DollarSign,
  Gem,
  Info,
  Loader2,
  Rocket,
  Star,
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
  accent,
}: {
  credit: PricingModelCredit;
  freeLabel?: string;
  notIncludedLabel?: string;
  highlighted?: boolean;
  accent?: string;
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
      style={accent ? { color: accent } : undefined}
    >
      {value}
    </span>
  );

  const gemEl = accent ? (
    <Gem className="size-3 shrink-0" style={{ color: accent }} />
  ) : null;

  if (typeof credit === 'object') {
    return (
      <span className="flex shrink-0 items-center justify-end gap-1.5">
        <span className="landing-muted text-xs line-through">
          {credit.original}
        </span>
        {valueEl}
        {gemEl}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center justify-end gap-1.5">
      {valueEl}
      {gemEl}
    </span>
  );
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

// In-card model credits list: shown inside each pricing card, credits keyed by
// that card's own product_id
function PricingCardModels({
  models,
  planId,
  accent,
}: {
  models: PricingModelsSection;
  planId: string;
  accent?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = models.items ?? [];
  const visibleCount = models.visible_count ?? 8;
  const shown = expanded ? items : items.slice(0, visibleCount);
  const collapsible = items.length > visibleCount;

  if (items.length === 0) return null;

  return (
    <div className="landing-panel mt-6 rounded-lg p-4">
      <h4 className="mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        {models.card_title || models.section_title}
      </h4>
      <div className="space-y-2 text-xs sm:text-sm">
        {shown.map((model) => (
          <div
            key={model.name}
            className="group relative flex items-center justify-between gap-2"
          >
            <div className="flex min-w-0 shrink items-center gap-1">
              <span className="break-words text-foreground">{model.name}</span>
              {model.description && (
                <Info className="size-3 shrink-0 text-muted-foreground" />
              )}
            </div>
            <PricingModelCreditCell
              credit={model.credits?.[planId]}
              freeLabel={models.free_label}
              notIncludedLabel={models.not_included_label}
              accent={accent}
            />
            {model.description && (
              <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-full rounded-lg border bg-popover px-3 py-2 text-xs text-foreground shadow-xl group-hover:block">
                {model.description}
              </div>
            )}
          </div>
        ))}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="landing-input-surface mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent"
        >
          <span>
            {expanded
              ? models.card_show_less || models.show_less
              : models.card_show_more || models.show_more}
          </span>
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      )}
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

      <div
        className={
          compact ? 'w-full px-0' : 'mx-auto w-full max-w-[1500px] px-2 md:px-4'
        }
      >
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
                        <div className="rounded-full border-0 bg-gradient-to-r from-orange-400 to-amber-300 px-2 py-1 text-[9px] font-bold text-black shadow-[0_4px_16px_rgba(255,186,107,0.6)] sm:px-2.5 sm:text-[10px] md:px-3 md:text-xs">
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
            {!hideHeader && (pricing.groups.find((item) => item.name === group)?.description) && (
              <div className="mb-6 text-center md:mb-12">
                <p className="text-sm font-medium text-primary sm:text-base">
                  {pricing.groups.find((item) => item.name === group)?.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'mx-auto w-full',
            compact
              ? cn(
                  'grid grid-cols-1 gap-3 sm:gap-4',
                  group === 'one-time'
                    ? 'lg:max-w-[1040px] lg:grid-cols-2 lg:items-stretch'
                    : 'lg:grid-cols-3 lg:items-center'
                )
              : cn(
                  'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-8 pt-8 md:grid md:snap-none md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:pt-0 lg:gap-8',
                  group === 'one-time'
                    ? 'md:max-w-[1040px] md:grid-cols-2'
                    : 'md:grid-cols-3'
                )
          )}
        >
          {groupItems.map((item: PricingItem, idx) => {
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
            const featuredGradient =
              item.group === 'one-time'
                ? 'linear-gradient(148deg, #ffb475 0%, #ebecff 100%)'
                : 'linear-gradient(148deg, #ffba6b 0%, #ffd685 40%, #fff5eb 100%)';
            const featuredShadow =
              item.group === 'one-time'
                ? '0 0 12px rgba(255, 180, 117, 0.2), 0 0 24px rgba(235, 236, 255, 0.1)'
                : '0 0 20px rgba(255, 186, 107, 0.4), 0 0 40px rgba(255, 214, 133, 0.2)';
            const featuredCreditBackground =
              item.group === 'one-time'
                ? 'linear-gradient(148deg, rgba(255, 180, 117, 0.05) 0%, rgba(235, 236, 255, 0.05) 100%)'
                : 'linear-gradient(148deg, rgba(255, 186, 107, 0.05) 0%, rgba(255, 214, 133, 0.05) 40%, rgba(255, 245, 235, 0.05) 100%)';

            return (
              <div
                key={idx}
                className={cn(
                  'relative mx-auto flex w-full flex-shrink-0 snap-center flex-col rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 transition-all duration-300',
                  !compact &&
                    'min-w-[80%] max-w-[80%] md:min-w-0 md:max-w-none',
                  compact && 'rounded-2xl',
                  idx === 0 &&
                    'order-1 md:order-1 hover:shadow-lg md:p-6',
                  item.is_featured &&
                    'order-2 md:order-2 z-10 border-2 border-transparent hover:shadow-lg md:p-6',
                  item.is_featured &&
                    item.group !== 'one-time' &&
                    'scale-[1.02] rounded-2xl shadow-2xl md:scale-105 md:p-8',
                  idx === 2 &&
                    'order-3 md:order-3 shadow-xl hover:shadow-2xl md:p-6'
                )}
                style={
                  item.is_featured
                    ? {
                        borderImage: `${featuredGradient} 1`,
                        boxShadow: featuredShadow,
                      }
                    : undefined
                }
              >
                {displayedItem.discount_text && (
                  <span
                    className="absolute -top-3 right-4 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-black"
                    style={{
                      background:
                        'linear-gradient(90deg, #FFD166 0%, #FFA94D 100%)',
                      boxShadow: '0 0 12px rgba(255, 169, 77, 0.55)',
                    }}
                  >
                    {displayedItem.discount_text}
                  </span>
                )}
                <CardHeader className={cn(compact ? 'p-4 pb-3 sm:p-4 sm:pb-3' : 'p-0 pb-0')}>
                  <div className="mb-3">
                    {item.label && (
                      item.is_featured && item.group === 'one-time' ? (
                        <div className="mb-3">
                          <div
                            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold text-black shadow-lg"
                            style={{ background: featuredGradient }}
                          >
                            {item.label === '热门' ? (
                              <Crown className="mr-1.5 h-4 w-4" />
                            ) : (
                              <Star className="mr-1.5 h-4 w-4" />
                            )}
                            {item.label}
                          </div>
                        </div>
                      ) : (
                      <div className="mb-2 flex items-center gap-1.5">
                        {item.label === '热门' ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Star className="h-4 w-4 text-amber-500" />
                        )}
                        <span
                          className="text-sm font-semibold"
                          style={
                            item.is_featured
                              ? {
                                  backgroundImage: featuredGradient,
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  color: 'transparent',
                                }
                              : { color: '#f59e0b' }
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                      )
                    )}
                    <h3
                      className="text-2xl font-semibold md:text-3xl"
                      style={
                        item.is_featured
                          ? {
                              backgroundImage: featuredGradient,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              color: 'transparent',
                            }
                          : undefined
                      }
                    >
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
                      <span
                        className="text-3xl font-bold tracking-tight md:text-4xl"
                        style={
                          item.is_featured
                            ? {
                                backgroundImage: featuredGradient,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                              }
                            : undefined
                        }
                      >
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
                    </div>
                    {displayedItem.total_price_note && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {displayedItem.total_price_note}
                      </div>
                    )}
                  </div>

                  {(item.credits != null || item.credits_label) && (
                    <div
                      className="mb-3 rounded-xl border p-3"
                      style={
                        item.is_featured
                          ? {
                              borderColor:
                                item.group === 'one-time'
                                  ? 'rgba(255, 180, 117, 0.3)'
                                  : 'rgba(255, 186, 107, 0.4)',
                              background: featuredCreditBackground,
                            }
                          : undefined
                      }
                    >
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

                  {!compact && group !== 'one-time' && currencies.length > 1 && (
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

                  {isCurrentPlan ? (
                    <div className="group relative mb-6">
                      <Button
                        disabled
                        className={cn(
                          'w-full rounded-xl px-6 py-3.5 text-center text-base font-semibold',
                          'bg-muted text-muted-foreground opacity-60'
                        )}
                      >
                        <span className="text-base">
                          {t('current_plan')}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="group relative mb-6">
                      <Button
                        onClick={() => handlePayment(item)}
                        disabled={isLoading}
                        className={cn(
                          'w-full rounded-xl px-6 py-3.5 text-center text-base font-semibold text-black shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md disabled:opacity-50',
                          item.is_featured
                            ? item.group === 'one-time'
                              ? 'text-black hover:brightness-105'
                              : 'bg-primary text-primary-foreground'
                            : 'border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        style={
                          item.is_featured && item.group === 'one-time'
                            ? { background: featuredGradient }
                            : undefined
                        }
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
                    </div>
                  )}
                </CardHeader>

                <CardContent
                  className={cn(
                    compact ? 'space-y-2 px-4 pb-4' : 'space-y-4 px-0 pb-0'
                  )}
                >
                  <hr className="landing-divider border-dashed" />

                  <div
                    className={cn(
                      'landing-body flex flex-col gap-3 text-sm',
                      compact && 'gap-2'
                    )}
                  >
                    {(item.features ?? []).map((feature, index) => {
                      if (typeof feature === 'string') {
                        return (
                          <div
                            key={index}
                            className="group relative flex flex-row items-center justify-between gap-2"
                          >
                            <div
                              className={cn(
                                'flex min-w-0 items-center gap-2',
                                index < 3 && 'text-primary'
                              )}
                            >
                              <Check className="size-3 shrink-0 text-primary" />
                              <span>{feature}</span>
                            </div>
                          </div>
                        );
                      }

                      if (feature && feature.included === false) {
                        return (
                          <div
                            key={index}
                            className="group relative flex flex-row items-center justify-between gap-2"
                          >
                            <div
                              className={cn(
                                'flex min-w-0 items-center gap-2',
                                index < 3 && 'text-destructive'
                              )}
                            >
                              <X className="size-3 shrink-0 text-destructive" />
                              <span>{feature.title}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="group relative flex flex-row items-center justify-between gap-2"
                        >
                          <div
                            className={cn(
                              'flex min-w-0 flex-row items-center gap-2',
                              index < 3 && 'text-primary'
                            )}
                          >
                            <Check className="size-3 shrink-0 text-primary" />
                            <span>{feature.title}</span>
                            <Info className="size-3.5 shrink-0 text-muted-foreground" />
                          </div>
                          <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-max max-w-md rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl group-hover:block">
                            <div className="space-y-1 leading-relaxed text-muted-foreground">
                              {feature.items.map((description, descriptionIndex) => (
                                <div key={descriptionIndex}>{description}</div>
                              ))}
                            </div>
                            <span className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border bg-popover" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!compact &&
                    pricing.models?.items &&
                    pricing.models.items.length > 0 && (
                      <PricingCardModels
                        models={pricing.models}
                        planId={item.product_id}
                        accent={item.credit_accent || '#abbbcc'}
                      />
                    )}
                </CardContent>
              </div>
            );
          })}
        </div>

        <section id="why-choose-yearly" className="mb-8 mt-12">
            <h2 className="landing-strong mb-6 text-center text-2xl font-bold sm:text-3xl">
              为什么选择年度计划？
            </h2>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-2 sm:grid-cols-2 sm:gap-6 sm:px-0 lg:grid-cols-3">
              <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <DollarSign className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </div>
                <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
                  超值优惠
                </h3>
                <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>使用 Starter 每年节省 $250</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>订阅 Pro 每年节省 $760</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>无限套餐每年节省 $900</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <Rocket className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </div>
                <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
                  模型折扣
                </h3>
                <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>所有基础与增强模型一折优惠（闪购）！</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>SOTA 模型：每次生成最高享 60% 折扣</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Seedance 1.5 Pro：40 → 4 积分</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Seedream 5.0：20 → 2 积分</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Veo 3：100 → 10 积分</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <Star className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </div>
                <h3 className="landing-strong mb-3 text-base font-bold sm:mb-4 sm:text-lg">
                  专属特权
                </h3>
                <ul className="landing-body space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>
                      访问所有高级模型（Seedance 2.0 Pro、Seedream、Nano Banana
                      Pro 等）
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>
                      入门计划起即可使用 MiniMax H3、Seedance 2.0 和 Veo 3.1
                      高级版
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>含商业授权</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>价格锁定 12 个月</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

        <section id="compare-plans" className="mt-12">
          <h2 className="landing-strong mb-6 text-center text-2xl font-bold sm:text-3xl">
            比较所有方案
          </h2>
          <div className="overflow-x-auto rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shadow-md">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    模型
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    月卡入门
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    月卡专业
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    月卡无限
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    年卡入门
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    年卡专业
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    年卡无限
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    一次性 199
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
                    一次性 499
                  </th>
                </tr>
              </thead>
              <tbody>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedance 2.5</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>160</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>160</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>160</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">160</span><span className="font-medium text-primary">128</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">160</span><span className="font-medium text-primary">112</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">160</span><span className="font-medium text-primary">64</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>160</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>160</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedance 2.0</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>80</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">80</span><span className="font-medium text-primary">65</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">80</span><span className="font-medium text-primary">40</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">80</span><span className="font-medium text-primary">64</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">80</span><span className="font-medium text-primary">56</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">80</span><span className="font-medium text-primary">32</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>80</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>80</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedance 2.0 Fast</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>65</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">65</span><span className="font-medium text-primary">50</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">65</span><span className="font-medium text-primary">35</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">65</span><span className="font-medium text-primary">52</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">65</span><span className="font-medium text-primary">39</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">65</span><span className="font-medium text-primary">26</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>65</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>65</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedance 2.0 Mini</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">45</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">30</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">44</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">33</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">22</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Veo 3 Premium</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">120</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">75</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">120</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">105</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">60</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Veo 3.1 Basic</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">120</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">75</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">120</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">105</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">150</span><span className="font-medium text-primary">60</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>150</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Veo 3.1 Premium</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">160</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">100</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">160</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">140</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">80</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>200</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Gemini Omni Flash 1.1</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">44</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">27</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">44</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">38</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">22</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Gemini Omni</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">44</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">27</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">44</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">38</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">55</span><span className="font-medium text-primary">22</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>55</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Wan 3.0</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">32</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">20</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">32</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">28</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">16</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Wan 3.0 Prime</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>50</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">50</span><span className="font-medium text-primary">40</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">50</span><span className="font-medium text-primary">25</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">50</span><span className="font-medium text-primary">40</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">50</span><span className="font-medium text-primary">35</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">50</span><span className="font-medium text-primary">20</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>50</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>50</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">MiniMax H3</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">80</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">50</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">80</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">70</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">40</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Kling 2.1 Master</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">100</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">160</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">140</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">200</span><span className="font-medium text-primary">80</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>200</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">LTX 2.5 Fast</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedance 1.5 Pro</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Veo 3.1 Lite</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>75</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>75</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">75</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">75</span><span className="font-medium text-primary">7</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">75</span><span className="font-medium text-primary">7</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">75</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>75</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>75</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Wan 2.5</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">PixVerse V6</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>70</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>70</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">70</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">70</span><span className="font-medium text-primary">7</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">70</span><span className="font-medium text-primary">7</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">70</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>70</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>70</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedream 5.0 Lite</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Seedream 4.0</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Nano Banana</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Nano Banana Pro</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="text-muted-foreground">❌</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Nano Banana 2</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Veo 3</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Kling 2.5</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Kling 2.1 Pro</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>120</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>120</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">120</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">120</span><span className="font-medium text-primary">12</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">120</span><span className="font-medium text-primary">12</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">120</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>120</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>120</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Runway Gen 4</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">10</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">100</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>100</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Flux Kontext Pro</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">3</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">30</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>30</span></td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sm:px-6 sm:py-4">Flux Kontext Max</td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">4</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span className="whitespace-nowrap"><span className="mr-1 text-muted-foreground line-through">40</span><span className="font-medium text-primary">免费</span></span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                      <td className="px-4 py-3 text-sm sm:px-6 sm:py-4"><span>40</span></td>
                  </tr>
              </tbody>
            </table>
          </div>
        </section>

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
