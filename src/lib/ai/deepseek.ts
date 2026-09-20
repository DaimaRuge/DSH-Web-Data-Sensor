export interface DeepSeekAnalysisResult {
  summary: string;
  tags: string[];
  suggestedTopic?: string;
}

export interface DeepSeekModelItem {
  id: string;
  object: string;
  owned_by: string;
}

/**
 * 从 DeepSeek 官方 API 动态拉取当前可用的模型列表
 * 官方文档: GET https://api.deepseek.com/models
 */
export async function fetchAvailableModels(
  apiKey: string,
  baseUrl = 'https://api.deepseek.com'
): Promise<string[]> {
  if (!apiKey) return [];
  try {
    let cleanBase = baseUrl.replace(/\/$/, '');
    if (cleanBase.endsWith('/v1')) {
      cleanBase = cleanBase.slice(0, -3);
    }
    const endpoint = `${cleanBase}/models`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        return data.data.map((m: DeepSeekModelItem) => m.id);
      }
    }
  } catch (err) {
    console.warn('获取 DeepSeek 模型列表失败:', err);
  }
  // 默认官方推荐模型清单（DeepSeek V4.1 Flash 为当前主流推荐）
  return ['deepseek-flash', 'deepseek flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'];
}

/**
 * 提取文本中可能包含的 JSON 字符串（兼容 markdown 代码块与纯文本）
 */
function extractJsonBlock(text: string): string {
  // 1. 尝试匹配 ```json ... ``` 或 ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  // 2. 尝试提取首个 { 到 最后一个 } 之间的内容
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

/**
 * 调用 DeepSeek API 进行智能预处理：自动提炼2句核心摘要、提取 3-5 个高相关标签
 * 严格按照官方文档规范适配 OpenAI 兼容模式
 */
export async function analyzeContentWithDeepSeek(
  content: string,
  apiKey: string,
  model = 'deepseek-flash',
  baseUrl = 'https://api.deepseek.com'
): Promise<DeepSeekAnalysisResult | null> {
  if (!apiKey) {
    return null;
  }

  // 截取前 4000 个字符进行快速摘要分析，节约 token 并提升响应速度
  const snippet = content.slice(0, 4000);

  const systemPrompt = `你是一个专业的个人文献与知识管理(DSH)助理。你的任务是对用户采集的多模态文献、AI 对话或调研线索进行快速结构化预处理。
请严格输出符合以下 JSON 格式的内容，必须包含 "json" 且字段完整：
{
  "summary": "1~2句话提炼该线索的核心结论与高价值信息点，中文简洁表述",
  "tags": ["标签1", "标签2", "标签3", "标签4"],
  "suggestedTopic": "推荐归属的调研主题分类，如 架构设计 / 算法原理 / 竞品调研 / 论文笔记"
}`;

  try {
    let cleanBase = baseUrl.replace(/\/$/, '');
    if (cleanBase.endsWith('/v1')) {
      cleanBase = cleanBase.slice(0, -3);
    }
    const endpoint = `${cleanBase}/chat/completions`;

    // 官方文档特别注意点：deepseek-reasoner 不支持 response_format 和 temperature 参数
    const isReasoner = model.toLowerCase().includes('reasoner');

    const requestBody: Record<string, unknown> = {
      model: model || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请以 JSON 格式对以下内容进行快速提炼分析：\n\n${snippet}` },
      ],
      max_tokens: 1024, // 官方文档建议：务必设置合理的 max_tokens 防止被截断或空跑
    };

    if (!isReasoner) {
      requestBody.temperature = 0.3;
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn('DeepSeek API request failed:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    const cleanJson = extractJsonBlock(rawContent);
    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      suggestedTopic: parsed.suggestedTopic || 'General',
    };
  } catch (error) {
    console.error('DeepSeek analysis error:', error);
    return null;
  }
}
