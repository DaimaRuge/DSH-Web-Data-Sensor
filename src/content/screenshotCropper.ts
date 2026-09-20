import { CapturedItem, ScreenshotMetadata } from '@/types';

export type OnSaveCallback = (
  item: CapturedItem,
  onComplete: (res: { success: boolean; error?: string; savedPath?: string }) => void
) => void;

export function startInteractiveScreenshot(
  onSave: OnSaveCallback,
  onError: (err: string) => void
) {
  // 1. 向 background 请求截取当前可视区域
  chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB_REQUEST' }, (response) => {
    if (!response || !response.success || !response.dataUrl) {
      onError(response?.error || '截取当前可视区域失败');
      return;
    }

    renderCropperOverlay(response.dataUrl, onSave);
  });
}

function renderCropperOverlay(fullScreenshotUrl: string, onSave: OnSaveCallback) {
  const existing = document.getElementById('dsh-cropper-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'dsh-cropper-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    cursor: crosshair;
    user-select: none;
    background: rgba(15, 23, 42, 0.45);
  `;

  // 提示条
  const tip = document.createElement('div');
  tip.style.cssText = `
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #f8fafc;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.15);
    z-index: 2147483647;
  `;
  tip.innerHTML = `<span>📸 拖拽鼠标框选截图区域，按 Enter 确认保存，按 ESC 退出</span>`;
  overlay.appendChild(tip);

  // 框选容器（选区内保持 100% 原色无任何蒙版）
  const selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: fixed;
    border: 2px solid #22c55e;
    background: transparent !important;
    display: none;
    box-shadow: 0 0 0 99999px rgba(15, 23, 42, 0.55);
    z-index: 2147483647;
    pointer-events: none;
  `;
  overlay.appendChild(selectionBox);

  // 尺寸标签
  const sizeBadge = document.createElement('div');
  sizeBadge.style.cssText = `
    position: absolute;
    top: -24px;
    left: 0;
    background: #22c55e;
    color: #0f172a;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    white-space: nowrap;
  `;
  selectionBox.appendChild(sizeBadge);

  // 动作浮窗（独立于选框，采用全局视口动态自适应，永不溢出屏幕）
  const actionPanel = document.createElement('div');
  actionPanel.id = 'dsh-crop-action-panel';
  actionPanel.style.cssText = `
    position: fixed;
    display: none;
    align-items: center;
    gap: 8px;
    background: #0f172a;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid #334155;
    pointer-events: auto;
    z-index: 2147483647;
    flex-wrap: wrap;
  `;

  actionPanel.innerHTML = `
    <input 
      type="text" 
      id="dsh-crop-annotation"
      placeholder="输入视觉标注 (告诉 Agent 重点关注什么，回车直接保存)..." 
      style="
        flex: 1;
        min-width: 200px;
        padding: 6px 10px;
        font-size: 12px;
        border: 1px solid #475569;
        border-radius: 5px;
        background: #1e293b;
        color: #f8fafc;
        outline: none;
      "
    />
    <button 
      id="dsh-crop-confirm-btn"
      style="
        padding: 6px 14px;
        background: #22c55e;
        color: #0f172a;
        font-size: 12px;
        font-weight: 700;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
      "
      title="点击或按键盘 Enter 键直接确认保存"
    >
      <span>✓ 保存至 DSH</span>
      <kbd style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 3px; font-size: 10px; font-family: monospace;">Enter ↵</kbd>
    </button>
    <button 
      id="dsh-crop-cancel-btn"
      style="
        padding: 6px 10px;
        background: #334155;
        color: #cbd5e1;
        font-size: 12px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
      "
      title="退出本次截图 (ESC)"
    >
      ✕ 退出
    </button>
    <div 
      id="dsh-crop-status-tip" 
      style="display:none; width: 100%; color: #fca5a5; font-size: 11px; margin-top: 4px;"
    ></div>
  `;
  overlay.appendChild(actionPanel);

  // 智能计算动作浮窗位置，确保在显眼位置且绝对不溢出视口
  const updateActionPanelPosition = (box: { left: number; top: number; width: number; height: number }) => {
    actionPanel.style.display = 'flex';
    const panelWidth = Math.min(500, window.innerWidth - 24);
    actionPanel.style.width = `${panelWidth}px`;
    const panelHeight = actionPanel.offsetHeight || 48;

    // 垂直适配：优先选框下方 10px；若贴底，则自动移至选框上方；若选区占满全屏，则浮动在选区内部下沿
    let targetTop: number;
    if (box.top + box.height + panelHeight + 14 <= window.innerHeight) {
      targetTop = box.top + box.height + 10;
    } else if (box.top - panelHeight - 14 >= 0) {
      targetTop = box.top - panelHeight - 10;
    } else {
      targetTop = Math.max(12, box.top + box.height - panelHeight - 14);
    }

    // 水平适配：与选框右边缘对齐，且绝对不溢出视口边界 [12px, innerWidth - panelWidth - 12px]
    let targetLeft = box.left + box.width - panelWidth;
    if (targetLeft < 12) targetLeft = 12;
    if (targetLeft + panelWidth > window.innerWidth - 12) {
      targetLeft = window.innerWidth - panelWidth - 12;
    }

    actionPanel.style.position = 'fixed';
    actionPanel.style.top = `${Math.round(targetTop)}px`;
    actionPanel.style.left = `${Math.round(targetLeft)}px`;
  };

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;

  const cleanup = () => {
    overlay.remove();
    document.removeEventListener('keydown', handleKeyDown);
  };

  overlay.addEventListener('mousedown', (e) => {
    if (actionPanel.contains(e.target as Node)) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;

    // 框选时将全屏底色改为透明，由选框的 box-shadow 接管暗色遮罩，保证选区内 100% 原色
    overlay.style.background = 'transparent';
    selectionBox.style.display = 'block';
    actionPanel.style.display = 'none';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    sizeBadge.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
  });

  overlay.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    // 如果选区太小，视为误触
    if (width < 20 || height < 20) {
      selectionBox.style.display = 'none';
      actionPanel.style.display = 'none';
      overlay.style.background = 'rgba(15, 23, 42, 0.45)';
      return;
    }

    updateActionPanelPosition({ left, top, width, height });
    const input = actionPanel.querySelector('#dsh-crop-annotation') as HTMLInputElement;
    input?.focus();
  });

  // 绑定动作按钮事件
  actionPanel.addEventListener('mousedown', (e) => e.stopPropagation());

  const confirmBtn = actionPanel.querySelector('#dsh-crop-confirm-btn') as HTMLButtonElement;
  const cancelBtn = actionPanel.querySelector('#dsh-crop-cancel-btn') as HTMLButtonElement;
  const annotationInput = actionPanel.querySelector('#dsh-crop-annotation') as HTMLInputElement;

  cancelBtn.onclick = cleanup;

  const doConfirm = () => {
    if (confirmBtn.disabled) return;

    const left = parseInt(selectionBox.style.left, 10);
    const top = parseInt(selectionBox.style.top, 10);
    const width = parseInt(selectionBox.style.width, 10);
    const height = parseInt(selectionBox.style.height, 10);

    if (width < 20 || height < 20) return;

    const userAnnotation = annotationInput?.value?.trim() || '';
    const statusTip = actionPanel.querySelector('#dsh-crop-status-tip') as HTMLDivElement;

    // 进入正在处理状态
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    confirmBtn.innerHTML = '⏳ 正在保存快照...';
    if (statusTip) statusTip.style.display = 'none';

    cropAndProcessScreenshot(
      fullScreenshotUrl,
      { x: left, y: top, width, height },
      userAnnotation,
      onSave,
      (res) => {
        if (res.success) {
          confirmBtn.innerHTML = '✓ 保存成功！';
          confirmBtn.style.background = '#16a34a';
          setTimeout(() => {
            cleanup();
          }, 500);
        } else {
          confirmBtn.disabled = false;
          cancelBtn.disabled = false;
          confirmBtn.innerHTML = '重试保存 (Enter ↵)';
          confirmBtn.style.background = '#ef4444';
          if (statusTip) {
            statusTip.style.display = 'block';
            statusTip.textContent = `❌ 保存失败: ${res.error || '未能成功写入磁盘'}`;
          }
        }
      }
    );
  };

  confirmBtn.onclick = doConfirm;

  // 支持在输入框中直接按 Enter 确认保存
  annotationInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      doConfirm();
    }
  });

  // 全局键盘监听：ESC 退出，Enter 快速保存
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
    } else if (e.key === 'Enter') {
      if (actionPanel.style.display !== 'none' && !confirmBtn.disabled) {
        e.preventDefault();
        doConfirm();
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  document.body.appendChild(overlay);
}

function cropAndProcessScreenshot(
  dataUrl: string,
  crop: { x: number; y: number; width: number; height: number },
  userAnnotation: string,
  onSave: OnSaveCallback,
  onComplete: (res: { success: boolean; error?: string; savedPath?: string }) => void
) {
  const img = new Image();
  img.onload = () => {
    // 处理 High DPI (Retina / 缩放屏幕)
    const scaleX = img.naturalWidth / window.innerWidth;
    const scaleY = img.naturalHeight / window.innerHeight;

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropW = crop.width * scaleX;
    const cropH = crop.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onComplete({ success: false, error: '无法创建 Canvas 2D 绘图上下文' });
      return;
    }

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const croppedDataUrl = canvas.toDataURL('image/png');

    const timestamp = Date.now();
    const filename = `screenshot_${timestamp}.png`;
    const safeTitle = document.title || '网页局部视觉快照';

    // 结构化给 Agent 的元数据标注
    const screenshotMeta: ScreenshotMetadata = {
      isScreenshot: true,
      cropArea: {
        x: Math.round(crop.x),
        y: Math.round(crop.y),
        width: Math.round(crop.width),
        height: Math.round(crop.height),
        devicePixelRatio: window.devicePixelRatio || 1,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      pageTitle: safeTitle,
      pageUrl: window.location.href,
      visualAnnotation: userAnnotation || '用户框选的网页重点截图快照',
      agentInstruction: '【DSH 智能体提示】本线索为多模态网页图像截图快照，附件位于 assets/ 目录。包含截取区域坐标与来源上下文。请下游智能体使用视觉多模态模型(Vision LLM)分析图中布局、图表、UI或文字内容。',
    };

    const markdown = `# 📸 网页截图快照: ${safeTitle}

> 🏷️ **模态类型**: 视觉图像快照 (Visual Screenshot)
> 🌐 **来源地址**: [${window.location.href}](${window.location.href})
> ⏰ **截取时刻**: ${new Date().toLocaleString()}
> 📐 **裁剪分辨率**: ${Math.round(crop.width)} × ${Math.round(crop.height)} px (DPR: ${window.devicePixelRatio || 1})
${userAnnotation ? `> 📝 **视觉数据标注**: ${userAnnotation}\n` : ''}

![截图快照](assets/${filename})

---
> 🤖 **Agent 视觉感知指令**: 本条目已完成多模态视觉数据标注。下游 DSH 智能体请通过 Vision 模型读取对应 \`assets/\` 附件进行图像解析、图表抽取或 OCR 识别。
`;

    const item: CapturedItem = {
      id: `snap-${timestamp}`,
      project: '',
      topic: 'Screenshots',
      title: `[截图快照] ${safeTitle.slice(0, 35)}`,
      url: window.location.href,
      sourcePlatform: 'web_article',
      capturedAt: new Date().toISOString(),
      documentType: 'screenshot',
      tags: ['Screenshot', 'VisualSnapshot', 'Multimodal'],
      userNotes: userAnnotation,
      markdownContent: markdown,
      screenshotMetadata: screenshotMeta,
      mediaAttachments: [
        {
          id: `att-snap-${timestamp}`,
          type: 'image',
          originalUrl: window.location.href,
          filename: filename,
          localPath: `assets/${filename}`,
          blobDataUrl: croppedDataUrl,
        },
      ],
    };

    onSave(item, onComplete);
  };

  img.onerror = () => {
    onComplete({ success: false, error: '截屏图像加载失败，请刷新页面后重试' });
  };

  img.src = dataUrl;
}
