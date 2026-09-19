import { getBaseCredits } from '@/shared/lib/plan-credits';

// 模型配置数据 —— 由模型选择 Popover 循环渲染
// 数据结构与 seevideo 工作台一致：徽章、描述、能力 chips、锁定态、推荐标、定价关联

export type GeneratorMode = 'image' | 'video';

export interface GeneratorModel {
  id: string;
  name: string;
  icon: string;
  badges: string[];
  description: string;
  capabilities: string[];
  locked: boolean;
  /** 解锁所需定价页套餐（锚点 id），未锁定为 null */
  lockedTier: string | null;
  /** 仅在这些套餐下锁定（free 用户沿用 locked 现状，其他套餐不锁定） */
  lockedProductIds?: string[];
  /** 是否在前端隐藏（不渲染到模型选择列表） */
  hidden?: boolean;
  /** 按模型清单的差异参数配置（控件支持范围 + 提交字段名） */
  params?: GeneratorModelParams;
  recommended: boolean;
  /** 与定价页打通的定价信息 */
  pricing: {
    /** 单次生成所需积分 */
    credits: number;
    /** 定价页套餐锚点 */
    tierAnchor: string;
  };
}

/**
 * 模型参数差异配置（事实来源：价格修改/模型清单.md）
 * 图片/视频模型共用；未配置的控件表示该模型不支持，渲染时隐藏、提交时跳过
 */
export interface GeneratorModelParams {
  /** 各场景提交用的 model 值（kie/fal）；缺省走现有渠道映射 */
  apiModels?: Partial<
    Record<
      | 'text-to-image'
      | 'image-to-image'
      | 'text-to-video'
      | 'image-to-video'
      | 'video-to-video',
      string
    >
  >;
  /** 提交渠道；视频模型缺省 kie */
  provider?: 'kie' | 'fal';
  /** 宽高比提交字段名；未配置 = 不支持宽高比（隐藏控件） */
  ratioField?: string;
  /** 宽高比可选范围裁剪（value 列表）；未配置 = 全部 RATIO_OPTIONS */
  ratioOptions?: string[];
  /** 宽高比值映射（如 seedream-4 的 image_size 枚举） */
  ratioValueMap?: Record<string, string>;
  /** 质量/分辨率提交字段名；未配置 = 不支持质量/分辨率选择（隐藏控件） */
  resolutionField?: string;
  /** 质量值映射（standard/hd/ultra -> 提交值） */
  resolutionValueMap?: Record<string, string>;
  /** 分辨率可选档位裁剪（视频）；未配置 = 全部 VIDEO_RESOLUTION_OPTIONS */
  resolutionOptions?: string[];
  /** 视频时长提交字段名；未配置 = 不支持时长（隐藏控件） */
  durationField?: string;
  /** 视频时长离散档位；未配置 = 用 VIDEO_DURATION 滑块 */
  durationOptions?: number[];
  /** 生成音频提交字段名；未配置 = 隐藏音频开关 */
  audioField?: string;
  /** 图片数量提交字段名；未配置 = 不支持数量选择（隐藏控件） */
  countField?: string;
  /** 图生图/图生视频参考图提交字段名；未配置 = 不支持图生（或走首帧字段） */
  imageInputField?: string;
  /** 参考图是否多张 */
  imageInputMultiple?: boolean;
  /** 首帧提交字段名（图生视频时上传图作为首帧） */
  firstFrameField?: string;
  /** 尾帧提交字段名（尾帧开关开启时） */
  lastFrameField?: string;
  /** 按场景附加的固定字段（如 veo3 的 generation_type） */
  sceneExtraFields?: Partial<
    Record<
      'text-to-video' | 'image-to-video' | 'video-to-video',
      Record<string, unknown>
    >
  >;
}

