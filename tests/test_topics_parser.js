// Test topic parser logic
import assert from 'node:assert';

function parseTopicsInput(input) {
  if (!input || typeof input !== 'string') {
    return [];
  }
  const tokens = input.split(/[,，、;；\s\u3000\u00A0]+/);
  const result = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed && !result.includes(trimmed)) {
      result.push(trimmed);
    }
  }
  return result;
}

// 1. 空格分隔测试 (ASCII 空格与全角空格)
assert.deepStrictEqual(
  parseTopicsInput("General Architecture Notes"),
  ["General", "Architecture", "Notes"],
  "Should split by ASCII space"
);
assert.deepStrictEqual(
  parseTopicsInput("大模型　深度学习　强化学习"),
  ["大模型", "深度学习", "强化学习"],
  "Should split by full-width Chinese space (\\u3000)"
);

// 2. 中文逗号分隔测试
assert.deepStrictEqual(
  parseTopicsInput("通用调研，系统架构，文献笔记"),
  ["通用调研", "系统架构", "文献笔记"],
  "Should split by Chinese comma"
);

// 3. 英文逗号分隔测试
assert.deepStrictEqual(
  parseTopicsInput("General, Architecture, Notes"),
  ["General", "Architecture", "Notes"],
  "Should split by English comma"
);

// 4. 混合分隔测试 (空格 + 中文逗号 + 英文逗号 + 顿号 + 分号)
assert.deepStrictEqual(
  parseTopicsInput("大模型 强化学习, 提示词工程， 向量知识库、学术论文; 多模态"),
  ["大模型", "强化学习", "提示词工程", "向量知识库", "学术论文", "多模态"],
  "Should split correctly across mixed delimiters"
);

// 5. 重复与首尾多余空白/标点测试
assert.deepStrictEqual(
  parseTopicsInput("  ，， AI   大模型   AI ， 大模型  "),
  ["AI", "大模型"],
  "Should deduplicate and ignore redundant spaces/delimiters"
);

// 6. 空输入与纯空白测试
assert.deepStrictEqual(parseTopicsInput(""), []);
assert.deepStrictEqual(parseTopicsInput("   "), []);
assert.deepStrictEqual(parseTopicsInput("，，，  "), []);
assert.deepStrictEqual(parseTopicsInput(null), []);

console.log(" All topic parser test cases passed successfully!");
