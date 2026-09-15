// 套餐积分计算模块 —— 规则唯一来源：价格修改/积分计算规则.md
// 基准积分唯一数据源：src/config/locale/messages/{zh,en}/pages/pricing.json 的 pricing.models.items[]

import zhPricing from '@/config/locale/messages/zh/pages/pricing.json';

type CreditsValue = number | { original: number; value: number } | 'free' | null;

interface JsonModelItem {
  name: string;
  category: 'video' | 'image';
  credits: Record<string, CreditsValue>;
}

const pricingModels = (
  zhPricing as { pricing: { models: { items: JsonModelItem[] } } }
).pricing.models.items;

/** 工作台模型 id -> 价格 json 模型名 */
const MODEL_NAME_MAP: Record<string, string> = {
  'gpt-images-2-5-flare': 'GPT Images 2.5 Flare',
  'seedream-5-lite': 'Seedream 5.0 Lite',
  'seedream-4': 'Seedream 4.0',
  'nano-banana': 'Nano Banana',
  'nano-banana-pro': 'Nano Banana Pro',
  'nano-banana-2': 'Nano Banana 2',
  'qwen-image-edit': 'Qwen Image Edit',
  'grok-imagine-image': 'Grok Imagine Image',
  'gpt-4o-image': 'GPT-4o Image',
  'flux-kontext-pro': 'Flux Kontext Pro',
  'flux-kontext-max': 'Flux Kontext Max',
  'gemini-omni-flash-1-1': 'Gemini Omni Flash 1.1',
  'gemini-omni': 'Gemini Omni',
  'minimax-h3': 'MiniMax H3',
  'minimax-h3-max-turbo': 'MiniMax H3 Max Turbo',
  'ltx-2-5-fast': 'LTX 2.5 Fast',
  'seedance-2-5': 'Seedance 2.5',
  'seedance-2-0': 'Seedance 2.0',
  'seedance-2-0-fast': 'Seedance 2.0 Fast',
  'seedance-2-0-mini': 'Seedance 2.0 Mini',
  'pixverse-v6': 'PixVerse V6',
  'seedance-1-5-pro': 'Seedance 1.5 Pro',
  'veo-3-1-premium': 'Veo 3.1 Premium',
  'veo-3-1-lite': 'Veo 3.1 Lite',
  'veo-3-1-basic': 'Veo 3.1 Basic',
  'veo-3-premium': 'Veo 3 Premium',
  'veo-3-basic': 'Veo 3 Basic',
  'wan-3-0-prime': 'Wan 3.0 Prime',
  'wan-3-0': 'Wan 3.0',
  'wan-2-5': 'Wan 2.5',
  'kling-2-5': 'Kling 2.5',
  'kling-2-1-master': 'Kling 2.1 Master',
  'kling-2-1-pro': 'Kling 2.1 Pro',
  'grok-imagine-video': 'Grok Imagine Video',
  'runway-gen-4': 'Runway Gen 4',
};

/** 价格 json 中的模型条目 */
export function getJsonModel(modelId: string): JsonModelItem | null {
  const name = MODEL_NAME_MAP[modelId];
  if (!name) return null;
  return pricingModels.find((item) => item.name === name) ?? null;
}

/**
 * SOTA 判定：premium-monthly（月无限制）下仍需积分的模型即 SOTA。
 * 基础/增强模型在月无限制下为 "free"。
 */
const SOTA_MODEL_NAMES = new Set(
  pricingModels
    .filter((item) => item.credits['premium-monthly'] !== 'free')
    .map((item) => item.name)
);

export function isSotaModel(modelId: string): boolean {
  const jsonModel = getJsonModel(modelId);
  if (!jsonModel) return false;
  return SOTA_MODEL_NAMES.has(jsonModel.name);
}

/** 模型在指定套餐下是否不可用（credits 为 null） */
export function isModelUnavailable(modelId: string, productId: string): boolean {
  const jsonModel = getJsonModel(modelId);
  if (!jsonModel) return false;
  return jsonModel.credits[productId] === null;
}

/** 模型在指定套餐下是否免费（credits 为 "free"） */
export function isModelFree(modelId: string, productId: string): boolean {
  const jsonModel = getJsonModel(modelId);
  if (!jsonModel) return false;
  return jsonModel.credits[productId] === 'free';
}

