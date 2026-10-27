export const PROMPT_MODERATION_ERRORS = {
  BLOCKED: 'NSFW_PROMPT_BLOCKED',
  CONFIG_MISSING: 'NSFW_MODERATION_CONFIG_MISSING',
  FAILED: 'NSFW_MODERATION_FAILED',
} as const;

export type PromptModerationResult = {
  allowed: boolean;
  reason?: string;
  categories?: string[];
};

export async function moderatePromptWithDeepSeek({
  prompt,
  apiKey,
  baseUrl = 'https://api.deepseek.com',
  model = 'deepseek-v4-flash',
}: {
  prompt: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}): Promise<PromptModerationResult> {
  if (!apiKey) {
    throw new Error(PROMPT_MODERATION_ERRORS.CONFIG_MISSING);
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      // SEC-12：审核服务挂起时 5 秒内超时，避免拖死 generate 接口
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是 AI 生成内容的文本安全审核器。只判断用户输入的提示词是否允许用于生成图片、视频或音乐内容。请只返回 JSON 对象，不要返回 markdown。JSON 格式：{"allowed":boolean,"reason":string,"categories":string[]}。如果包含色情、裸露、未成年人性化、性暴力、露骨性行为、严重暴力血腥、违法仇恨或其他不适合生成的内容，allowed=false；否则 allowed=true。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(PROMPT_MODERATION_ERRORS.FAILED);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error(PROMPT_MODERATION_ERRORS.FAILED);
    }

    const parsed = JSON.parse(content);
    return {
      allowed: parsed.allowed === true,
      reason: typeof parsed.reason === 'string' ? parsed.reason : '',
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    };
  } catch (error: any) {
    if (error?.message === PROMPT_MODERATION_ERRORS.CONFIG_MISSING) {
      throw error;
    }

    throw new Error(PROMPT_MODERATION_ERRORS.FAILED);
  }
}
