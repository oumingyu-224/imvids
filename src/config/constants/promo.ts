/**
 * 促销折扣单一配置源：banner 文案、导航徽章、pricing 促销气泡、卡片折扣角标等处
 * 统一从这里取数字，禁止在 json 文案或组件里各自硬编码折扣数字
 */
export const PROMO_PERCENT_OFF = 50;

/** 各语言折扣表述：json 文案里用 {discount} 占位符，渲染时替换 */
export const PROMO_DISCOUNT_TEXT: Record<string, string> = {
  en: '50% OFF',
  zh: '5 折',
};

/**
 * 将文案中的促销占位符替换为当前折扣口径；无占位符原文返回：
 * - {discount}    → 促销表述（en: 50% OFF / zh: 5 折）
 * - {percent_off} → 折扣百分数（50）
 */
export function applyPromo(text?: string | null, locale = 'en'): string {
  if (!text) return '';
  const discount =
    PROMO_DISCOUNT_TEXT[locale] ?? PROMO_DISCOUNT_TEXT.en;
  return text
    .replaceAll('{discount}', discount)
    .replaceAll('{percent_off}', String(PROMO_PERCENT_OFF));
}
