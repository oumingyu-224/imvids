/**
 * 定价结构化数据单一配置源。
 * 与 /pricing 页面真实展示的档位保持一致：
 * 月付 3 档 + 年付 3 档（实际年支付价）+ 一次性 2 档。
 * 首页与模型页的 SoftwareApplication offers 统一从这里生成，禁止内联硬编码。
 */
export const PRICING_OFFERS = [
  { name: 'Starter Monthly', price: '29.99' },
  { name: 'Pro Monthly', price: '89.99' },
  { name: 'Unlimited Monthly', price: '149.99' },
  { name: 'Starter Yearly', price: '100' },
  { name: 'Pro Yearly', price: '300' },
  { name: 'Unlimited Yearly', price: '900' },
  { name: 'Starter Credits Pack', price: '199.99' },
  { name: 'Pro Credits Pack', price: '499.99' },
] as const;

export function buildPricingAggregateOffer() {
  const prices = PRICING_OFFERS.map((o) => Number(o.price));
  return {
    '@type': 'AggregateOffer' as const,
    priceCurrency: 'USD',
    lowPrice: String(Math.min(...prices)),
    highPrice: String(Math.max(...prices)),
    offerCount: PRICING_OFFERS.length,
    offers: PRICING_OFFERS.map((o) => ({
      '@type': 'Offer' as const,
      name: o.name,
      price: o.price,
      priceCurrency: 'USD',
    })),
  };
}
