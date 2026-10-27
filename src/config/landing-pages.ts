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

/** 模型页通用 sections：聚焦模型本身，不渲染首页通用的展示区/价格等区块 */
const MODEL_PAGE_SECTIONS = [
  'hero',
  'prompt-showcase',
  'usage',
  'features',
  'testimonials',
  'faq',
  'cta',
];

/** 模型页配置工厂：一个模型一页，结构同 ai-video-generator（LandingPageRenderer） */
function modelPageConfig(
  slug: string,
  mode: LandingGeneratorType
): LandingPageConfig {
  return {
    namespace: `models.${slug}`,
    showSections: MODEL_PAGE_SECTIONS,
    lockedMode: true,
    defaultMode: mode,
    workbenchGenerator: mode,
    metadata: {
      metadataKey: `models.${slug}.metadata`,
      canonicalUrl: `/${slug}`,
    },
  };
}

// —— 视频模型页 ——
export const seedance25ModelPageConfig = modelPageConfig('seedance-2-5', 'video');
export const seedance20ModelPageConfig = modelPageConfig('seedance-2-0', 'video');
export const minimaxH3ModelPageConfig = modelPageConfig('minimax-h3', 'video');
export const veo31ModelPageConfig = modelPageConfig('veo-3-1', 'video');
export const kling25ModelPageConfig = modelPageConfig('kling-2-5', 'video');
export const wan30ModelPageConfig = modelPageConfig('wan-3-0', 'video');

// —— 图片模型页 ——
export const gptImages25ModelPageConfig = modelPageConfig('gpt-images-2-5', 'image');
export const nanoBananaProModelPageConfig = modelPageConfig('nano-banana-pro', 'image');
export const seedream40ModelPageConfig = modelPageConfig('seedream-4-0', 'image');
export const fluxKontextMaxModelPageConfig = modelPageConfig('flux-kontext-max', 'image');
export const nanoBanana2ModelPageConfig = modelPageConfig('nano-banana-2', 'image');
export const seedream5LiteModelPageConfig = modelPageConfig('seedream-5-lite', 'image');
