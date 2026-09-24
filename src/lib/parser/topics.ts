/**
 * DSH Web Sensor - 主题与标签解析器
 * 
 * 核心功能：
 * 支持由：
 * 1. 空格：半角空格 (' ')、全角空格 ('\u3000')、制表符 ('\t')、换行符 ('\n') 等空白字符
 * 2. 中文逗号：'，' (\uff0c)
 * 3. 英文逗号：','
 * 4. 中文顿号：'、' (\u3001)
 * 5. 中英文分号：';'、'；' (\uff1b)
 * 拆解用户输入的主题/标签文本，自动去除首尾空白并去重过滤空项。
 */

/**
 * 将用户输入的主题/标签文本拆解为干净的主题数组
 * @param input 用户输入的原始字符串
 * @returns 去重、去首尾空白且过滤空项的主题数组
 */
export function parseTopicsInput(input: string): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // 匹配所有空格、全角空格、中英文逗号、中文顿号、分号及连续组合
  const tokens = input.split(/[,，、;；\s\u3000\u00A0]+/);
  
  const result: string[] = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed && !result.includes(trimmed)) {
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * 格式化主题数组为展示用字符串（默认以逗号和空格间隔）
 */
export function formatTopicsDisplay(topics: string[], separator: string = ', '): string {
  if (!Array.isArray(topics)) return '';
  return topics.filter(Boolean).join(separator);
}
