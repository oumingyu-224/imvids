import type { Configs } from '@/shared/types/config';

import {
  moderatePromptWithDeepSeek,
  PROMPT_MODERATION_ERRORS,
  type PromptModerationResult,
} from './deepseek';

export { PROMPT_MODERATION_ERRORS };
export type { PromptModerationResult };

export function isPromptModerationEnabled(configs: Configs) {
  return configs.prompt_moderation_enabled === 'true';
}

export async function moderatePrompt({
  prompt,
  configs,
}: {
  prompt: string;
  configs: Configs;
}): Promise<PromptModerationResult> {
  const provider = configs.prompt_moderation_provider || 'deepseek';

  if (provider !== 'deepseek') {
    console.warn(
      'prompt_moderation_enabled=true but provider is unsupported:',
      provider
    );
    throw new Error(PROMPT_MODERATION_ERRORS.CONFIG_MISSING);
  }

  if (!configs.prompt_moderation_deepseek_api_key) {
    // SEC-12：开关开启但审核 key 缺失时打告警（fail-closed，直接拒绝）
    console.warn(
      'prompt_moderation_enabled=true but prompt_moderation_deepseek_api_key is missing'
    );
  }

  return moderatePromptWithDeepSeek({
    prompt,
    apiKey: configs.prompt_moderation_deepseek_api_key || '',
    baseUrl:
      configs.prompt_moderation_deepseek_base_url ||
      'https://api.deepseek.com',
    model: configs.prompt_moderation_deepseek_model || 'deepseek-v4-flash',
  });
}
