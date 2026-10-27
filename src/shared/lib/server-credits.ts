// SEC-02：服务端独立计价，不信任客户端传入的 credits。
// 计价逻辑从 image.tsx / video.tsx 的前端 useMemo 移植，规则唯一来源与 plan-credits.ts 一致。

import {
  getModelsByMode,
  VIDEO_RESOLUTION_OPTIONS,
} from '@/shared/blocks/generator/models';
import {
  applyPlanDiscount,
  getBaseCredits,
  getResolutionMultiplier,
} from '@/shared/lib/plan-credits';

/** api model（提交给上游的 model 值）-> 工作台模型 id */
const API_MODEL_TO_ID: Record<string, string> = {};
for (const m of [...getModelsByMode('image'), ...getModelsByMode('video')]) {
  const apiModels = m.params?.apiModels;
  if (!apiModels) continue;
  for (const apiModel of Object.values(apiModels)) {
    if (apiModel && !API_MODEL_TO_ID[apiModel]) {
      API_MODEL_TO_ID[apiModel] = m.id;
    }
  }
}

function resolveModelId(model: string): string {
  return API_MODEL_TO_ID[model] ?? model;
}

function findModelConfig(modelId: string) {
  return (
    [...getModelsByMode('image'), ...getModelsByMode('video')].find(
      (m) => m.id === modelId
    ) ?? null
  );
}

/** 图片生成服务端计价：基准积分 × 画质倍率 × 数量 × 套餐折扣 */
export function calcImageCostCredits(
  model: string,
  options: any,
  productId: string
): number {
  const modelId = resolveModelId(model);
  const baseCredits = getBaseCredits(modelId) ?? 40;

  const quality = options?.quality_style;
  const qualityMultiplier =
    quality === 'hd' ? 2 : quality === 'ultra' ? 4 : 1;

  const quantityMultiplier = Math.max(
    1,
    Number.parseInt(String(options?.output_count ?? '1'), 10) || 1
  );

  const raw = baseCredits * qualityMultiplier * quantityMultiplier;
  const applied = applyPlanDiscount(modelId, productId, raw);
  return applied === 'free' ? 0 : applied;
}

/** 视频生成服务端计价：基准(5秒价)÷5 × ceil(时长) × 2^分辨率档 × 套餐折扣 */
export function calcVideoCostCredits(
  model: string,
  options: any,
  productId: string
): number {
  const modelId = resolveModelId(model);
  const config = findModelConfig(modelId);
  const baseCredits = getBaseCredits(modelId) ?? 40;

  const showResolution = !!config?.params?.resolutionField;
  const showDuration = !!config?.params?.durationField;

  const baseResolution =
    config?.params?.resolutionOptions?.[0] ?? VIDEO_RESOLUTION_OPTIONS[0];
  const resMultiplier = showResolution
    ? getResolutionMultiplier(
        String(options?.[config!.params!.resolutionField!] ?? ''),
        baseResolution
      )
    : 1;

  const seconds = showDuration
    ? Math.ceil(Number(options?.[config!.params!.durationField!]) || 5)
    : 5;

  const raw = (baseCredits / 5) * seconds * resMultiplier;
  const applied = applyPlanDiscount(modelId, productId, raw);
  return applied === 'free' ? 0 : applied;
}

/** 音乐生成服务端计价：固定积分（与前端 music.tsx 展示口径一致） */
export function calcMusicCostCredits(): number {
  return 10;
}
