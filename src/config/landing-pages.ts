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
