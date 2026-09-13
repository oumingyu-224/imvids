'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Coins,
  Download,
  Film,
  Images,
  Info,
  ImageIcon,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import enPricingMessages from '@/config/locale/messages/en/pages/pricing.json';
import zhPricingMessages from '@/config/locale/messages/zh/pages/pricing.json';
import { ROLES } from '@/shared/constants/rbac';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { Pricing as PricingBlock } from '@/themes/default/blocks/pricing';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  getModelsByMode,
  IMAGE_COUNT_OPTIONS,
  QUALITY_OPTIONS,
  RATIO_OPTIONS,
  type GeneratorMode,
} from '@/shared/blocks/generator/models';
import { ModelSelect } from '@/shared/blocks/generator/model-select';
import { VideoGenerator } from '@/shared/blocks/generator/video';
import type { PromptShowcaseConfig } from '@/shared/blocks/common/prompt-showcase';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import { Pricing as PricingData } from '@/shared/types/blocks/pricing';

interface ImageGeneratorProps {
  allowMultipleImages?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
  promptKey?: string;
  defaultModel?: string;
  initialConfig?: PromptShowcaseConfig | null;
}

interface GeneratedImage {
  id: string;
  url: string;
  provider?: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

type ImageGeneratorTab = 'text-to-image' | 'image-to-image';

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;

const MODEL_OPTIONS = [
  {
    value: 'gpt-image-2-image-to-image',
    label: 'GPT Image 2',
    provider: 'kie',
    scenes: ['image-to-image'],
  },
  {
    value: 'gpt-image-2-text-to-image',
    label: 'GPT Image 2',
    provider: 'kie',
    scenes: ['text-to-image'],
  },
  {
    value: 'flux-2/pro-image-to-image',
    label: 'Flux Klein',
    provider: 'kie',
    scenes: ['image-to-image'],
  },
  {
    value: 'flux-2/pro-text-to-image',
    label: 'Flux Klein',
    provider: 'kie',
    scenes: ['text-to-image'],
  },
  {
    value: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    provider: 'kie',
    scenes: ['text-to-image', 'image-to-image'],
  },
  {
    value: 'google/nano-banana-pro',
    label: 'Nano Banana Pro',
    provider: 'replicate',
    scenes: ['text-to-image', 'image-to-image'],
  },
  {
    value: 'bytedance/seedream-4',
    label: 'Seedream 4',
    provider: 'replicate',
    scenes: ['text-to-image', 'image-to-image'],
  },
  {
    value: 'fal-ai/nano-banana-pro',
    label: 'Nano Banana Pro',
    provider: 'fal',
    scenes: ['text-to-image'],
  },
  {
    value: 'fal-ai/nano-banana-pro/edit',
    label: 'Nano Banana Pro Edit',
    provider: 'fal',
    scenes: ['image-to-image'],
  },
  {
    value: 'fal-ai/bytedance/seedream/v4/edit',
    label: 'Seedream 4',
    provider: 'fal',
    scenes: ['image-to-image'],
  },
  {
    value: 'fal-ai/z-image/turbo',
    label: 'Z-Image Turbo',
    provider: 'fal',
    scenes: ['text-to-image'],
  },
  {
    value: 'fal-ai/flux-2-flex',
    label: 'Flux 2 Flex',
    provider: 'fal',
    scenes: ['text-to-image'],
  },
  {
    value: 'gemini-3-pro-image-preview',
    label: 'Gemini 3 Pro Image Preview',
    provider: 'gemini',
    scenes: ['text-to-image', 'image-to-image'],
  },
];

const PROVIDER_OPTIONS = [
  {
    value: 'kie',
    label: 'Kie',
  },
  {
    value: 'replicate',
    label: 'Replicate',
  },
  {
    value: 'fal',
    label: 'Fal',
  },
  {
    value: 'gemini',
    label: 'Gemini',
  },
];



function getImageBaseCredits(hasReferenceImages: boolean) {
  return hasReferenceImages ? 6 : 4;
}

function getQualityMultiplier(qualityStyle: string) {
  if (qualityStyle === 'hd') return 2;
  if (qualityStyle === 'ultra') return 4;
  return 1;
}

function calculateImageCredits({
  hasReferenceImages,
  qualityStyle,
  outputCount,
}: {
  hasReferenceImages: boolean;
  qualityStyle: string;
  outputCount: string;
}) {
  const baseCredits = getImageBaseCredits(hasReferenceImages);
  const qualityMultiplier = getQualityMultiplier(qualityStyle);
  const quantityMultiplier = Math.max(1, Number.parseInt(outputCount, 10) || 1);

  return baseCredits * qualityMultiplier * quantityMultiplier;
}

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractImageUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  const output = result.output ?? result.images ?? result.data;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.image ?? item.src ?? item.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.image ?? output.src ?? output.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function ImageGenerator({
  allowMultipleImages = true,
  maxImages = 9,
  maxSizeMB = 5,
  srOnlyTitle,
  className,
  promptKey,
  defaultModel,
  initialConfig,
}: ImageGeneratorProps) {
  const locale = useLocale();
  const t = useTranslations('ai.image.generator');

  const [mediaMode, setMediaMode] = useState<GeneratorMode>('image');
  const [workTab, setWorkTab] = useState<'text' | 'image'>('text');
  const [aspectRatioOpen, setAspectRatioOpen] = useState(false);
  const [publicVisible, setPublicVisible] = useState(true);
  const [showAllReferenceSlots, setShowAllReferenceSlots] = useState(false);
  const [referenceUploads, setReferenceUploads] = useState<
    { url: string; preview: string }[]
  >([]);

  const [provider, setProvider] = useState(PROVIDER_OPTIONS[0]?.value ?? '');
  const [model, setModel] = useState(MODEL_OPTIONS[0]?.value ?? '');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9'); // 默认宽高比
  const [resolution, setResolution] = useState<string>('2K'); // 默认分辨率（大写 K）
  const [qualityStyle, setQualityStyle] = useState<string>('standard');
  const [qualityLabel, setQualityLabel] = useState<string>('基础');
  const [outputCountStyle, setOutputCountStyle] = useState<string>('1');
  const [prompt, setPrompt] = useState(initialConfig?.prompt ?? '');
  const [previewImage, setPreviewImage] = useState<string>(
    promptKey
      ? ''
      : 'https://kie.ai/cdn-cgi/image/width=1920,quality=85,fit=scale-down,format=webp/https://static.aiquickdraw.com/tools/example/1764234173157_0nmhDbXC.png'
  );
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const savedTaskIdsRef = useRef<Set<string>>(new Set());
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const hasLoadedCreditsRef = useRef(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  const pricingConfig = useMemo(
    () =>
      (locale.startsWith('zh')
        ? zhPricingMessages.pricing
        : enPricingMessages.pricing) as PricingData,
    [locale]
  );

  useEffect(() => {
    setIsMounted(true);

    // Fetch available AI providers
    fetch('/api/ai/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 0 && data.data?.providers !== undefined) {
          const providers = data.data.providers || [];
          console.log('Available AI providers:', providers);
          setAvailableProviders(providers);

          // Set initial provider and model based on available providers
          if (providers.length > 0) {
            const firstProvider = providers[0];
            setProvider(firstProvider);

            // Find first available model for this provider
            const availableModel = MODEL_OPTIONS.find(
              (option) =>
                option.scenes.includes('text-to-image') &&
                option.provider === firstProvider
            );

            if (availableModel) {
              setModel(availableModel.value);
            }
          } else {
            // No providers configured, clear provider and model
            console.log(
              'No AI providers configured, clearing provider and model'
            );
            setProvider('');
            setModel('');
          }
        }
      })
      .catch((error) => {
        console.error('Failed to fetch AI providers:', error);
        setAvailableProviders([]);
      })
      .finally(() => {
        setIsLoadingProviders(false);
      });
  }, []);

