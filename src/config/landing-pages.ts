export type LandingGeneratorType = 'image' | 'video';

export interface LandingPageConfig {
  /** Primary i18n namespace for page sections (e.g. 'landing', 'ai.video') */
  namespace: string;
  /** Sections to render, in order */
  showSections: string[];
  /** Lock prompt-showcase mode toggle (hide image/video switch) */
  lockedMode?: boolean;
  /** Fixed mode when lockedMode is true */
  defaultMode?: 'image' | 'video';
  /** Workbench generator used by LandingGeneratorToggle */
  workbenchGenerator: LandingGeneratorType;
  /** 默认选中的工作台模型（generator models.ts 的 id），模型页绑定本页主模型 */
  defaultModel?: string;
  /** Metadata config for getMetadata */
  metadata?: {
    metadataKey: string;
    canonicalUrl: string;
  };
}

export const homeLandingPageConfig: LandingPageConfig = {
  namespace: 'landing',
  showSections: [
    'hero',
    'prompt-showcase',
    'showcases-flow',
    'logos',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'pricing',
    'subscribe',
    'faq',
    'cta',
  ],
  lockedMode: false,
  workbenchGenerator: 'image',
};

export const aiVideoGeneratorPageConfig: LandingPageConfig = {
  namespace: 'ai.video',
  showSections: [
    'hero',
    'prompt-showcase',
    'showcases-flow',
    'logos',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'pricing',
    'subscribe',
    'faq',
    'cta',
  ],
  lockedMode: true,
  defaultMode: 'video',
  workbenchGenerator: 'video',
  metadata: {
    metadataKey: 'ai.video.metadata',
    canonicalUrl: '/ai-video-generator',
  },
};

export const aiImageGeneratorPageConfig: LandingPageConfig = {
  namespace: 'ai.image',
  showSections: [
    'hero',
    'prompt-showcase',
    'showcases-flow',
    'logos',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'pricing',
    'subscribe',
    'faq',
    'cta',
  ],
  lockedMode: true,
  defaultMode: 'image',
  workbenchGenerator: 'image',
  metadata: {
    metadataKey: 'ai.image.metadata',
    canonicalUrl: '/ai-image-generator',
  },
};

/** 模型页通用 sections：聚焦模型本身，不渲染首页通用的展示区区块 */
const MODEL_PAGE_SECTIONS = [
  'hero',
  'prompt-showcase',
  'usage',
  'features',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'related-models',
];

export type ModelCategory = 'video' | 'image';

/** 模型页注册表：slug + 显示名 + 分类 + 系列，供底部「相关系链接区」、导航、/models 页与页脚使用 */
export const MODEL_PAGES: Array<{
  slug: string;
  name: string;
  category: ModelCategory;
  /** 同系列产品分组（如 seedance 系列下的 2.5 / 2.0） */
  series: string;
}> = [
  // —— 视频模型 ——
  { slug: 'seedance-2-5', name: 'Seedance 2.5', category: 'video', series: 'seedance' },
  { slug: 'seedance-2-0', name: 'Seedance 2.0', category: 'video', series: 'seedance' },
  { slug: 'minimax-h3', name: 'MiniMax H3', category: 'video', series: 'minimax' },
  { slug: 'veo-3-1', name: 'Veo 3.1', category: 'video', series: 'veo' },
  { slug: 'kling-2-5', name: 'Kling 2.5', category: 'video', series: 'kling' },
  { slug: 'wan-3-0', name: 'Wan 3.0', category: 'video', series: 'wan' },
  // —— 图片模型 ——
  { slug: 'gpt-images-2-5', name: 'GPT Images 2.5', category: 'image', series: 'gpt-images' },
  { slug: 'nano-banana-pro', name: 'Nano Banana Pro', category: 'image', series: 'nano-banana' },
  { slug: 'nano-banana-2', name: 'Nano Banana 2', category: 'image', series: 'nano-banana' },
  { slug: 'seedream-4-0', name: 'Seedream 4.0', category: 'image', series: 'seedream' },
  { slug: 'seedream-5-lite', name: 'Seedream 5.0 Lite', category: 'image', series: 'seedream' },
  { slug: 'flux-kontext-max', name: 'Flux Kontext Max', category: 'image', series: 'flux' },
  { slug: 'grok-imagine-image', name: 'Grok Imagine Image', category: 'image', series: 'grok' },
];

/** 模型页配置工厂：一个模型一页，结构同 ai-video-generator（LandingPageRenderer） */
function modelPageConfig(
  slug: string,
  mode: LandingGeneratorType,
  modelId: string
): LandingPageConfig {
  return {
    namespace: `models.${slug}`,
    showSections: MODEL_PAGE_SECTIONS,
    lockedMode: true,
    defaultMode: mode,
    workbenchGenerator: mode,
    defaultModel: modelId,
    metadata: {
      metadataKey: `models.${slug}.metadata`,
      canonicalUrl: `/${slug}`,
    },
  };
}

// —— 视频模型页 ——
export const seedance25ModelPageConfig = modelPageConfig('seedance-2-5', 'video', 'seedance-2-5');
export const seedance20ModelPageConfig = modelPageConfig('seedance-2-0', 'video', 'seedance-2-0');
export const minimaxH3ModelPageConfig = modelPageConfig('minimax-h3', 'video', 'minimax-h3');
export const veo31ModelPageConfig = modelPageConfig('veo-3-1', 'video', 'veo-3-1-premium');
export const kling25ModelPageConfig = modelPageConfig('kling-2-5', 'video', 'kling-2-5');
export const wan30ModelPageConfig = modelPageConfig('wan-3-0', 'video', 'wan-3-0');

// —— 图片模型页 ——
export const gptImages25ModelPageConfig = modelPageConfig('gpt-images-2-5', 'image', 'gpt-images-2-5-flare');
export const nanoBananaProModelPageConfig = modelPageConfig('nano-banana-pro', 'image', 'nano-banana-pro');
export const seedream40ModelPageConfig = modelPageConfig('seedream-4-0', 'image', 'seedream-4');
export const fluxKontextMaxModelPageConfig = modelPageConfig('flux-kontext-max', 'image', 'flux-kontext-max');
export const nanoBanana2ModelPageConfig = modelPageConfig('nano-banana-2', 'image', 'nano-banana-2');
export const seedream5LiteModelPageConfig = modelPageConfig('seedream-5-lite', 'image', 'seedream-5-lite');
export const grokImagineImageModelPageConfig = modelPageConfig('grok-imagine-image', 'image', 'grok-imagine-image');
