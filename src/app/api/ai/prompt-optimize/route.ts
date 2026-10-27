import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';

const PROMPT_OPTIMIZE_TIMEOUT_MS = 15000;
const MAX_OPTIMIZE_INPUT_LENGTH = 4000;

/**
 * AI 提示词优化（BUG-14）
 * 复用 DeepSeek 文本通道：优先 prompt_optimize_* 配置，缺省回落到审核同款 key。
 * 未配置 key 时返回 not configured，前端据此隐藏按钮。
 */
export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { prompt } = await req.json();
    const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
    if (!trimmed) {
      return respErr('prompt is required');
    }
    if (trimmed.length > MAX_OPTIMIZE_INPUT_LENGTH) {
      return respErr('prompt too long');
    }

    const configs = await getAllConfigs();
    const apiKey =
      configs.prompt_optimize_api_key || configs.prompt_moderation_api_key;
    if (!apiKey) {
      return respErr('prompt optimize not configured');
    }
    const baseUrl =
      configs.prompt_optimize_base_url || 'https://api.deepseek.com';
    const model = configs.prompt_optimize_model || 'deepseek-v4-flash';

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(PROMPT_OPTIMIZE_TIMEOUT_MS),
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
                '你是 AI 绘画提示词优化器。把用户的提示词改写为更具体、更具画面感的高质量英文提示词：补充主体细节、光线、构图、风格等要素，但不得改变用户的核心意图，不添加品牌名、真实人名或违禁内容。只返回优化后的英文提示词本身，不要任何解释、引号或 markdown。',
            },
            {
              role: 'user',
              content: trimmed,
            },
          ],
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      return respErr('prompt optimize failed');
    }

    const result = await response.json();
    const optimized = result?.choices?.[0]?.message?.content;
    if (!optimized || typeof optimized !== 'string' || !optimized.trim()) {
      return respErr('prompt optimize failed');
    }

    return respData({ prompt: optimized.trim() });
  } catch (error: any) {
    return respErr(error?.message || 'prompt optimize failed');
  }
}