/** 图片模型（文本转图片 / 图片转图片 共用） */
export const IMAGE_MODELS: GeneratorModel[] = [
  {
    id: 'gpt-images-2-5-flare',
    name: 'GPT Images 2.5 Flare',
    icon: '/model_icon/openai-icon.svg',
    badges: ['新', '最优'],
    description: '通过精准提示词和参考图控制创建与编辑图像。',
    capabilities: ['5+', 'HD', '多图', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'gpt-image-2-5-flare-text-to-image',
        'image-to-image': 'gpt-image-2-5-flare-image-to-image',
      },
      ratioField: 'aspect_ratio',
      resolutionField: 'resolution',
      imageInputField: 'input_urls',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('gpt-images-2-5-flare') ?? 60, tierAnchor: 'max' },
  },
  {
    id: 'seedream-5-lite',
    name: 'Seedream 5.0 Lite',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['新'],
    description:
      '字节跳动统一多模态图像生成模型，具备推理能力、深度理解与可控视觉创作功能',
    capabilities: ['40+', '文本和图片'],
    params: {
      apiModels: { 'text-to-image': 'seedream/5-lite-text-to-image' },
      ratioField: 'aspect_ratio',
      resolutionField: 'quality',
      resolutionValueMap: { standard: 'basic', hd: 'high', ultra: 'ultra' },
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('seedream-5-lite') ?? 40, tierAnchor: 'pro' },
  },
  {
    id: 'seedream-4',
    name: 'Seedream 4.0',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['新'],
    description: '字节跳动旗下先进图像生成模型，兼具卓越画质与强大创意掌控力',
    capabilities: ['30+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'bytedance/seedream-v4-text-to-image',
        'image-to-image': 'bytedance/seedream-v4-edit',
      },
      ratioField: 'image_size',
      ratioValueMap: {
        '1:1': 'square',
        '16:9': 'landscape_16_9',
        '9:16': 'portrait_16_9',
        '4:3': 'landscape_4_3',
        '3:4': 'portrait_4_3',
        '3:2': 'landscape_3_2',
        '2:3': 'portrait_3_2',
        '21:9': 'landscape_21_9',
      },
      resolutionField: 'image_resolution',
      countField: 'max_images',
      imageInputField: 'image_urls',
      imageInputMultiple: true,
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('seedream-4') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    icon: '/model_icon/google-icon.svg',
    badges: ['新'],
    description: '由 Google 提供支持的先进 AI 模型，擅长通过自然语言驱动图像生成',
    capabilities: ['30+', '文本和图片'],
    params: {
      apiModels: { 'text-to-image': 'google/nano-banana' },
      ratioField: 'aspect_ratio',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('nano-banana') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    icon: '/model_icon/google-icon.svg',
    badges: ['专业版'],
    description: '由 Google 提供支持的专业 AI 图像生成，具备增强画质与高级控制功能',
    capabilities: ['40+', 'HD', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'nano-banana-pro',
        'image-to-image': 'nano-banana-pro',
      },
      ratioField: 'aspect_ratio',
      resolutionField: 'resolution',
      imageInputField: 'image_input',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'pro',
    lockedProductIds: ['starter-monthly', 'starter'],
    recommended: true,
    pricing: { credits: getBaseCredits('nano-banana-pro') ?? 40, tierAnchor: 'pro' },
  },
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    icon: '/model_icon/google-icon.svg',
    badges: ['新'],
    description: '由 Google 驱动的新一代 Flash 模型，提供极速性能与专业级稳定性',
    capabilities: ['40+', 'HD', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'nano-banana-2',
        'image-to-image': 'nano-banana-2',
      },
      ratioField: 'aspect_ratio',
      resolutionField: 'resolution',
      imageInputField: 'image_input',
      imageInputMultiple: true,
    },
    locked: false,
    lockedTier: null,
    recommended: true,
    pricing: { credits: getBaseCredits('nano-banana-2') ?? 40, tierAnchor: 'pro' },
  },
  {
    id: 'qwen-image-edit',
    name: 'Qwen Image Edit',
    icon: '/model_icon/wan-icon.svg',
    badges: ['新'],
    description: '高级图像编辑，精准掌控风格与细节',
    capabilities: ['30+', '仅图片'],
    params: {
      apiModels: { 'image-to-image': 'qwen/image-edit' },
      ratioField: 'image_size',
      ratioOptions: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      ratioValueMap: {
        '1:1': 'square',
        '4:3': 'landscape_4_3',
        '3:4': 'portrait_4_3',
        '16:9': 'landscape_16_9',
        '9:16': 'portrait_16_9',
      },
      countField: 'num_images',
      imageInputField: 'image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('qwen-image-edit') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'grok-imagine-image',
    name: 'Grok Imagine Image',
    icon: '/model_icon/grok-icon.svg',
    badges: ['新'],
    description:
      'xAI 图像生成功能，画质惊艳——文生图每次请求生成 2 张图片，图生图每次生成 1 张。',
    capabilities: ['30+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'grok-imagine-image-2-0/text-to-image',
        'image-to-image': 'grok-imagine-image-2-0/image-edit',
      },
      ratioField: 'aspect_ratio',
      ratioOptions: ['1:1', '2:3', '3:2', '16:9', '9:16'],
      imageInputField: 'image_urls',
      imageInputMultiple: true,
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('grok-imagine-image') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'gpt-4o-image',
    name: 'GPT-4o Image',
    icon: '/model_icon/openai-icon.svg',
    badges: ['标准版'],
    description: 'AI 驱动的图像生成与编辑',
    capabilities: ['30+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': '4o-image-api',
        'image-to-image': '4o-image-api',
      },
      imageInputField: 'files_url',
      imageInputMultiple: true,
      ratioField: 'size',
      ratioOptions: ['1:1', '3:2', '2:3'],
      ratioValueMap: {
        '16:9': '3:2',
        '9:16': '2:3',
        '21:9': '3:2',
        '4:3': '3:2',
        '3:4': '2:3',
      },
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('gpt-4o-image') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'flux-kontext-pro',
    name: 'Flux Kontext Pro',
    icon: '/model_icon/flux-icon.svg',
    badges: ['专业版'],
    description: '生成情境丰富、真实生动的场景，助力插画创作与故事叙述。',
    capabilities: ['30+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'flux1-kontext',
        'image-to-image': 'flux1-kontext',
      },
      ratioField: 'aspect_ratio',
      ratioOptions: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
      imageInputField: 'input_image',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('flux-kontext-pro') ?? 30, tierAnchor: 'pro' },
  },
  {
    id: 'flux-kontext-max',
    name: 'Flux Kontext Max',
    icon: '/model_icon/flux-icon.svg',
    badges: ['MAX'],
    description: '为高端艺术与设计项目生成高度精细、复杂的视觉效果。',
    capabilities: ['40+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-image': 'flux1-kontext',
        'image-to-image': 'flux1-kontext',
      },
      ratioField: 'aspect_ratio',
      ratioOptions: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
      imageInputField: 'input_image',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('flux-kontext-max') ?? 40, tierAnchor: 'pro' },
  },
];

