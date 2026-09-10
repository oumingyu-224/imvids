'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  ArrowUpRight,
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
  Sparkles,
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
  const tp = useTranslations('pages.pricing.pricing.promo');
  const compareColumns = [
    {
      title: t('compare_starter'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_STARTER,
      subscribe: true,
    },
    {
      title: t('compare_starter'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_STARTER,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_pro'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_PRO,
      subscribe: true,
    },
    {
      title: t('compare_pro'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_PRO,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_unlimited'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_UNLIMITED,
      subscribe: true,
    },
    {
      title: t('compare_unlimited'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_UNLIMITED,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_onetime'),
      subtitle: t('compare_199'),
      gradient: GRAD_STARTER,
    },
    {
      title: t('compare_onetime'),
      subtitle: t('compare_499'),
      gradient: GRAD_PRO,
      highlight: true,
    },
  ];
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
    <>
      {/* promo-bubble 模块：原样复制自 价格修改/sv-onetime.html */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById('pricing-plans')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        className="promo-bubble group mx-auto mb-6 flex min-h-[126px] w-[calc(100%-1rem)] max-w-6xl cursor-pointer flex-col items-start justify-between gap-3 px-5 pt-24 py-4 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:pt-36 sm:min-h-[140px] sm:px-8 sm:py-5 lg:min-h-[160px] lg:px-10"
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
                        <div className="rounded-full border border-primary bg-black px-2 py-1 text-[9px] font-bold text-primary sm:px-2.5 sm:text-[10px] md:px-3 md:text-xs">
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
                        className="w-full rounded-xl px-6 py-3.5 text-center text-base font-semibold text-black shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md hover:brightness-105 disabled:opacity-50"
                        style={{
                          background:
                            item.group === 'one-time'
                              ? GRAD_PRO
                              : idx === 0
                                ? GRAD_STARTER
                                : idx === 2
                                  ? GRAD_UNLIMITED
                                  : GRAD_PRO,
                        }}
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

        <section id="compare-plans" className="mb-12 w-full rounded-3xl p-4 sm:p-6 lg:p-8">
          <h2 className="landing-strong mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">
            <span
              style={{
                background:
                  'linear-gradient(148deg, #ffba6b 0%, #ffd685 40%, #fff5eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('compare_title')}
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    {t('compare_feature')}
                  </th>
                  {compareColumns.map((col, colIdx) => (
                    <th
                      key={colIdx}
                      className={
                        col.highlight
                          ? 'relative rounded-lg bg-primary/10 px-6 py-4 text-center text-sm font-semibold'
                          : 'px-6 py-4 text-center text-sm font-semibold'
                      }
                    >
                      {col.highlight && (
                        <div className="absolute right-0 top-0 z-10">
                          <span className="inline-block whitespace-nowrap rounded-md border border-primary bg-black px-1 text-[8px] font-semibold text-primary shadow-[0_0_4px_hsl(var(--primary)/0.6),0_0_8px_hsl(var(--primary)/0.4)]">
                            {t('compare_badge')}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <span
                          style={{
                            background: col.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {col.title}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {col.subtitle}
                        </span>
                        {col.subscribe && (
                          <div className="group relative mt-2">
                            <button
                              className="w-full min-w-[100px] rounded-lg px-3 py-2 text-xs font-semibold text-black shadow-sm transition-all duration-200 hover:opacity-90 hover:brightness-105"
                              style={{ background: GRAD_UNLIMITED }}
                            >
                              {t('compare_subscribe')}
                            </button>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_META_ROWS.map((row, rowIdx) => (
                  <tr
                    key={`meta-${rowIdx}`}
                    className="border-b border-[hsl(var(--border))]"
                  >
                    <td className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      {t(row.labelKey)}
                    </td>
                    {row.cells.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={
                          compareColumns[colIdx].highlight
                            ? 'rounded-lg bg-primary/10 px-6 py-4 text-center'
                            : 'px-6 py-4 text-center'
                        }
                      >
                        {cell === 'X' ? (
                          <span className="text-sm text-muted-foreground">❌</span>
                        ) : (
                          (() => {
                            const isAccent =
                              // 价格 / 积分 / 并发：年费列
                              ((rowIdx === 0 || rowIdx === 1 || rowIdx === 2) &&
                                (colIdx === 1 || colIdx === 3 || colIdx === 5)) ||
                              // 无水印：全部
                              rowIdx === 3 ||
                              // 商业许可证：有许可证的
                              (rowIdx === 4 && cell.p !== 'X') ||
                              // 折扣：节省 90% / 节省 100%
                              (rowIdx === 5 &&
                                (cell.p === 'compare_disc_90' ||
                                  cell.p === 'compare_disc_100'));
                            return (
                              <span
                                className={cn(
                                  'whitespace-nowrap text-sm text-foreground',
                                  isAccent && 'font-medium text-primary'
                                )}
                              >
                                {cell.p.startsWith('compare_') ? t(cell.p) : cell.p}
                                {cell.sub &&
                                  cell.sub.map((line, lineIdx) => (
                                    <span
                                      key={lineIdx}
                                      className={cn(
                                        'block text-xs',
                                        rowIdx === 0 &&
                                          (colIdx === 1 ||
                                            colIdx === 3 ||
                                            colIdx === 5)
                                          ? 'text-primary'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      {line.startsWith('compare_') ? t(line) : line}
                                    </span>
                                  ))}
                              </span>
                            );
                          })()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {COMPARE_ROWS.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-[hsl(var(--border))]"
                  >
                    <td className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      {row.name}
                    </td>
                    {row.cells.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={
                          compareColumns[colIdx].highlight
                            ? 'rounded-lg bg-primary/10 px-6 py-4 text-center'
                            : 'px-6 py-4 text-center'
                        }
                      >
                        {cell === 'X' ? (
                          <span className="text-sm text-muted-foreground">❌</span>
                        ) : (
                          <span className="whitespace-nowrap text-sm">
                            {cell.s && (
                              <span className="mr-1 text-muted-foreground line-through">
                                {cell.s}
                              </span>
                            )}
                            <span
                              className={
                                cell.s
                                  ? 'font-medium text-primary'
                                  : 'text-foreground'
                              }
                            >
                              {cell.p}
                            </span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
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
    </>
  );
}



type CompareCell = { s?: string; sub?: string[]; p: string } | 'X';

const GRAD_STARTER = 'linear-gradient(148deg, #abbbcc 0%, #fff 100%)';
const GRAD_PRO = 'linear-gradient(148deg, #ffb475 0%, #ebecff 100%)';
const GRAD_UNLIMITED =
  'linear-gradient(148deg, #ffba6b 0%, #ffd685 40%, #fff5eb 100%)';

// 列顺序：入门月、入门年、专业月、专业年、无限月、无限年、一次性199、一次性499
// 套餐属性行（位于模型行之前）
const COMPARE_META_ROWS: Array<{ labelKey: string; cells: Array<CompareCell> }> = [
  {
    labelKey: 'compare_row_price',
    cells: [
      { p: '$29.99', sub: ['compare_unit_monthly'] },
      { p: '$8.3', sub: ['compare_unit_monthly'] },
      { p: '$89.99', sub: ['compare_unit_monthly'] },
      { p: '$25', sub: ['compare_unit_monthly', 'compare_save_30'] },
      { p: '$149.99', sub: ['compare_unit_monthly'] },
      { p: '$75', sub: ['compare_unit_monthly', 'compare_save_50'] },
      { p: '$199.99', sub: ['compare_onetime'] },
      { p: '$499.99', sub: ['compare_onetime'] },
    ],
  },
  {
    labelKey: 'compare_row_credits',
    cells: [
      { p: '2,500', sub: ['compare_unit_monthly'] },
      { p: '10,000', sub: ['compare_unit_yearly'] },
      { p: '10,000', sub: ['compare_unit_monthly'] },
      { p: '32,000', sub: ['compare_unit_yearly'] },
      { p: 'compare_unlimited' },
      { p: 'compare_unlimited' },
      { p: '23,500' },
      { p: '60,000' },
    ],
  },
  {
    labelKey: 'compare_row_concurrency',
    cells: [
      { p: '1' },
      { p: '1' },
      { p: '3' },
      { p: '3' },
      { p: '5' },
      { p: '5' },
      { p: '3' },
      { p: '6' },
    ],
  },
  {
    labelKey: 'compare_row_watermark',
    cells: [
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
    ],
  },
  {
    labelKey: 'compare_row_license',
    cells: [
      'X',
      { p: '✓' },
      'X',
      { p: '✓' },
      'X',
      { p: '✓' },
      'X',
      'X',
    ],
  },
  {
    labelKey: 'compare_row_discount',
    cells: [
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_90' },
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_90' },
      { p: 'compare_disc_100' },
      { p: 'compare_disc_100' },
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_regular' },
    ],
  },
];

const COMPARE_ROWS: Array<{ name: string; cells: Array<CompareCell> }> = [
  { name: 'Seedance 2.5', cells: [{ p: '160' }, { s: '160', p: '128' }, { p: '160' }, { s: '160', p: '112' }, { p: '160' }, { s: '160', p: '64' }, { p: '160' }, { p: '160' }] },
  { name: 'Seedance 2.0', cells: [{ p: '80' }, { s: '80', p: '64' }, { s: '80', p: '65' }, { s: '80', p: '56' }, { s: '80', p: '40' }, { s: '80', p: '32' }, { p: '80' }, { p: '80' }] },
  { name: 'Seedance 2.0 Fast', cells: [{ p: '65' }, { s: '65', p: '52' }, { s: '65', p: '50' }, { s: '65', p: '39' }, { s: '65', p: '35' }, { s: '65', p: '26' }, { p: '65' }, { p: '65' }] },
  { name: 'Seedance 2.0 Mini', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '45' }, { s: '55', p: '33' }, { s: '55', p: '30' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Veo 3 Premium', cells: [{ p: '150' }, { s: '150', p: '120' }, { s: '150', p: '120' }, { s: '150', p: '105' }, { s: '150', p: '75' }, { s: '150', p: '60' }, { p: '150' }, { p: '150' }] },
  { name: 'Veo 3.1 Basic', cells: [{ p: '150' }, { s: '150', p: '120' }, { s: '150', p: '120' }, { s: '150', p: '105' }, { s: '150', p: '75' }, { s: '150', p: '60' }, { p: '150' }, { p: '150' }] },
  { name: 'Veo 3.1 Premium', cells: ['X', { s: '200', p: '160' }, { s: '200', p: '160' }, { s: '200', p: '140' }, { s: '200', p: '100' }, { s: '200', p: '80' }, 'X', { p: '200' }] },
  { name: 'Gemini Omni Flash 1.1', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '44' }, { s: '55', p: '38' }, { s: '55', p: '27' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Gemini Omni', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '44' }, { s: '55', p: '38' }, { s: '55', p: '27' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Wan 3.0', cells: [{ p: '40' }, { s: '40', p: '32' }, { s: '40', p: '32' }, { s: '40', p: '28' }, { s: '40', p: '20' }, { s: '40', p: '16' }, { p: '40' }, { p: '40' }] },
  { name: 'Wan 3.0 Prime', cells: [{ p: '50' }, { s: '50', p: '40' }, { s: '50', p: '40' }, { s: '50', p: '35' }, { s: '50', p: '25' }, { s: '50', p: '20' }, { p: '50' }, { p: '50' }] },
  { name: 'MiniMax H3', cells: [{ p: '100' }, { s: '100', p: '80' }, { s: '100', p: '80' }, { s: '100', p: '70' }, { s: '100', p: '50' }, { s: '100', p: '40' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.1 Master', cells: ['X', { s: '200', p: '160' }, 'X', { s: '200', p: '140' }, { s: '200', p: '100' }, { s: '200', p: '80' }, 'X', { p: '200' }] },
  { name: 'LTX 2.5 Fast', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Seedance 1.5 Pro', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Veo 3.1 Lite', cells: [{ p: '75' }, { s: '75', p: '7' }, { p: '75' }, { s: '75', p: '7' }, { s: '75', p: '免费' }, { s: '75', p: '免费' }, { p: '75' }, { p: '75' }] },
  { name: 'Wan 2.5', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'PixVerse V6', cells: [{ p: '70' }, { s: '70', p: '7' }, { p: '70' }, { s: '70', p: '7' }, { s: '70', p: '免费' }, { s: '70', p: '免费' }, { p: '70' }, { p: '70' }] },
  { name: 'Seedream 5.0 Lite', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Seedream 4.0', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Nano Banana', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Nano Banana Pro', cells: ['X', { s: '40', p: '4' }, 'X', { s: '40', p: '4' }, { p: '免费' }, { p: '免费' }, 'X', { p: '40' }] },
  { name: 'Nano Banana 2', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Veo 3', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.5', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.1 Pro', cells: [{ p: '120' }, { s: '120', p: '12' }, { p: '120' }, { s: '120', p: '12' }, { s: '120', p: '免费' }, { s: '120', p: '免费' }, { p: '120' }, { p: '120' }] },
  { name: 'Runway Gen 4', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Flux Kontext Pro', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Flux Kontext Max', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
];