/** 模型基准积分（json 原价；{original,value} 取 original） */
export function getBaseCredits(modelId: string): number | null {
  const jsonModel = getJsonModel(modelId);
  if (!jsonModel) return null;
  const raw = jsonModel.credits['starter-monthly'] ?? jsonModel.credits['starter'];
  if (typeof raw === 'number') return raw;
  if (raw && typeof raw === 'object') return raw.original;
  return null;
}

/**
 * 套餐折扣规则（仅作用于 SOTA 模型；基础模型按套餐 free 或原价/一折）：
 * - starter-monthly / starter / standard：原价
 * - standard-monthly：SOTA 八折
 * - premium-monthly：SOTA 五折，基础模型 free
 * - starter-yearly：基础一折，SOTA 八折
 * - standard-yearly：基础一折，SOTA 七折（Fast/Mini 六折）
 * - premium-yearly：基础 free，SOTA 四折
 */
const PLAN_RULES: Record<
  string,
  { sotaDiscount: number; basicDiscount: number; basicFree: boolean }
> = {
  'starter-monthly': { sotaDiscount: 1, basicDiscount: 1, basicFree: false },
  'standard-monthly': { sotaDiscount: 0.8, basicDiscount: 1, basicFree: false },
  'premium-monthly': { sotaDiscount: 0.5, basicDiscount: 1, basicFree: true },
  'starter-yearly': { sotaDiscount: 0.8, basicDiscount: 0.1, basicFree: false },
  'standard-yearly': { sotaDiscount: 0.7, basicDiscount: 0.1, basicFree: false },
  'premium-yearly': { sotaDiscount: 0.4, basicDiscount: 1, basicFree: true },
  starter: { sotaDiscount: 1, basicDiscount: 1, basicFree: false },
  standard: { sotaDiscount: 1, basicDiscount: 1, basicFree: false },
};

/** 年专业下六折例外模型（特殊处理，见规则 md 第七节） */
const YEARLY_PRO_SIXTY = new Set(['Seedance 2.0 Fast', 'Seedance 2.0 Mini']);

interface PlanDiscountResult {
  /** true = 该套餐下免费 */
  free: boolean;
  /** 折扣倍率（free 时无意义） */
  multiplier: number;
}

export function getPlanDiscount(modelId: string, productId: string): PlanDiscountResult {
  const rule = PLAN_RULES[productId];
  if (!rule) return { free: false, multiplier: 1 };
  const sota = isSotaModel(modelId);
  if (!sota) {
    return { free: rule.basicFree, multiplier: rule.basicDiscount };
  }
  let discount = rule.sotaDiscount;
  const jsonModel = getJsonModel(modelId);
  if (productId === 'standard-yearly' && jsonModel && YEARLY_PRO_SIXTY.has(jsonModel.name)) {
    discount = 0.6;
  }
  return { free: false, multiplier: discount };
}

/**
 * 计算一次生成的积分（原价部分由调用方按参数算好，这里叠加套餐折扣）
 * @param rawCredits 按 模型+参数 算出的原价积分
 */
export function applyPlanDiscount(
  modelId: string,
  productId: string,
  rawCredits: number
): number | 'free' {
  const { free, multiplier } = getPlanDiscount(modelId, productId);
  if (free) return 'free';
  return Math.ceil(rawCredits * multiplier);
}

/** 视频分辨率档位序（每升一档积分 ×2）；基准为各模型 resolutionOptions 的第一档 */
const RESOLUTION_ORDER = [
  '360p',
  '480p',
  '480P',
  '540p',
  '720p',
  '768P',
  '1080p',
  '1080P',
  '2K',
  '4k',
  '4K',
];

/** 分辨率相对基准档的倍率（2^档差） */
export function getResolutionMultiplier(
  resolution: string,
  baseResolution: string
): number {
  const idx = RESOLUTION_ORDER.indexOf(resolution);
  const baseIdx = RESOLUTION_ORDER.indexOf(baseResolution);
  if (idx < 0 || baseIdx < 0) return 1;
  return Math.pow(2, idx - baseIdx);
}