/** 视频模型（文本转视频 / 图片转视频 共用） */
export const VIDEO_MODELS: GeneratorModel[] = [
  {
    id: 'gemini-omni-flash-1-1',
    name: 'Gemini Omni Flash 1.1',
    icon: '/model_icon/google-icon.svg',
    badges: ['新', 'MULTI', '最优'],
    description: '快速多模态视频生成，支持首尾帧、图片、视频片段、音频 ID 和角色 ID',
    capabilities: ['4-10s', '55+', '文本、首尾帧、视频、音频与角色'],
    params: {
      apiModels: {
        'text-to-video': 'google/gemini-omni-flash-1-1',
        'image-to-video': 'google/gemini-omni-flash-1-1',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16'],
      durationField: 'duration',
      durationOptions: [4, 6, 8, 10],
      resolutionField: 'resolution',
      resolutionOptions: ['360p', '720p', '1080p', '4k'],
      imageInputField: 'image_urls',
      imageInputMultiple: true,
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('gemini-omni-flash-1-1') ?? 55, tierAnchor: 'max' },
  },
  {
    id: 'gemini-omni',
    name: 'Gemini Omni',
    icon: '/model_icon/google-icon.svg',
    badges: ['新', 'MULTI', '最优'],
    description: '支持图片、视频、可复用 Audio ID 与 Character ID 的多模态视频生成模型',
    capabilities: ['4-10s', '55+', '文本、图片、视频、音频与角色'],
    params: {
      apiModels: {
        'text-to-video': 'gemini-omni-video',
        'image-to-video': 'gemini-omni-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16'],
      durationField: 'duration',
      durationOptions: [4, 6, 8, 10],
      resolutionField: 'resolution',
      resolutionOptions: ['720p', '1080p', '4k'],
      imageInputField: 'image_urls',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('gemini-omni') ?? 55, tierAnchor: 'max' },
  },
  {
    id: 'minimax-h3',
    name: 'MiniMax H3',
    icon: '/model_icon/minimax-icon.svg',
    badges: ['最优', '音频'],
    description:
      'Native-audio video generation with text, first/last frames, and multimodal references up to 2K',
    capabilities: ['15s', '20/s+', '尾帧', '多图', '文本、帧与参考'],
    params: {
      apiModels: {
        'text-to-video': 'minimax-h3/text-to-video',
        'image-to-video': 'minimax-h3/image-to-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['768P', '2K'],
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('minimax-h3') ?? 80, tierAnchor: 'max' },
  },
  {
    id: 'minimax-h3-max-turbo',
    name: 'MiniMax H3 Max Turbo',
    icon: '/model_icon/minimax-icon.svg',
    badges: ['音频', '新'],
    description:
      'High-throughput native-audio video generation with text and first/last-frame animation',
    capabilities: ['5-15s', '10/s+', '尾帧', '文本与帧'],
    params: {
      apiModels: {
        'text-to-video': 'minimax/h3-max-turbo/text-to-video',
        'image-to-video': 'minimax/h3-max-turbo/image-to-video',
      },
      provider: 'fal',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      audioField: 'generate_audio',
      imageInputField: 'image_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('minimax-h3-max-turbo') ?? 70, tierAnchor: 'max' },
  },
  {
    id: 'ltx-2-5-fast',
    name: 'LTX 2.5 Fast',
    icon: '/model_icon/ltx-icon.svg',
    badges: ['新', '音频'],
    description:
      'Fast video generation with synchronized audio, portrait support, and optional start/end frames',
    capabilities: ['2-20s', '8/s+', '尾帧', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'lightricks/ltx-2.5/text-to-video/fast',
        'image-to-video': 'lightricks/ltx-2.5/image-to-video/fast',
      },
      provider: 'fal',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      audioField: 'generate_audio',
      imageInputField: 'image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('ltx-2-5-fast') ?? 40, tierAnchor: 'pro' },
  },
  {
    id: 'seedance-2-5',
    name: 'Seedance 2.5',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['新', '音频'],
    description:
      '新一代多模态视频生成，支持文字、图片、视频和音频输入，最长 30 秒，最高 720p',
    capabilities: ['30s', '160+', '文本、图片、视频与音频'],
    params: {
      apiModels: {
        'text-to-video': 'bytedance/seedance-2-5',
        'image-to-video': 'bytedance/seedance-2-5',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p', '1080p'],
      audioField: 'generate_audio',
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('seedance-2-5') ?? 120, tierAnchor: 'max' },
  },
  {
    id: 'seedance-2-0',
    name: 'Seedance 2.0',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['至尊版', '音频'],
    description: '顶级多模态视频生成，支持文字、图片、视频和音频输入，最高 720p',
    capabilities: ['15s', '80+', '文本、图片和视频'],
    params: {
      apiModels: {
        'text-to-video': 'bytedance/seedance-2',
        'image-to-video': 'bytedance/seedance-2',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p', '1080p', '4k'],
      audioField: 'generate_audio',
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('seedance-2-0') ?? 90, tierAnchor: 'max' },
  },
  {
    id: 'seedance-2-0-fast',
    name: 'Seedance 2.0 Fast',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['FAST', '音频'],
    description: '快速多模态视频生成，支持文字、图片、视频和音频输入，最高 720p',
    capabilities: ['15s', '65+', '文本、图片和视频'],
    params: {
      apiModels: {
        'text-to-video': 'bytedance/seedance-2-fast',
        'image-to-video': 'bytedance/seedance-2-fast',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p'],
      audioField: 'generate_audio',
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('seedance-2-0-fast') ?? 75, tierAnchor: 'max' },
  },
  {
    id: 'seedance-2-0-mini',
    name: 'Seedance 2.0 Mini',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['FAST', '音频', '新'],
    description: '轻量快速的多模态视频生成，支持文字、图片、视频和音频输入，最高 720p',
    capabilities: ['15s', '11/s+', '文本、图片和视频'],
    params: {
      apiModels: {
        'text-to-video': 'bytedance/seedance-2-mini',
        'image-to-video': 'bytedance/seedance-2-mini',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p'],
      audioField: 'generate_audio',
      firstFrameField: 'first_frame_url',
      lastFrameField: 'last_frame_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('seedance-2-0-mini') ?? 45, tierAnchor: 'pro' },
  },
  {
    id: 'pixverse-v6',
    name: 'PixVerse V6',
    icon: '/model_icon/pixverse-icon.svg',
    badges: ['新', '音频'],
    description:
      'Create 1–15 second videos with text, one or two frames, up to seven image references, or an existing video.',
    capabilities: ['1-15s', '10/s+', 'HD', '尾帧', '多图', '多分镜'],
    params: {
      apiModels: {
        'text-to-video': 'pixverse-v6/text-to-video',
        'image-to-video': 'pixverse-v6/image-to-video',
      },
      provider: 'kie',
      durationField: 'duration',
      resolutionField: 'quality',
      resolutionOptions: ['360p', '540p', '720p', '1080p'],
      audioField: 'generate_audio_switch',
      imageInputField: 'image_urls',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'pro',
    recommended: false,
    pricing: { credits: getBaseCredits('pixverse-v6') ?? 50, tierAnchor: 'pro' },
  },
  {
    id: 'seedance-1-5-pro',
    name: 'Seedance 1.5 Pro',
    icon: '/model_icon/bytedance-icon.svg',
    badges: ['音频'],
    description: '次世代多场景叙事，支持音频生成与增强转场效果',
    capabilities: ['8s', '40+', '尾帧', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'bytedance/seedance-1.5-pro',
        'image-to-video': 'bytedance/seedance-1.5-pro',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['1:1', '4:3', '3:4', '16:9', '9:16', '21:9'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p', '1080p'],
      audioField: 'generate_audio',
      imageInputField: 'input_urls',
      imageInputMultiple: true,
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('seedance-1-5-pro') ?? 25, tierAnchor: 'pro' },
  },
  {
    id: 'veo-3-1-premium',
    name: 'Veo 3.1 Premium',
    icon: '/model_icon/google-icon.svg',
    badges: ['至尊版', '音频'],
    description: '极致视频画质与原生音频——Google 最先进的模型',
    capabilities: ['8s', '200+', '尾帧', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'veo-3-1',
        'image-to-video': 'veo-3-1',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['720p', '1080p', '4k'],
      imageInputField: 'image_urls',
      imageInputMultiple: true,
      sceneExtraFields: {
        'text-to-video': { generation_type: 'TEXT_2_VIDEO' },
        'image-to-video': { generation_type: 'FIRST_AND_LAST_FRAMES_2_VIDEO' },
      },
    },
    locked: false,
    lockedTier: null,
    lockedProductIds: ['starter-monthly', 'starter'],
    recommended: true,
    pricing: { credits: getBaseCredits('veo-3-1-premium') ?? 120, tierAnchor: 'max' },
  },
  {
    id: 'veo-3-1-lite',
    name: 'Veo 3.1 Lite',
    icon: '/model_icon/google-icon.svg',
    badges: ['新', '音频'],
    description: '高性价比视频生成，配备原生音频——适合大批量工作流',
    capabilities: ['8s', '75', '尾帧', '多图'],
    params: {
      apiModels: {
        'text-to-video': 'fal-ai/veo3.1/lite',
        'image-to-video': 'fal-ai/veo3.1/lite/image-to-video',
      },
      provider: 'fal',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16'],
      imageInputField: 'image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('veo-3-1-lite') ?? 45, tierAnchor: 'pro' },
  },
  {
    id: 'veo-3-1-basic',
    name: 'Veo 3.1 Basic',
    hidden: true,
    icon: '/model_icon/google-icon.svg',
    badges: ['新', '音频'],
    description: '高质量视频，原生音频——极速生成',
    capabilities: ['8s', '150+', '尾帧', '多图'],
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('veo-3-1-basic') ?? 90, tierAnchor: 'pro' },
  },
  {
    id: 'veo-3-premium',
    name: 'Veo 3 Premium',
    hidden: true,
    icon: '/model_icon/google-icon.svg',
    badges: ['高级版', '音频'],
    description: '沉浸式音效与超写实视觉效果',
    capabilities: ['8s', '150+', '文本和图片'],
    locked: true,
    lockedTier: 'max',
    recommended: true,
    pricing: { credits: getBaseCredits('veo-3-premium') ?? 100, tierAnchor: 'max' },
  },
  {
    id: 'veo-3-basic',
    name: 'Veo 3 Basic',
    hidden: true,
    icon: '/model_icon/google-icon.svg',
    badges: ['热门', '音频'],
    description: '专业视频创作，配备自然音频与高质量视觉效果',
    capabilities: ['8s', '100+', '文本和图片'],
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('veo-3-basic') ?? 60, tierAnchor: 'pro' },
  },
  {
    id: 'wan-3-0-prime',
    name: 'Wan 3.0 Prime',
    icon: '/model_icon/wan-icon.svg',
    badges: ['PRIME', '音频'],
    description:
      '阿里巴巴高级 Wan 3.0 多模态视频模型，提供更强的原生音频能力和丰富的参考控制。',
    capabilities: ['30s', '20+', 'HD', '尾帧', '文本、首尾帧与多模态参考'],
    params: {
      apiModels: {
        'text-to-video': 'wan/3-0-video-prime',
        'image-to-video': 'wan/3-0-video-prime',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '4:3', '1:1', '3:4', '9:16'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480P', '720P', '1080P'],
      audioField: 'audio',
      imageInputField: 'reference_image_urls',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('wan-3-0-prime') ?? 110, tierAnchor: 'max' },
  },
  {
    id: 'wan-3-0',
    name: 'Wan 3.0',
    icon: '/model_icon/wan-icon.svg',
    badges: ['新', '音频'],
    description:
      '阿里巴巴全能多模态视频模型，支持文本、关键帧、图片、视频、音频、网页和文档参考。',
    capabilities: ['30s', '16+', 'HD', '尾帧', '文本、首尾帧与多模态参考'],
    params: {
      apiModels: {
        'text-to-video': 'wan/3-0-video',
        'image-to-video': 'wan/3-0-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '4:3', '1:1', '3:4', '9:16'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480P', '720P', '1080P'],
      audioField: 'audio',
      imageInputField: 'reference_image_urls',
      imageInputMultiple: true,
    },
    locked: true,
    lockedTier: 'max',
    recommended: false,
    pricing: { credits: getBaseCredits('wan-3-0') ?? 100, tierAnchor: 'max' },
  },
  {
    id: 'wan-2-5',
    name: 'Wan 2.5',
    icon: '/model_icon/wan-icon.svg',
    badges: ['新', '音频'],
    description:
      '阿里巴巴的先进视频模型支持原生音画同步，并提供高级运动与镜头控制功能，带来更丰富的视频动态效果',
    capabilities: ['10s', '100+', 'HD', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'wan/2-5-text-to-video',
        'image-to-video': 'wan/2-5-image-to-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16', '1:1'],
      durationField: 'duration',
      durationOptions: [5, 10],
      resolutionField: 'resolution',
      resolutionOptions: ['720p', '1080p'],
      imageInputField: 'image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: true,
    pricing: { credits: getBaseCredits('wan-2-5') ?? 60, tierAnchor: 'pro' },
  },
  {
    id: 'kling-2-5',
    name: 'Kling 2.5',
    icon: '/model_icon/kling-icon.svg',
    badges: ['新'],
    description: '业界领先的运动动态与时序控制',
    capabilities: ['10s', '100+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'kling/v2-5-turbo-text-to-video-pro',
        'image-to-video': 'kling/v2-5-turbo-image-to-video-pro',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16', '1:1'],
      durationField: 'duration',
      durationOptions: [5, 10],
      imageInputField: 'image_url',
      lastFrameField: 'tail_image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('kling-2-5') ?? 60, tierAnchor: 'pro' },
  },
  {
    id: 'kling-2-1-master',
    name: 'Kling 2.1 Master',
    icon: '/model_icon/kling-icon.svg',
    badges: ['MASTER'],
    description: '业界领先的运动真实感，配备精准的时间控制',
    capabilities: ['10s', '200+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'kling/v2-1-master-text-to-video',
        'image-to-video': 'kling/v2-1-master-image-to-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '9:16', '1:1'],
      durationField: 'duration',
      durationOptions: [5, 10],
      imageInputField: 'image_url',
    },
    locked: true,
    lockedTier: 'max',
    lockedProductIds: ['starter-monthly', 'starter'],
    recommended: false,
    pricing: { credits: getBaseCredits('kling-2-1-master') ?? 100, tierAnchor: 'max' },
  },
  {
    id: 'kling-2-1-pro',
    name: 'Kling 2.1 Pro',
    icon: '/model_icon/kling-icon.svg',
    badges: ['专业版'],
    description:
      '支持精细的镜头控制、稳定的主体与连贯性、灵活的风格/光效设置，并可通过尾帧图像引导视频结尾。',
    capabilities: ['10s', '120+', '尾帧', '仅图片'],
    params: {
      apiModels: {
        'text-to-video': 'kling/v2-1-pro',
        'image-to-video': 'kling/v2-1-pro',
      },
      provider: 'kie',
      durationField: 'duration',
      durationOptions: [5, 10],
      imageInputField: 'image_url',
      lastFrameField: 'tail_image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('kling-2-1-pro') ?? 70, tierAnchor: 'pro' },
  },
  {
    id: 'grok-imagine-video',
    name: 'Grok Imagine Video',
    icon: '/model_icon/grok-icon.svg',
    badges: ['新'],
    description: 'xAI 的多模态视频生成，具备连贯动态与同步音频',
    capabilities: ['~5s', '40+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'grok-imagine/text-to-video',
        'image-to-video': 'grok-imagine/image-to-video',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['2:3', '3:2', '1:1', '16:9', '9:16'],
      durationField: 'duration',
      resolutionField: 'resolution',
      resolutionOptions: ['480p', '720p', '1080p'],
      imageInputField: 'image_urls',
      imageInputMultiple: true,
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('grok-imagine-video') ?? 25, tierAnchor: 'pro' },
  },
  {
    id: 'runway-gen-4',
    name: 'Runway Gen 4',
    icon: '/model_icon/runway-icon.svg',
    badges: ['新'],
    description: 'Runway 的新一代视频生成模型，具备稳定的角色一致性与精细的动态控制',
    capabilities: ['10s', '100+', '文本和图片'],
    params: {
      apiModels: {
        'text-to-video': 'runway',
        'image-to-video': 'runway',
      },
      provider: 'kie',
      ratioField: 'aspect_ratio',
      ratioOptions: ['16:9', '4:3', '1:1', '3:4', '9:16'],
      durationField: 'duration',
      imageInputField: 'image_url',
    },
    locked: false,
    lockedTier: null,
    recommended: false,
    pricing: { credits: getBaseCredits('runway-gen-4') ?? 100, tierAnchor: 'pro' },
  },
];

export function getModelsByMode(mode: GeneratorMode): GeneratorModel[] {
  const models = mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS;
  return models.filter((m) => !m.hidden);
}

/** 宽高比选项（含预览框尺寸，图片/视频共用） */
export const RATIO_OPTIONS: {
  value: string;
  label: string;
  /** 预览框 w/h（rem 单位数值） */
  box: { w: number; h: number };
}[] = [
  { value: '1:1', label: '1:1', box: { w: 1.75, h: 1.75 } },
  { value: '16:9', label: '16:9', box: { w: 2.75, h: 1.5 } },
  { value: '9:16', label: '9:16', box: { w: 1.5, h: 2.75 } },
  { value: '4:3', label: '4:3', box: { w: 2.25, h: 1.75 } },
  { value: '3:4', label: '3:4', box: { w: 1.75, h: 2.25 } },
  { value: '3:2', label: '3:2', box: { w: 2.5, h: 1.75 } },
  { value: '2:3', label: '2:3', box: { w: 1.75, h: 2.5 } },
  { value: '21:9', label: '21:9', box: { w: 2.75, h: 1.25 } },
];

/** 质量选项（图片模式） */
export const QUALITY_OPTIONS = ['基础', '高清', '超清'];

/** 图片数量选项（图片模式） */
export const IMAGE_COUNT_OPTIONS = ['1', '2', '3', '4'];

/** 分辨率选项（视频模式） */
export const VIDEO_RESOLUTION_OPTIONS = ['480p', '720p', '1080p'];

/** 视频时长范围 */
export const VIDEO_DURATION = { min: 4, max: 15, default: 5 };
