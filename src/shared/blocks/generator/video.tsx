'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CloudUpload,
  Coins,
  Download,
  Film,
  Loader2,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  getModelsByMode,
  RATIO_OPTIONS,
  VIDEO_DURATION,
  VIDEO_RESOLUTION_OPTIONS,
} from '@/shared/blocks/generator/models';
import { ModelSelect } from '@/shared/blocks/generator/model-select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  applyPlanDiscount,
  getBaseCredits,
  getResolutionMultiplier,
} from '@/shared/lib/plan-credits';
import { cn } from '@/shared/lib/utils';
import type { Subscription } from '@/shared/models/subscription';

interface VideoGeneratorProps {
  maxSizeMB?: number;
  srOnlyTitle?: string;
  onSwitchToImage?: () => void;
  /** 锁定模式（内页直接嵌入时）：模式区渲染为纯文字标识，不提供切换 */
  modeLocked?: boolean;
  /** 服务端查库得到的当前订阅（与 settings/billing 页同源） */
  currentSubscription?: Subscription;
}

interface GeneratedVideo {
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

type VideoGeneratorTab = 'text-to-video' | 'image-to-video' | 'video-to-video';

const POLL_INTERVAL = 15000;
const GENERATION_TIMEOUT = 600000; // 10 minutes for video
const MAX_PROMPT_LENGTH = 2000;

const MODEL_OPTIONS = [
  // Replicate models
  {
    value: 'google/veo-3.1',
    label: 'Veo 3.1',
    provider: 'replicate',
    scenes: ['text-to-video', 'image-to-video'],
  },
  {
    value: 'openai/sora-2',
    label: 'Sora 2',
    provider: 'replicate',
    scenes: ['text-to-video', 'image-to-video'],
  },
  // Fal models
  {
    value: 'fal-ai/veo3',
    label: 'Veo 3',
    provider: 'fal',
    scenes: ['text-to-video'],
  },
  {
    value: 'fal-ai/wan-pro/image-to-video',
    label: 'Wan Pro',
    provider: 'fal',
    scenes: ['image-to-video'],
  },
  {
    value: 'fal-ai/kling-video/o1/video-to-video/edit',
    label: 'Kling Video O1',
    provider: 'fal',
    scenes: ['video-to-video'],
  },
  // Kie models
  {
    value: 'sora-2-pro-image-to-video',
    label: 'Sora 2 Pro',
    provider: 'kie',
    scenes: ['image-to-video'],
  },
  {
    value: 'sora-2-pro-text-to-video',
    label: 'Sora 2 Pro',
    provider: 'kie',
    scenes: ['text-to-video'],
  },
];

// seevideo 展示模型 id -> 后端可用模型（provider/value）映射
const SEEVIDEO_VIDEO_MODEL_MAP: Record<
  string,
  { value: string; provider: string }
> = {
  'veo-3-1-premium': { value: 'google/veo-3.1', provider: 'replicate' },
  'veo-3-1-lite': { value: 'google/veo-3.1', provider: 'replicate' },
  'veo-3-1-basic': { value: 'google/veo-3.1', provider: 'replicate' },
  'veo-3-premium': { value: 'fal-ai/veo3', provider: 'fal' },
  'veo-3-basic': { value: 'fal-ai/veo3', provider: 'fal' },
  'gemini-omni-flash-1-1': { value: 'openai/sora-2', provider: 'replicate' },
  'gemini-omni': { value: 'openai/sora-2', provider: 'replicate' },
  'minimax-h3': { value: 'openai/sora-2', provider: 'replicate' },
  'minimax-h3-max-turbo': { value: 'openai/sora-2', provider: 'replicate' },
  'ltx-2-5-fast': { value: 'fal-ai/veo3', provider: 'fal' },
  'seedance-2-5': { value: 'openai/sora-2', provider: 'replicate' },
  'seedance-2-0': { value: 'openai/sora-2', provider: 'replicate' },
  'seedance-2-0-fast': { value: 'openai/sora-2', provider: 'replicate' },
  'seedance-2-0-mini': { value: 'openai/sora-2', provider: 'replicate' },
  'seedance-1-5-pro': { value: 'openai/sora-2', provider: 'replicate' },
  'pixverse-v6': { value: 'fal-ai/veo3', provider: 'fal' },
  'wan-3-0-prime': {
    value: 'fal-ai/wan-pro/image-to-video',
    provider: 'fal',
  },
  'wan-3-0': { value: 'fal-ai/wan-pro/image-to-video', provider: 'fal' },
  'wan-2-5': { value: 'fal-ai/wan-pro/image-to-video', provider: 'fal' },
  'kling-2-5': {
    value: 'fal-ai/kling-video/o1/video-to-video/edit',
    provider: 'fal',
  },
  'kling-2-1-master': {
    value: 'fal-ai/kling-video/o1/video-to-video/edit',
    provider: 'fal',
  },
  'kling-2-1-pro': {
    value: 'fal-ai/kling-video/o1/video-to-video/edit',
    provider: 'fal',
  },
  'grok-imagine-video': { value: 'openai/sora-2', provider: 'replicate' },
};

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

function extractVideoUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  // check videos array first
  const videos = result.videos;
  if (videos && Array.isArray(videos)) {
    return videos
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return (
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl
          );
        }
        return null;
      })
      .filter(Boolean);
  }

  // check output
  const output = result.output ?? result.video ?? result.data;

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
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function VideoGenerator({
  maxSizeMB = 50,
  srOnlyTitle,
  onSwitchToImage,
  modeLocked = false,
  currentSubscription: serverSubscription,
}: VideoGeneratorProps) {
  const t = useTranslations('ai.video.generator');

  const [activeTab, setActiveTab] =
    useState<VideoGeneratorTab>('text-to-video');

  const [model, setModel] = useState(
    () => getModelsByMode('video').find((m) => !m.locked)?.id ?? ''
  );
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [aspectRatioOpen, setAspectRatioOpen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(VIDEO_DURATION.default);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [generateAudio, setGenerateAudio] = useState(false);
  const [publicVisible, setPublicVisible] = useState(false);
  const [endFrameEnabled, setEndFrameEnabled] = useState(false);
  const [singleVideoImage, setSingleVideoImage] = useState<{
    url: string;
    preview: string;
  } | null>(null);
  const [isReferenceUploading, setIsReferenceUploading] = useState(false);
  const [referenceUploadError, setReferenceUploadError] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToVideoMode = activeTab === 'text-to-video';
  const isImageToVideoMode = activeTab === 'image-to-video';

  // 当前模型的差异参数配置（控件支持范围 + 提交字段名）
  const currentModelParams = useMemo(
    () => getModelsByMode('video').find((m) => m.id === model)?.params ?? null,
    [model]
  );
  // 当前模型支持的宽高比选项
  const availableRatioOptions = useMemo(
    () =>
      RATIO_OPTIONS.filter(
        (option) =>
          !currentModelParams?.ratioOptions ||
          currentModelParams.ratioOptions.includes(option.value)
      ),
    [currentModelParams]
  );
  // 当前模型的分辨率档位
  const availableResolutionOptions = useMemo(
    () =>
      currentModelParams?.resolutionOptions ?? VIDEO_RESOLUTION_OPTIONS,
    [currentModelParams]
  );
  // 控件显隐：有差异配置时按配置，未配置的模型走现有通用行为
  const showAspectRatio = currentModelParams
    ? !!currentModelParams.ratioField
    : true;
  const showDuration = currentModelParams
    ? !!currentModelParams.durationField
    : true;
  const showResolution = currentModelParams
    ? !!currentModelParams.resolutionField
    : true;
  const showGenerateAudio = currentModelParams
    ? !!currentModelParams.audioField
    : true;

  // 积分：json 基准（5 秒价）÷5 × ceil(时长) × 2^分辨率档 × 套餐折扣
  const activeSubscription = serverSubscription ?? user?.currentSubscription;
  const currentProductId = activeSubscription?.productId ?? '';
  const { costCredits, creditsFree } = useMemo(() => {
    const baseCredits = getBaseCredits(model) ?? 40;
    const baseResolution = availableResolutionOptions[0] ?? '480p';
    const resMultiplier = showResolution
      ? getResolutionMultiplier(videoResolution, baseResolution)
      : 1;
    const seconds = showDuration ? Math.ceil(videoDuration) : 5;
    const raw = (baseCredits / 5) * seconds * resMultiplier;
    const applied = applyPlanDiscount(model, currentProductId, raw);
    return applied === 'free'
      ? { costCredits: 0, creditsFree: true }
      : { costCredits: applied, creditsFree: false };
  }, [
    model,
    currentProductId,
    videoDuration,
    videoResolution,
    availableResolutionOptions,
    showResolution,
    showDuration,
  ]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as VideoGeneratorTab);
  };

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your video...';
      case AITaskStatus.SUCCESS:
        return 'Video generation completed';
      case AITaskStatus.FAILED:
        return 'Generation failed';
      default:
        return '';
    }
  }, [taskStatus]);

  // 单图上传：本地预览 + 上传到 /api/upload 换取 url
  const uploadReferenceFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    const preview = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const formData = new FormData();
    formData.append('file', file);

    setIsReferenceUploading(true);
    setReferenceUploadError(false);

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
      setReferenceUploadError(true);
      return null;
    } finally {
      setIsReferenceUploading(false);
    }
  }, []);

  const handleSingleVideoImageChange = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !file.type.startsWith('image/')) {
        return;
      }
      const uploaded = await uploadReferenceFile(file);
      if (!uploaded) {
        return;
      }
      setSingleVideoImage(uploaded);
    },
    [uploadReferenceFile, t]
  );

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Video generation timed out. Please try again.');
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
        const videoUrls = extractVideoUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (videoUrls.length > 0) {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 5, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            toast.error('The provider returned no videos. Please retry.');
          } else {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Video generated successfully');
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate video failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 3, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling video task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [generationStartTime, resetTaskState]
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
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && isTextToVideoMode) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    // 按当前模型差异配置选择提交渠道与 model 值；未配置的模型走现有渠道映射
    const scene: 'text-to-video' | 'image-to-video' = isImageToVideoMode
      ? 'image-to-video'
      : 'text-to-video';

    let targetModel: { value: string; provider: string } | undefined;

    if (currentModelParams?.apiModels?.[scene]) {
      targetModel = {
        value: currentModelParams.apiModels[scene]!,
        provider: currentModelParams.provider ?? 'kie',
      };
    } else {
      const mapped = SEEVIDEO_VIDEO_MODEL_MAP[model];
      const backendModel = mapped
        ? MODEL_OPTIONS.find(
            (option) =>
              option.value === mapped.value &&
              option.provider === mapped.provider &&
              option.scenes.includes(activeTab)
          )
        : undefined;
      targetModel =
        backendModel ?? MODEL_OPTIONS.find((o) => o.scenes.includes(activeTab));
    }

    if (!targetModel) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (isImageToVideoMode && !singleVideoImage) {
      toast.error('Please upload a reference image before generating.');
      return;
    }

    // 图生视频：配置了 params 但未配置参考图字段名 → 报错终止
    if (
      isImageToVideoMode &&
      currentModelParams &&
      !currentModelParams.imageInputField &&
      !currentModelParams.firstFrameField
    ) {
      toast.error('该模型参考图提交字段未配置，已取消本次提交');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideos([]);
    setGenerationStartTime(Date.now());

    try {
      const options: any = {};

      // 参考图：按模型的字段名提交（单张/多张），尾帧开启时提交尾帧字段
      if (isImageToVideoMode && singleVideoImage) {
        const inputField =
          currentModelParams?.imageInputField ??
          currentModelParams?.firstFrameField ??
          'image_input';
        options[inputField] = currentModelParams?.imageInputMultiple
          ? [singleVideoImage.url]
          : singleVideoImage.url;
        if (endFrameEnabled) {
          options[currentModelParams?.lastFrameField ?? 'last_frame_image'] =
            singleVideoImage.url;
        }
      }

      // 宽高比：按模型的字段名与枚举映射提交
      if (showAspectRatio && aspectRatio) {
        options[currentModelParams?.ratioField ?? 'aspect_ratio'] =
          currentModelParams?.ratioValueMap?.[aspectRatio] ?? aspectRatio;
      }

      // 分辨率：按模型的字段名提交
      if (showResolution) {
        options[currentModelParams?.resolutionField ?? 'resolution'] =
          videoResolution;
      }

      // 时长：按模型的字段名提交
      if (showDuration) {
        options[currentModelParams?.durationField ?? 'video_duration'] =
          videoDuration;
      }

      // 生成音频：按模型的字段名提交
      if (showGenerateAudio) {
        options[currentModelParams?.audioField ?? 'generate_audio'] =
          generateAudio;
      }

      options.public_visible = publicVisible;

      // 按场景附加固定字段（如 veo3 的 generation_type）
      if (currentModelParams?.sceneExtraFields?.[scene]) {
        Object.assign(options, currentModelParams.sceneExtraFields[scene]);
      }

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: activeTab,
          provider: targetModel.provider,
          model: targetModel.value,
          prompt: trimmedPrompt,
          options,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create a video task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (videoUrls.length > 0) {
          setGeneratedVideos(
            videoUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider: targetModel.provider,
              model: targetModel.value,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Video generated successfully');
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      toast.error(`Failed to generate video: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadVideo = async (video: GeneratedVideo) => {
    if (!video.url) {
      return;
    }

    try {
      setDownloadingVideoId(video.id);
      // fetch video via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Video downloaded');
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  return (
    <section className={cn('w-full', srOnlyTitle ? 'has-sr-title' : '')}>
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
                <div className="flex h-full flex-col rounded-xl border border-border/50 bg-form-background shadow-lg">
                  {/* 顶部：模式切换 + 模型选择 */}
                  <div className="flex-shrink-0 p-6 pb-2">
                    <div className="flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between">
                      {modeLocked ? (
                        <div className="tracking-tight text-xl font-bold">
                          {t('workbench.mode_locked_video')}
                        </div>
                      ) : (
                      <div className="grid h-8 w-full grid-cols-2 items-center rounded-full border border-white/[0.06] bg-black/40 p-0.5 sm:flex sm:h-9 sm:w-auto sm:flex-shrink-0">
                        <button
                          type="button"
                          className="relative flex h-7 items-center justify-center whitespace-nowrap rounded-full text-xs transition-all sm:h-8 sm:px-4 sm:text-sm font-medium text-white"
                        >
                          <span className="absolute inset-0 rounded-full bg-white/[0.12]" />
                          <span className="relative z-10">
                            {t('workbench.mode_video')}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={onSwitchToImage}
                          className="relative flex h-7 items-center justify-center whitespace-nowrap rounded-full text-xs transition-all sm:h-8 sm:px-4 sm:text-sm text-gray-500 hover:text-gray-300"
                        >
                          <span className="relative z-10">
                            {t('workbench.mode_image')}
                          </span>
                        </button>
                      </div>
                      )}
                      <ModelSelect
                        mode="video"
                        value={model}
                        onChange={setModel}
                        currentProductId={currentProductId}
                      />
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col p-6 pt-2">
                    {/* 文本转 / 图片转 tab */}
                    <div className="mb-4 flex-shrink-0">
                      <div className="relative flex w-full border-b border-border/40">
                        <button
                          type="button"
                          onClick={() => handleTabChange('text-to-video')}
                          className={cn(
                            'relative whitespace-nowrap py-2.5 text-center text-sm font-medium transition-colors flex-1',
                            isTextToVideoMode
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground/70'
                          )}
                        >
                          {t('workbench.tab_text')}
                          {isTextToVideoMode ? (
                            <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[hsl(var(--highlight))]" />
                          ) : null}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange('image-to-video')}
                          className={cn(
                            'relative whitespace-nowrap py-2.5 text-center text-sm font-medium transition-colors flex-1',
                            isImageToVideoMode
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground/70'
                          )}
                        >
                          {t('workbench.tab_image')}
                          {isImageToVideoMode ? (
                            <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[hsl(var(--highlight))]" />
                          ) : null}
                        </button>
                      </div>
                    </div>

                    {/* 滚动表单区 */}
                    <div className="custom-scrollbar mb-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
                      {/* 图片转视频：上传图片 */}
                      {isImageToVideoMode ? (
                        <div className="space-y-1">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-medium text-sm text-foreground">
                                {t('workbench.upload_image')}
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {t('workbench.end_frame')}
                                </span>
                                <Switch
                                  checked={endFrameEnabled}
                                  onCheckedChange={setEndFrameEnabled}
                                />
                              </div>
                            </div>
                            <label className="media-card-surface media-card-surface-hover group relative block cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                  handleSingleVideoImageChange(
                                    event.target.files
                                  );
                                  event.target.value = '';
                                }}
                              />
                              {singleVideoImage ? (
                                <div className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={singleVideoImage.preview}
                                    alt=""
                                    className="h-40 w-full rounded-[inherit] object-cover"
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      setSingleVideoImage(null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-4 p-8">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--highlight))]/10 transition-colors group-hover:bg-[hsl(var(--highlight))]/20">
                                    <CloudUpload className="h-8 w-8 text-[hsl(var(--highlight))] transition-colors group-hover:text-[hsl(var(--highlight-hover))]" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">
                                      {t('workbench.drop_image')}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {t('workbench.image_format', {
                                        size: maxSizeMB,
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </label>
                            {referenceUploadError ? (
                              <p className="text-destructive text-xs">
                                {t('workbench.upload_failed')}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {/* 提示词 */}
                      <div className="space-y-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <label className="font-medium text-sm text-foreground">
                                {t('workbench.prompt')}
                              </label>
                            </div>
                          </div>
                          <Textarea
                            id="video-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('workbench.prompt_placeholder')}
                            maxLength={MAX_PROMPT_LENGTH}
                            className="min-h-[100px] resize-y border-border/50 bg-card pr-10 transition-colors duration-200 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 md:min-h-[140px]"
                          />
                        </div>
                        <div className="flex justify-end text-xs">
                          <span className="text-muted-foreground">
                            {promptLength}/{MAX_PROMPT_LENGTH}
                          </span>
                        </div>
                      </div>

                      {/* 宽高比（模型不支持时隐藏） */}
                      {showAspectRatio ? (
                      <div className="space-y-1">
                        <div className="space-y-2">
                          <label className="font-semibold text-sm text-foreground">
                            {t('workbench.aspect_ratio')}
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setAspectRatioOpen((prev) => !prev)}
                              aria-expanded={aspectRatioOpen}
                              className="flex min-h-[64px] w-full items-center justify-between rounded-xl border border-border/10 bg-card/45 px-4 py-3 text-left transition-colors hover:bg-card/60"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="ratio-preview-box-wide shrink-0 rounded border-2 border-muted-foreground" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {t('workbench.aspect_ratio')}
                                  </p>
                                  <p className="truncate text-sm font-bold text-foreground">
                                    {aspectRatio}
                                  </p>
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn(
                                  'h-4 w-4 rotate-90 text-muted-foreground transition-transform',
                                  aspectRatioOpen && 'rotate-[-90deg]'
                                )}
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                            {aspectRatioOpen ? (
                              <div className="absolute inset-x-0 top-full z-30 mt-1 grid grid-cols-4 gap-2 rounded-xl border border-border/40 bg-card p-3 shadow-lg">
                                {availableRatioOptions.map((option) => (
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

                      {/* 视频时长（档位 / 滑块，模型不支持时隐藏） */}
                      {showDuration ? (
                      <div className="space-y-1">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-semibold text-sm text-foreground">
                              {t('workbench.video_duration')}
                            </label>
                            <span className="text-sm font-bold text-foreground">
                              {videoDuration}s
                            </span>
                          </div>
                          {currentModelParams?.durationOptions ? (
                            <div className="grid grid-cols-4 gap-2 px-1">
                              {currentModelParams.durationOptions.map(
                                (option) => {
                                  const active = videoDuration === option;
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => setVideoDuration(option)}
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
                                        {option}s
                                      </span>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <div className="relative px-2 pb-1">
                              <input
                                type="range"
                                min={VIDEO_DURATION.min}
                                max={VIDEO_DURATION.max}
                                step={1}
                                value={videoDuration}
                                onChange={(event) =>
                                  setVideoDuration(Number(event.target.value))
                                }
                                className="duration-slider w-full cursor-pointer"
                                aria-label={t('workbench.video_duration')}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      ) : null}

                      {/* 分辨率（模型不支持时隐藏） */}
                      {showResolution ? (
                      <div className="space-y-1">
                        <div className="mb-2 flex items-center gap-1">
                          <label className="font-medium text-sm text-foreground">
                            {t('workbench.resolution')}
                          </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-1">
                          {availableResolutionOptions.map((option) => {
                            const active = videoResolution === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setVideoResolution(option)}
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
                      ) : null}

                      {/* 生成音频（模型不支持时隐藏） */}
                      {showGenerateAudio ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {t('workbench.generate_audio')}
                          </span>
                          <Switch
                            checked={generateAudio}
                            onCheckedChange={setGenerateAudio}
                          />
                        </div>
                      </div>
                      ) : null}

                      {/* 公开可见性 */}
                      <div className="mt-4 pt-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {t('workbench.public_visibility')}
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

                      {/* 生成进度 */}
                      {isGenerating ? (
                        <div className="space-y-2 rounded-lg border p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>{t('workbench.generating')}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[hsl(var(--highlight))] transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          {taskStatusLabel ? (
                            <p className="text-muted-foreground text-center text-xs">
                              {taskStatusLabel}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {/* 底部固定区：积分 + 生成按钮 */}
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
                            <span className="text-md font-bold text-[hsl(var(--highlight))]">
                              {creditsFree ? '免费' : costCredits}
                            </span>
                          </div>
                        </div>
                        {!isMounted || isCheckSign ? (
                          <button
                            type="button"
                            disabled
                            className="gradient-button inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('workbench.loading')}
                          </button>
                        ) : user ? (
                          <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={
                              isGenerating ||
                              (isTextToVideoMode && !prompt.trim()) ||
                              isPromptTooLong ||
                              isReferenceUploading ||
                              referenceUploadError ||
                              (isImageToVideoMode && !singleVideoImage)
                            }
                            className="gradient-button inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('workbench.generating')}
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                {t('workbench.generate')}
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsShowSignModal(true)}
                            className="gradient-button inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90"
                          >
                            <Sparkles className="h-4 w-4" />
                            Upgrade to Generate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右栏：预览区 */}
              <div className="w-full min-w-0">
                <div className="flex h-full gap-2 md:gap-4">
                  <div className="flex h-full min-w-0 flex-1 flex-col rounded-xl border border-border/30 bg-form-background shadow backdrop-blur-md">
                    <div className="flex-shrink-0 p-6 pb-2">
                      <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                        <Film className="h-5 w-5 text-primary" />
                        <span className="gradient-text">
                          {t('workbench.my_videos')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-6 pt-0">
                      {generatedVideos.length > 0 ? (
                        <div className="custom-scrollbar h-full space-y-6 overflow-y-auto pr-2 md:pr-4">
                          {generatedVideos.map((video) => (
                            <div key={video.id} className="space-y-3">
                              <div className="relative overflow-hidden rounded-lg border">
                                <video
                                  src={video.url}
                                  controls
                                  className="h-auto w-full"
                                  preload="metadata"
                                />
                                <button
                                  type="button"
                                  className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                                  onClick={() => handleDownloadVideo(video)}
                                  disabled={downloadingVideoId === video.id}
                                >
                                  {downloadingVideoId === video.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-full w-full flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--highlight))]/10">
                              <Video className="h-10 w-10 text-[hsl(var(--highlight))]" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isGenerating
                                ? t('workbench.generating_video_hint')
                                : t('workbench.empty_video_hint')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
