'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAppContext } from '@/shared/contexts/app';
import { getCookie } from '@/shared/lib/cookie';
import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import {
  PricingCurrency,
  PricingItem,
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
        <div className="mx-auto mb-8 px-4 text-center md:px-8 sm:mb-10">
          {pricing.sr_only_title && (
            <h1 className="sr-only">{pricing.sr_only_title}</h1>
          )}
          <h2 className="landing-title mb-8 text-2xl font-bold tracking-tight text-pretty sm:text-4xl lg:text-5xl">
            {pricing.title}
          </h2>
        </div>
      )}

      <div className={compact ? 'w-full px-0' : 'container'}>
        {pricing.groups && pricing.groups.length > 0 && (
          <div
            className={cn(
              'mx-auto flex w-full justify-center',
              compact
                ? 'mt-0 mb-3 justify-start overflow-x-auto px-0 sm:justify-center sm:overflow-visible'
                : 'mb-4 sm:mb-6'
            )}
          >
            <div className="relative flex w-fit items-center rounded-full bg-card p-1 shadow-sm">
              <Tabs value={group} onValueChange={setGroup}>
                <TabsList className="h-auto rounded-full bg-transparent p-0">
                  {pricing.groups.map((item, i) => {
                    return (
                      <TabsTrigger
                        key={i}
                        value={item.name || ''}
                        className="relative rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:px-6 sm:py-2.5 sm:text-sm"
                      >
                        {item.title}
                        {item.label && (
                          <span className="absolute -top-2.5 -right-1 z-10 rounded-md border border-primary bg-background px-1 py-0.5 text-[8px] leading-tight font-bold text-primary shadow-[0_0_6px_hsl(var(--primary)/0.6),0_0_12px_hsl(var(--primary)/0.3)] sm:-top-3 sm:-right-2 sm:px-1.5 sm:text-[10px]">
                            {item.label}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}

        {!hideHeader && pricing.description && (
          <p className="landing-body mb-6 text-center text-sm font-medium text-primary sm:mb-10 sm:text-base">
            {pricing.description}
          </p>
        )}

        <div
          className={cn(
            'mx-auto w-full',
            compact
              ? 'grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3'
              : 'flex snap-x snap-mandatory gap-3 overflow-x-auto pt-6 pb-4 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:pt-6 md:pb-0 lg:gap-8'
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
              <Card
                key={idx}
                className={cn(
                  'landing-panel relative mx-auto w-full rounded-2xl border shadow-none',
                  !compact &&
                    'min-w-[280px] snap-center sm:min-w-[340px] md:min-w-0',
                  item.is_featured &&
                    'border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_18px_42px_hsl(var(--primary)/0.15)]'
                )}
              >
                {item.label && (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-md">
                    {item.label}
                  </span>
                )}

                <CardHeader className={cn(compact ? 'p-4 pb-3 sm:p-4 sm:pb-3' : 'p-6 pb-4')}>
                  <CardTitle className="font-semibold">
                    <h3 className="landing-strong text-lg font-semibold">
                      {item.title}
                    </h3>
                  </CardTitle>

                  {item.description && (
                    <CardDescription className="landing-body text-sm">
                      {item.description}
                    </CardDescription>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {displayedItem.original_price && (
                      <span className="landing-muted text-sm line-through">
                        {displayedItem.original_price}
                      </span>
                    )}
                    {item.interval === 'year' && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {t('billed_yearly')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        'font-bold tracking-tight',
                        compact ? 'text-3xl' : 'text-4xl',
                        item.is_featured ? 'text-primary' : 'landing-strong'
                      )}
                    >
                      {displayedItem.price}
                    </span>{' '}
                    {displayedItem.unit ? (
                      <span className="landing-muted text-sm font-normal">
                        {displayedItem.unit}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>

                  {(item.credits != null || item.credits_label) && (
                    <div className="mt-2 rounded-xl border bg-muted/40 px-4 py-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="landing-strong text-2xl font-bold">
                          {item.credits_label ?? item.credits!.toLocaleString()}
                        </span>
                        {!item.credits_label && (
                          <span className="landing-muted text-sm">
                            {t('credits_unit')}
                          </span>
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
                  <ul
                    className={cn(
                      'landing-body list-outside text-sm',
                      compact ? 'space-y-2' : 'space-y-3'
                    )}
                  >
                    {item.features?.map((feature, index) =>
                      typeof feature === 'string' ? (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ) : (
                        <li key={index} className="flex flex-col gap-1">
                          <span className="font-medium">
                            {feature.title}
                          </span>
                          <ul className="space-y-1">
                            {feature.items.map((sub, subIndex) => (
                              <li
                                key={subIndex}
                                className="flex items-start gap-2 text-muted-foreground"
                              >
                                <span className="shrink-0">•</span>
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
