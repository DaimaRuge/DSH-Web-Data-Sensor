import assert from 'node:assert';

// 简单模拟测试核心提取逻辑
const EXTENSION_CATEGORY_MAP = {
  pdf: 'document',
  docx: 'document',
  xlsx: 'document',
  zip: 'archive',
  csv: 'data',
  json: 'data',
  mp4: 'media',
  safetensors: 'model',
  py: 'code',
};

function deriveFilename(rawUrl, downloadAttr, linkText) {
  let cleanName = '';
  if (downloadAttr && downloadAttr.trim()) {
    cleanName = downloadAttr.trim();
  }
  if (!cleanName) {
    try {
      const parsedUrl = new URL(rawUrl, 'https://example.com');
      const pathname = parsedUrl.pathname;
      const lastSegment = pathname.split('/').filter(Boolean).pop();
      if (lastSegment) {
        cleanName = decodeURIComponent(lastSegment);
      }
      if (!cleanName.includes('.') && parsedUrl.search) {
        const queryParams = parsedUrl.searchParams;
        const qFile = queryParams.get('filename') || queryParams.get('file') || queryParams.get('name');
        if (qFile) {
          cleanName = decodeURIComponent(qFile);
        }
      }
    } catch {}
  }
  if ((!cleanName || !cleanName.includes('.')) && linkText && linkText.trim()) {
    const trimmed = linkText.trim();
    const match = trimmed.match(/[\w\u4e00-\u9fa5\-_()\[\]]+\.[a-zA-Z0-9]{2,8}\b/);
    if (match) {
      cleanName = match[0];
    } else if (!cleanName) {
      cleanName = trimmed;
    }
  }
  cleanName = cleanName.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim();
  if (!cleanName) {
    cleanName = 'download_test';
  }
  let ext = '';
  const lastDotIdx = cleanName.lastIndexOf('.');
  if (lastDotIdx > 0 && lastDotIdx < cleanName.length - 1) {
    ext = cleanName.slice(lastDotIdx + 1).toLowerCase();
  }
  return { filename: cleanName, extension: ext };
}

// 1. 测试标准 URL 提取
const res1 = deriveFilename('https://arxiv.org/pdf/2401.0001.pdf');
assert.strictEqual(res1.filename, '2401.0001.pdf');
assert.strictEqual(res1.extension, 'pdf');

// 2. 测试带 download 属性
const res2 = deriveFilename('https://example.com/api/file?id=123', 'DeepSeek-V3-Technical-Report.pdf');
assert.strictEqual(res2.filename, 'DeepSeek-V3-Technical-Report.pdf');
assert.strictEqual(res2.extension, 'pdf');

// 3. 测试带 query 参数的文件名
const res3 = deriveFilename('https://example.com/download?file=dataset_2026.csv&token=abc');
assert.strictEqual(res3.filename, 'dataset_2026.csv');
assert.strictEqual(res3.extension, 'csv');

// 4. 测试中文文件名和特殊字符过滤
const res4 = deriveFilename('https://example.com/files/%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3:V1.docx');
assert.strictEqual(res4.filename, '架构设计文档_V1.docx');
assert.strictEqual(res4.extension, 'docx');

console.log(' All file detector tests passed successfully!');