  // Track user ID to reset credits loading flag when user changes
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset flag when user changes
    if (user?.id !== userIdRef.current) {
      userIdRef.current = user?.id || null;
      hasLoadedCreditsRef.current = false;
    }

    // Only fetch credits once per user session
    if (user && !user.credits && !hasLoadedCreditsRef.current) {
      hasLoadedCreditsRef.current = true;
      setIsLoadingCredits(true);
      fetchUserCredits().finally(() => {
        setIsLoadingCredits(false);
      });
    }
  }, [user?.id, user?.credits, fetchUserCredits]);

  const appliedInitialConfigRef = useRef(false);

  useEffect(() => {
    if (initialConfig && !appliedInitialConfigRef.current) {
      appliedInitialConfigRef.current = true;
      setPrompt(initialConfig.prompt);
      if (initialConfig.ratio) {
        setAspectRatio(initialConfig.ratio);
      }
      setMediaMode('image');
      setWorkTab('text');
    }
  }, [initialConfig]);

  useEffect(() => {
    if (promptKey) {
      setPrompt(promptKey);
      setMediaMode('image');
      setWorkTab('text');

      if (availableProviders.length > 0) {
        const firstProvider = availableProviders[0];
        setProvider(firstProvider);

        const availableModel = MODEL_OPTIONS.find(
          (option) =>
            option.scenes.includes('text-to-image') &&
            option.provider === firstProvider
        );

        if (availableModel) {
          setModel(availableModel.value);
        }
      }
    } else {
      if (appliedInitialConfigRef.current) {
        return;
      }
      setPrompt('');
      setPreviewImage(
        'https://kie.ai/cdn-cgi/image/width=1920,quality=85,fit=scale-down,format=webp/https://static.aiquickdraw.com/tools/example/1767778245494_Yf0asfLH.png'
      );
      setMediaMode('image');
      setWorkTab('text');

      // Reset to default provider and model for text-to-image
      if (availableProviders.length > 0) {
        const firstProvider = availableProviders[0];
        setProvider(firstProvider);

        const availableModel = MODEL_OPTIONS.find(
          (option) =>
            option.scenes.includes('text-to-image') &&
            option.provider === firstProvider
        );

        if (availableModel) {
          setModel(availableModel.value);
        }
      }
    }
  }, [promptKey, availableProviders]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const hasActiveSubscription = !!user?.currentSubscription;
  const hasReferenceImages = referenceImageUrls.length > 0;
  const costCredits = useMemo(
    () =>
      calculateImageCredits({
        hasReferenceImages,
        qualityStyle,
        outputCount: outputCountStyle,
      }),
    [hasReferenceImages, qualityStyle, outputCountStyle]
  );
  const currentModelPricing = useMemo(
    () => getModelsByMode(mediaMode).find((m) => m.id === model)?.pricing ?? null,
    [mediaMode, model]
  );
  const displayCredits = useMemo(() => {
    const base = currentModelPricing?.credits ?? 40;
    return base * Math.max(1, Number.parseInt(outputCountStyle, 10) || 1);
  }, [currentModelPricing, outputCountStyle]);
  const promptMaxLength = workTab === 'image' ? 2996 : 2995;
  const promptPlaceholder =
    workTab === 'image'
      ? t('workbench.prompt_placeholder_edit')
      : t('workbench.prompt_placeholder');
  const visibleReferenceSlots = showAllReferenceSlots
    ? maxImages
    : Math.min(6, maxImages);
  const canSaveShowcase = useMemo(
    () => user?.roles?.some((role) => role.name === ROLES.SUPER_ADMIN) ?? false,
    [user?.roles]
  );

  // 质量按钮（中文标签） -> 内部 qualityStyle/resolution
  const handleQualityLabelSelect = useCallback(
    (label: string) => {
      setQualityLabel(label);
      const nextStyle =
        label === '高清' ? 'hd' : label === '超清' ? 'ultra' : 'standard';
      if (nextStyle === 'ultra' && !hasActiveSubscription) {
        setShowPricingDialog(true);
        return;
      }
      setQualityStyle(nextStyle);
      setResolution(
        nextStyle === 'hd' ? '2K' : nextStyle === 'ultra' ? '4K' : '1K'
      );
    },
    [hasActiveSubscription]
  );

  // 选择 JSON 模型：直接把 id 写入 model state（后端接入时再做 id -> provider/model 映射）
  const handleModelSelect = useCallback(
    (id: string) => {
      setModel(id);
    },
    []
  );

  // 模型切换时同步宽高比默认值
  const handleMediaModeChange = useCallback((next: GeneratorMode) => {
    setMediaMode(next);
    const models = getModelsByMode(next);
    const firstAvailable = models.find((m) => !m.locked);
    if (firstAvailable) {
      setModel(firstAvailable.id);
    }
  }, []);

  // 参考图上传：本地预览 + 上传到 /api/upload 换取 url
  const uploadReferenceFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    const preview = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        throw new Error(`upload failed with status: ${resp.status}`);
      }
      const result = await resp.json();
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }
      return { url: result.url as string, preview };
    } catch (error) {
      console.error('Failed to upload reference image:', error);
      toast.error(t('workbench.upload_failed'));
      return null;
    }
  }, []);

  const handleReferenceFilesChange = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      let currentCount = referenceUploads.length;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        if (currentCount + 1 > maxImages) {
          toast.error(t('workbench.max_images', { count: maxImages }));
          break;
        }
        const uploaded = await uploadReferenceFile(file);
        if (!uploaded) {
          continue;
        }
        currentCount += 1;
        setReferenceUploads((prev) => [...prev, uploaded]);
        setReferenceImageUrls((prev) => [...prev, uploaded.url]);
      }
    },
    [maxImages, referenceUploads.length, uploadReferenceFile, t]
  );

  const removeReferenceUpload = useCallback((url: string) => {
    setReferenceUploads((prev) => prev.filter((item) => item.url !== url));
    setReferenceImageUrls((prev) => prev.filter((item) => item !== url));
  }, []);

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
    // Don't clear savedTaskIds here - keep it to prevent duplicates across generations
  }, []);

  const saveShowcase = useCallback(
    async (imageUrl: string, taskIdForTracking: string, promptText: string) => {
      // Prevent duplicate saves for the same task
      if (savedTaskIdsRef.current.has(taskIdForTracking)) {
        console.log('Already saved, skipping:', taskIdForTracking);
        return;
      }

      // Mark as saved immediately to prevent race conditions
      savedTaskIdsRef.current.add(taskIdForTracking);
      console.log('Saving showcase for task:', taskIdForTracking);

      try {
        const compressImageFile = async (imageUrl: string): Promise<string> => {
          console.log('Fetching image from proxy...');
          const response = await fetch(
            `/api/proxy/file?url=${encodeURIComponent(imageUrl)}`
          );
          if (!response.ok) throw new Error('Failed to fetch image');

          const blob = await response.blob();
          const file = new File([blob], 'showcase.jpg', { type: blob.type });

          // Use shared compressImage function
          const { compressImage } = await import('@/shared/blocks/common');
          const compressedFile = await compressImage(file);

          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', compressedFile);

            console.log('Uploading compressed image...');
            fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })
              .then((res) => {
                if (!res.ok) throw new Error('Upload failed');
                return res.json();
              })
              .then((result) => {
                if (!result.success || !result.url) {
                  throw new Error(result.error || 'Upload failed');
                }
                console.log('Upload successful:', result.url);
                resolve(result.url);
              })
              .catch(reject);
          });
        };

        const compressedImageUrl = await compressImageFile(imageUrl);

        console.log('Adding showcase to database...');
        await fetch('/api/showcases/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: promptText.trim().substring(0, 100),
            prompt: promptText.trim(),
            image: compressedImageUrl,
            tags: promptKey || null,
          }),
        });
        console.log('Showcase saved successfully');
        toast.success(t('success.saved_to_showcase'));
      } catch (error) {
        console.error('Failed to save showcase:', error);
        toast.error(t('errors.save_showcase_failed'));
        // Remove from saved set if failed
        savedTaskIdsRef.current.delete(taskIdForTracking);
      }
    },
    [prompt, promptKey, t]
  );

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        // Check if already saved to prevent duplicate processing
        if (savedTaskIdsRef.current.has(id)) {
          console.log('Task already processed, stopping poll:', id);
          return true;
        }

        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error(t('errors.timed_out'));
          return true;
        }

        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: id }),
        });

        if (!resp.ok) {
          throw new Error(`request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
        }

        const task = data as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);

        const parsedResult = parseTaskResult(task.taskInfo);
        const imageUrls = extractImageUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (imageUrls.length > 0) {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 10, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (imageUrls.length === 0) {
            toast.error(t('errors.provider_returned_no_images'));
          } else {
            const images = imageUrls.map((url, index) => ({
              id: `${task.id}-${index}`,
              url,
              provider: task.provider,
              model: task.model,
              prompt: task.prompt ?? undefined,
            }));
            setGeneratedImages(images);

            if (
              canSaveShowcase &&
              images.length > 0 &&
              !savedTaskIdsRef.current.has(task.id)
            ) {
              await saveShowcase(
                images[0].url,
                task.id,
                task.prompt ?? prompt
              );
            }
            toast.success(t('success.generated_successfully'));
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate image failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 5, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling image task:', error);
        toast.error(t('errors.query_task_failed', { message: error.message }));
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [
      generationStartTime,
      resetTaskState,
      fetchUserCredits,
      saveShowcase,
      canSaveShowcase,
      prompt,
      t,
    ]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (!taskId) {
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    console.log('=== Generate Debug Info ===');
    console.log('availableProviders:', availableProviders);
    console.log('current provider:', provider);
    console.log('current model:', model);
    console.log('remainingCredits:', remainingCredits);
    console.log('costCredits:', costCredits);

    // Check AI providers FIRST - highest priority
    if (availableProviders.length === 0) {
      console.log('No AI providers configured - showing error');
      toast.error(t('errors.no_providers_configured'));
      return;
    }

    // Check if current provider is in available providers
    if (!availableProviders.includes(provider)) {
      console.log(
        'Current provider not in available providers - showing error'
      );
      toast.error(t('errors.no_providers_configured'));
      return;
    }

    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (qualityStyle === 'ultra' && !hasActiveSubscription) {
      setShowPricingDialog(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error(t('errors.no_prompt'));
      return;
    }

    if (!provider || !model) {
      toast.error(t('errors.no_provider_or_model'));
      return;
    }

    if (workTab === 'image' && referenceImageUrls.length === 0) {
      toast.error(t('errors.no_reference_image'));
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setGenerationStartTime(Date.now());

    try {
      const options: any = {};

      if (hasReferenceImages) {
        options.image_input = referenceImageUrls;
      }

      options.quality_style = qualityStyle;
      options.output_count = outputCountStyle;
      options.public_visible = publicVisible;

      // 添加宽高比参数
      if (aspectRatio) {
        options.aspect_ratio = aspectRatio;
      }

      // 添加分辨率参数
      if (resolution) {
        options.resolution = resolution;
      }

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: workTab === 'image' ? 'image-to-image' : 'text-to-image',
          provider,
          model,
          prompt: trimmedPrompt,
          options,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        if (message === 'NSFW_PROMPT_BLOCKED') {
          toast.error(t('errors.prompt_blocked'));
          resetTaskState();
          return;
        }

        if (
          message === 'NSFW_MODERATION_CONFIG_MISSING' ||
          message === 'NSFW_MODERATION_FAILED'
        ) {
          toast.error(t('errors.moderation_unavailable'));
          resetTaskState();
          return;
        }

        throw new Error(message || 'Failed to create an image task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const imageUrls = extractImageUrls(parsedResult);

        if (imageUrls.length > 0) {
          const images = imageUrls.map((url, index) => ({
            id: `${newTaskId}-${index}`,
            url,
            provider,
            model,
            prompt: trimmedPrompt,
          }));
          setGeneratedImages(images);
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();

          if (
            canSaveShowcase &&
            images.length > 0 &&
            !savedTaskIdsRef.current.has(newTaskId)
          ) {
            await saveShowcase(images[0].url, newTaskId, trimmedPrompt);
          }
          toast.success(t('success.generated_successfully'));
          return;
        }
      }
      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);
      // fetch image via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );
      if (!resp.ok) {
        throw new Error(t('errors.download_fetch_failed'));
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success(t('success.downloaded'));
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error(t('errors.download_failed'));
    } finally {
      setDownloadingImageId(null);
    }
  };

  if (mediaMode === 'video') {
    return (
      <VideoGenerator
        maxSizeMB={50}
        srOnlyTitle={srOnlyTitle}
        onSwitchToImage={() => handleMediaModeChange('image')}
      />
    );
  }

  return (
    <section className={cn('w-full', className)}>
      {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
      <div className="flex w-full max-w-[100vw] overflow-hidden bg-background pt-16 transition-[padding] duration-300 md:h-screen">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="workbench-main custom-scrollbar-thin flex h-full flex-col overflow-y-auto overflow-x-hidden bg-background p-2 pb-20 md:pb-2 lg:overflow-hidden">
            {/* 标题行 */}
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h1 className="flex items-baseline gap-1.5 text-lg font-bold leading-tight text-foreground sm:text-xl md:text-xl lg:text-2xl">
                  <span className="text-foreground">
                    {t('workbench.title_prefix')}
                  </span>
                  <span className="title-gradient-text inline-block">
                    {t('workbench.title_highlight')}
                  </span>
                  <span className="text-foreground">
                    {t('workbench.title_suffix')}
                  </span>
                </h1>
                <span className="hidden items-center gap-1 rounded-full border border-[hsl(var(--highlight))]/30 bg-[hsl(var(--highlight))]/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--highlight))] sm:inline-flex">
                  <Sparkles className="h-3 w-3" />
                  {t('workbench.badge')}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground/40">
                {t('workbench.subtitle')}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4 md:gap-6 lg:flex-row lg:overflow-hidden">
              {/* 左栏：生成操作 */}
              <div className="w-full flex-shrink-0 lg:w-[380px] xl:w-[420px]">
                <motion.div
                  initial={
                    initialConfig ? { opacity: 0, y: -28, scale: 0.97 } : false
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full"
                >
                  <div className="flex h-full flex-col rounded-xl border border-border/50 bg-form-background shadow-lg">
                    {/* 顶部：模式切换 + 模型选择 */}
                    <div className="flex-shrink-0 p-6 pb-2">
                      <div className="flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid h-8 w-full grid-cols-2 items-center rounded-full border border-white/[0.06] bg-black/40 p-0.5 sm:flex sm:h-9 sm:w-auto sm:flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMediaModeChange('video')}
                            className="relative flex h-7 items-center justify-center whitespace-nowrap rounded-full text-xs text-gray-500 transition-all hover:text-gray-300 sm:h-8 sm:px-4 sm:text-sm"
                          >
                            <span className="relative z-10">
                              {t('workbench.mode_video')}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMediaModeChange('image')}
                            className="relative flex h-7 items-center justify-center whitespace-nowrap rounded-full text-xs font-medium text-white transition-all sm:h-8 sm:px-4 sm:text-sm"
                          >
                            <span className="absolute inset-0 rounded-full bg-white/[0.12]" />
                            <span className="relative z-10">
                              {t('workbench.mode_image')}
                            </span>
                          </button>
                        </div>
                        <ModelSelect
                          mode={mediaMode}
                          value={model}
                          onChange={handleModelSelect}
                        />
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col p-6 pt-2">
                      {/* 文本转 / 图片转 tab */}
                      <div className="mb-4 flex-shrink-0">
                        <div className="relative flex w-full border-b border-border/40">
                          <button
                            type="button"
                            onClick={() => setWorkTab('text')}
                            className={cn(
                              'relative whitespace-nowrap py-2.5 text-center text-sm font-medium transition-colors flex-1',
                              workTab === 'text'
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground/70'
                            )}
                          >
                            {t('workbench.tab_text')}
                            {workTab === 'text' ? (
                              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[hsl(var(--highlight))]" />
                            ) : null}
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkTab('image')}
                            className={cn(
                              'relative whitespace-nowrap py-2.5 text-center text-sm font-medium transition-colors flex-1',
                              workTab === 'image'
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground/70'
                            )}
                          >
                            {t('workbench.tab_image')}
                            {workTab === 'image' ? (
                              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[hsl(var(--highlight))]" />
                            ) : null}
                          </button>
                        </div>
                      </div>

                      {/* 滚动表单区 */}
                      <div className="custom-scrollbar mb-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
                        {/* 图片转图片：参考图网格 */}
                        {mediaMode === 'image' && workTab === 'image' ? (
                          <div className="space-y-1">
                            <div className="space-y-2">
                              <label className="font-medium text-sm text-foreground">
                                {t('workbench.upload_reference')}
                              </label>
                              <label className="hidden">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  multiple
                                  onChange={(event) => {
                                    handleReferenceFilesChange(
                                      event.target.files
                                    );
                                    event.target.value = '';
                                  }}
                                />
                              </label>
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                  {Array.from({
                                    length: visibleReferenceSlots,
                                  }).map((_, index) => {
                                    const upload = referenceUploads[index];
                                    if (upload) {
                                      return (
                                        <div key={upload.url}>
                                          <div className="media-card-surface relative overflow-hidden rounded-xl border-2 border-dashed">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={upload.preview}
                                              alt=""
                                              className="aspect-square w-full object-cover"
                                            />
                                            <button
                                              type="button"
                                              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                                              onClick={() =>
                                                removeReferenceUpload(upload.url)
                                              }
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={`empty-${index}`}>
                                        <label className="media-card-surface media-card-surface-hover group relative block cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300">
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                              handleReferenceFilesChange(
                                                event.target.files
                                              );
                                              event.target.value = '';
                                            }}
                                          />
                                          <div className="flex aspect-square flex-col items-center justify-center gap-2 p-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--highlight))]/10 transition-colors group-hover:bg-[hsl(var(--highlight))]/20">
                                              <CloudUpload className="h-5 w-5 text-[hsl(var(--highlight))] transition-colors group-hover:text-[hsl(var(--highlight-hover))]" />
                                            </div>
                                            <div className="text-center">
                                              <p className="text-xs font-medium text-foreground">
                                                {t('workbench.upload_image')}
                                              </p>
                                              <p className="text-[10px] text-muted-foreground">
                                                {t('workbench.or_choose_from')}
                                                <button
                                                  type="button"
                                                  className="gradient-glow-text underline decoration-[hsl(var(--highlight))]/30 underline-offset-2 transition-all hover:scale-105 hover:decoration-[hsl(var(--highlight))]"
                                                >
                                                  {t('workbench.asset_library')}
                                                </button>
                                              </p>
                                              <p className="text-[10px] text-muted-foreground/70">
                                                {index === 0
                                                  ? '\u00a0'
                                                  : `（${t('workbench.optional')}）`}
                                              </p>
                                            </div>
                                          </div>
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                                {maxImages > 6 ? (
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowAllReferenceSlots(
                                          (prev) => !prev
                                        )
                                      }
                                      className="interactive-surface interactive-surface-hover flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200"
                                    >
                                      <span>
                                        {showAllReferenceSlots
                                          ? t('workbench.collapse')
                                          : t('workbench.show_all', {
                                              count: maxImages,
                                            })}
                                      </span>
                                      <ChevronDown
                                        className={cn(
                                          'h-4 w-4 transition-transform',
                                          showAllReferenceSlots && 'rotate-180'
                                        )}
                                      />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* 提示词 */}
                        <div className="space-y-1">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="font-medium text-sm text-foreground">
                                {t('workbench.prompt')}
                              </label>
                            </div>
                            <div className="relative">
                              <Textarea
                                value={prompt}
                                onChange={(event) =>
                                  setPrompt(event.target.value)
                                }
                                placeholder={promptPlaceholder}
                                maxLength={promptMaxLength}
                                className="prompt-textarea-resize relative z-10 min-h-[100px] resize-y border-border/50 bg-card pb-9 pr-10 caret-foreground placeholder:text-muted-foreground transition-colors duration-200 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 md:min-h-[140px]"
                              />
                              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
                                <button
                                  type="button"
                                  className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                  aria-label={t('workbench.ai_prompt_hint')}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end text-xs">
                            <span className="text-muted-foreground">
                              {promptLength}/{promptMaxLength}
                            </span>
                          </div>
                        </div>

                        {/* 图片模式：宽高比 */}
                        {mediaMode === 'image' ? (
                          <div className="space-y-1">
                            <div className="space-y-2">
                              <label className="font-semibold text-sm text-foreground">
                                {t('workbench.aspect_ratio')}
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAspectRatioOpen((prev) => !prev)
                                  }
                                  aria-expanded={aspectRatioOpen}
                                  className="flex min-h-[64px] w-full items-center justify-between rounded-xl border border-border/10 bg-card/45 px-4 py-3 text-left transition-colors hover:bg-card/60"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div
                                      className="ratio-preview-box shrink-0 rounded border-2 border-muted-foreground"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-muted-foreground">
                                        {t('workbench.aspect_ratio')}
                                      </p>
                                      <p className="truncate text-sm font-bold text-foreground">
                                        {aspectRatio}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight
                                    className={cn(
                                      'h-4 w-4 text-muted-foreground transition-transform rotate-90',
                                      aspectRatioOpen && 'rotate-[-90deg]'
                                    )}
                                  />
                                </button>
                                {aspectRatioOpen ? (
                                  <div className="absolute inset-x-0 top-full z-30 mt-1 grid grid-cols-4 gap-2 rounded-xl border border-border/40 bg-card p-3 shadow-lg">
                                    {RATIO_OPTIONS.map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                          setAspectRatio(option.value);
                                          setAspectRatioOpen(false);
                                        }}
                                        className={cn(
                                          'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2 transition-colors',
                                          aspectRatio === option.value
                                            ? 'border-[hsl(var(--highlight))] bg-[hsl(var(--highlight))]/10'
                                            : 'border-transparent hover:bg-muted/50'
                                        )}
                                      >
                                        <span
                                          className="rounded border-2 border-muted-foreground"
                                          style={{
                                            width: `${option.box.w * 0.5}rem`,
                                            height: `${option.box.h * 0.5}rem`,
                                          }}
                                        />
                                        <span className="text-[11px] font-medium text-foreground">
                                          {option.value}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* 图片模式：质量 + 图片数量 */}
                        {mediaMode === 'image' ? (
                          <>
                            <div className="space-y-1">
                              <div className="mb-2 flex items-center gap-1">
                                <label className="font-medium text-sm text-foreground">
                                  {t('workbench.quality')}
                                </label>
                                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                              </div>
                              <div className="grid grid-cols-3 gap-2 px-1">
                                {QUALITY_OPTIONS.map((option) => {
                                  const active = qualityLabel === option;
                                  const qualityKey =
                                    option === '高清'
                                      ? 'quality_hd'
                                      : option === '超清'
                                        ? 'quality_ultra'
                                        : 'quality_standard';
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => handleQualityLabelSelect(option)}
                                      className={cn(
                                        'relative overflow-hidden rounded-md px-4 py-2 font-medium transition-all',
                                        active
                                          ? 'gradient-border border-2 border-transparent bg-clip-padding'
                                          : 'border border-muted text-muted-foreground hover:border-primary hover:text-foreground'
                                      )}
                                      style={
                                        active
                                          ? {
                                              borderImage:
                                                'linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end))) 1',
                                            }
                                          : undefined
                                      }
                                    >
                                      <span
                                        className={cn(
                                          'relative z-10',
                                          active && 'gradient-text'
                                        )}
                                      >
                                        {t(`workbench.${qualityKey}`)}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="mb-2 flex items-center gap-1">
                                <label className="font-medium text-sm text-foreground">
                                  {t('workbench.image_count')}
                                </label>
                                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                              </div>
                              <div className="grid grid-cols-4 gap-2 px-1">
                                {IMAGE_COUNT_OPTIONS.map((option) => {
                                  const active =
                                    outputCountStyle === option;
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() =>
                                        setOutputCountStyle(option)
                                      }
                                      className={cn(
                                        'relative overflow-hidden rounded-md px-4 py-2 font-medium transition-all',
                                        active
                                          ? 'gradient-border border-2 border-transparent bg-clip-padding'
                                          : 'border border-muted text-muted-foreground hover:border-primary hover:text-foreground'
                                      )}
                                      style={
                                        active
                                          ? {
                                              borderImage:
                                                'linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end))) 1',
                                            }
                                          : undefined
                                      }
                                    >
                                      <span
                                        className={cn(
                                          'relative z-10',
                                          active && 'gradient-text'
                                        )}
                                      >
                                        {option}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : null}

                        {/* 公开可见性 */}
                        <div className="mt-4 pt-2">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              {t('workbench.public_visibility')}
                              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                            </span>
                            <div className="flex items-center gap-2">
                              <span>
                                <Coins className="h-4 w-4 cursor-help text-highlight" />
                              </span>
                              <Switch
                                checked={publicVisible}
                                onCheckedChange={setPublicVisible}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 底部固定：积分 + 生成按钮 */}
                      <div className="flex-shrink-0 border-t border-border pt-4">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-[hsl(var(--highlight))]/10 bg-[hsl(var(--highlight-light))]/10 transition-all duration-200">
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-[hsl(var(--highlight))]" />
                                <span className="text-sm font-medium">
                                  {t('workbench.credits_required')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-md font-bold text-[hsl(var(--highlight))]">
                                  {displayCredits}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="gradient-button inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:bg-primary/90 hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t('workbench.generating')}</span>
                              </>
                            ) : !user ? (
                              <>
                                <LockKeyhole className="h-4 w-4" />
                                <span>{t('workbench.upgrade_to_generate')}</span>
                              </>
                            ) : (
                              <span>{t('workbench.generate')}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 右栏：预览区 */}
              <div className="w-full min-w-0">
                <div className="flex h-full gap-2 md:gap-4">
                  <div className="flex h-full min-w-0 flex-1 flex-col rounded-xl border border-border/30 bg-form-background shadow backdrop-blur-md">
                    <div className="flex-shrink-0 p-6">
                      <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                        <Images className="h-5 w-5 text-primary" />
                        <span className="gradient-text">
                          {t('workbench.my_images')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-6 pt-0">
                      <div className="relative h-full pr-2 md:pr-4">
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="h-full w-full md:h-[calc(100vh-250px)]">
                            {generatedImages.length > 0 ? (
                              <div className="flex h-full flex-col">
                                <div className="min-h-0 flex-1">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={generatedImages[0].url}
                                    alt={
                                      generatedImages[0].prompt ||
                                      'Generated image'
                                    }
                                    className="h-full w-full rounded-lg object-contain shadow-lg"
                                  />
                                </div>
                                <div className="mt-3 flex shrink-0 items-center justify-center gap-3">
                                  <Button
                                    size="sm"
                                    className="h-9 rounded-full bg-primary px-6 text-primary-foreground"
                                    onClick={() =>
                                      handleDownloadImage(generatedImages[0])
                                    }
                                    disabled={
                                      downloadingImageId ===
                                      generatedImages[0].id
                                    }
                                  >
                                    {downloadingImageId ===
                                    generatedImages[0].id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="mr-2 h-4 w-4" />
                                    )}
                                    {t('result.download')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-full px-6"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t('result.retry')}
                                  </Button>
                                </div>
                              </div>
                            ) : previewImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={previewImage}
                                alt="Sample image"
                                className="h-full w-full rounded-lg object-contain shadow-lg"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <ImageIcon className="mx-auto mb-3 h-8 w-8" />
                                  <p className="text-sm">
                                    {t('workbench.no_preview')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent
          pageScroll
          className="w-full !max-w-none rounded-[26px] p-0 sm:max-w-[1600px] sm:rounded-2xl sm:p-5 sm:pt-0"
          overlayClassName="bg-black/25 backdrop-blur-sm"
        >
          <DialogHeader className="px-5 pt-4 pb-3 text-left sm:px-0 sm:pt-0 sm:pb-0">
            <DialogTitle className="text-xl font-bold">
              {t('pricing_dialog_title')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {pricingConfig.description}
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 pt-3 sm:px-0 sm:pb-0 sm:pt-0">
            <PricingBlock
              pricing={pricingConfig}
              className="pt-0 sm:pt-2"
              hideHeader
              compact
              hideWhyYearly
              hideCompareTable
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
