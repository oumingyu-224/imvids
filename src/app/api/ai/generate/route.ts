import { envConfigs } from '@/config';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import {
  calcImageCostCredits,
  calcMusicCostCredits,
  calcVideoCostCredits,
} from '@/shared/lib/server-credits';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getAllConfigs } from '@/shared/models/config';
import { getRemainingCredits } from '@/shared/models/credit';
import { getCurrentSubscription } from '@/shared/models/subscription';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import {
  isPromptModerationEnabled,
  moderatePrompt,
  PROMPT_MODERATION_ERRORS,
} from '@/shared/services/moderation';

export async function POST(request: Request) {
  try {
    let { provider, mediaType, model, prompt, options, scene } =
      await request.json();

    if (!provider || !mediaType || !model) {
      throw new Error('invalid params');
    }

    if (!prompt && !options) {
      throw new Error('prompt or options is required');
    }

    const aiService = await getAIService();

    // check generate type
    if (!aiService.getMediaTypes().includes(mediaType)) {
      throw new Error('invalid mediaType');
    }

    // check ai provider
    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      throw new Error('invalid provider');
    }

    // get current user
    const user = await getUserInfo();
    if (!user) {
      throw new Error('no auth, please sign in');
    }

    // SEC-02：服务端按 model + 参数独立计价，客户端传入的 credits 一律不信任
    const subscription = await getCurrentSubscription(user.id);
    const productId = subscription?.productId ?? '';
    let costCredits: number;
    if (mediaType === AIMediaType.IMAGE) {
      costCredits = calcImageCostCredits(model, options, productId);
    } else if (mediaType === AIMediaType.VIDEO) {
      costCredits = calcVideoCostCredits(model, options, productId);
    } else {
      costCredits = calcMusicCostCredits();
    }

    if (mediaType === AIMediaType.IMAGE) {
      scene =
        Array.isArray(options?.image_input) && options.image_input.length > 0
          ? 'image-to-image'
          : 'text-to-image';
    } else if (mediaType === AIMediaType.VIDEO) {
      if (
        scene !== 'text-to-video' &&
        scene !== 'image-to-video' &&
        scene !== 'video-to-video'
      ) {
        throw new Error('invalid scene');
      }
    } else if (mediaType === AIMediaType.MUSIC) {
      scene = 'text-to-music';
    } else {
      throw new Error('invalid mediaType');
    }

    const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : '';

    // SEC-05：IMAGE/VIDEO/MUSIC 的文字 prompt 统一送审，不再仅限图片
    if (trimmedPrompt) {
      const configs = await getAllConfigs();

      if (isPromptModerationEnabled(configs)) {
        const moderation = await moderatePrompt({
          prompt: trimmedPrompt,
          configs,
        });

        if (!moderation.allowed) {
          return respErr(PROMPT_MODERATION_ERRORS.BLOCKED);
        }
      }
    }

    // check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) {
      throw new Error('insufficient credits');
    }

    const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;

    const params: any = {
      mediaType,
      model,
      prompt,
      callbackUrl,
      options,
    };

    // generate content
    const result = await aiProvider.generate({ params });
    if (!result?.taskId) {
      throw new Error(
        `ai generate failed, mediaType: ${mediaType}, provider: ${provider}, model: ${model}`
      );
    }

    // create ai task
    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider,
      model,
      prompt,
      scene,
      options: options ? JSON.stringify(options) : null,
      status: result.taskStatus,
      costCredits,
      taskId: result.taskId,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };
    await createAITask(newAITask);

    return respData(newAITask);
  } catch (e: any) {
    console.log('generate failed', e);
    return respErr(e.message);
  }
}
