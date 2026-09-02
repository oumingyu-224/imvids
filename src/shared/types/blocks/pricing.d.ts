import { Button } from '@/types/blocks/base/button';

export interface PricingGroup {
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  is_featured?: boolean;
}

export interface PricingCurrency {
  currency: string; // currency code
  amount: number; // price amount
  price: string; // price text
  original_price: string; // original price text
  payment_product_id?: string;
  payment_providers?: string[];
}

export interface PricingItem {
  title?: string;
  description?: string;
  label?: string;

  currency: string; // default currency
  amount: number; // default price amount
  price?: string; // default price text
  original_price?: string; // default original price text
  discount_text?: string; // e.g. "· 50% off" shown after the struck-through price
  total_price_note?: string; // e.g. "$900/年 按年计费" shown under the price row
  currencies?: PricingCurrency[]; // alternative currencies with different prices

  unit?: string;
  features_title?: string;
  // string = simple check-item line; { title, items } = a titled bullet
  // group (e.g. "视频:" / "图像:" model lists)
  features?: (string | { title: string; items: string[] })[];
  highlights?: string[]; // compact check-lines shown on the card; full
  // model details live in the dedicated model-credits section
  button?: Button;
  tip?: string;
  is_featured?: boolean;
  interval: 'one-time' | 'day' | 'week' | 'month' | 'year';
  product_id: string;
  payment_product_id?: string;
  payment_providers?: string[];
  product_name?: string;
  plan_name?: string;

  credits?: number;
  credits_label?: string; // e.g. "无限点数" / "Unlimited points" when credits are not a number
  credits_display?: string; // e.g. "50,000" override of the credits number text
  credits_extra?: string; // e.g. "10,000" bonus segment after the "+" in one-time cards
  credits_videos?: string; // e.g. "1,000 个视频" / "无限视频"
  per_video_price?: string; // e.g. "$0.10" / "~ $0.001"
  per_video_discount?: string; // e.g. "(97% off)" suffix in the per-video row
  credit_accent?: string; // e.g. "#abbbcc"; gem icon color, border-t uses `${accent}22`
  valid_days?: number;
  group?: string;
}

// A benefit shown as "icon + short title" row; full description is
// revealed in a hover tooltip (seevideo-style)
export interface PricingBenefit {
  icon?: string;
  title: string;
  description: string;
}

// Per-plan credit cost of a model.
// - number / string: credits displayed directly (e.g. 40 or "40+")
// - { original, value }: struck-through original + discounted credits
// - null: model not included in that plan (rendered as ✕)
export type PricingModelCredit =
  | number
  | string
  | { original: number | string; value: number | string }
  | null;

export interface PricingModel {
  name: string;
  category: 'video' | 'image';
  badge?: string; // e.g. SOTA / NEW / ULTRA
  description: string; // shown in the row hover tooltip
  // keyed by pricing item product_id, keeps every plan's credits
  credits: Record<string, PricingModelCredit>;
}

export interface PricingModelsSection {
  section_title?: string;
  section_description?: string;
  video_title?: string;
  image_title?: string;
  free_label?: string; // "免费" badge for unlimited plans
  not_included_label?: string; // tooltip text for ✕ cells
  show_more?: string; // expand collapsed rows
  show_less?: string; // collapse back
  visible_count?: number; // rows shown before collapsing
  items?: PricingModel[];
}

export interface Pricing {
  id?: string;
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  items?: PricingItem[];
  groups?: PricingGroup[];
  benefits?: PricingBenefit[];
  models?: PricingModelsSection;
  className?: string;
  sr_only_title?: string;
}
