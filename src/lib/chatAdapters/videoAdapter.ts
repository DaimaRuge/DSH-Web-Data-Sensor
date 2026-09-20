import { CapturedItem, SourcePlatform } from '@/types';

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function isVideoPlatform(url: string): { isVideo: boolean; platform: SourcePlatform } {
  if (url.includes('bilibili.com/video')) return { isVideo: true, platform: 'bilibili' };
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) return { isVideo: true, platform: 'youtube' };
  return { isVideo: false, platform: 'other' };
}

export function captureVideoCue(userNotes = ''): Partial<CapturedItem> | null {
  const videoEl = document.querySelector('video') as HTMLVideoElement | null;
  const currentUrl = window.location.href;
  const { isVideo, platform } = isVideoPlatform(currentUrl);

  if (!isVideo && !videoEl) return null;

  const currentTime = videoEl ? videoEl.currentTime : 0;
  const duration = videoEl ? videoEl.duration : 0;
  const timeFormatted = formatSeconds(currentTime);
  const durationFormatted = formatSeconds(duration);

  // 提取带时间戳的链接
  let timestampedUrl = currentUrl;
  if (platform === 'youtube') {
    const cleanUrl = currentUrl.split('&t=')[0];
    timestampedUrl = `${cleanUrl}&t=${Math.floor(currentTime)}s`;
  } else if (platform === 'bilibili') {
    const cleanUrl = currentUrl.split('?p=')[0].split('&t=')[0];
    timestampedUrl = `${cleanUrl}?t=${Math.floor(currentTime)}`;
  }

  const title = document.title || '在线视频调研线索';

  // Markdown 正文
  const markdown = `## 🎬 多模态音视频调研线索

- **标题**: ${title}
- **平台**: ${platform === 'bilibili' ? '哔哩哔哩 (Bilibili)' : 'YouTube'}
- **播放时间锚点**: \`${timeFormatted}\` / \`${durationFormatted}\`
- **精准跳转链接**: [直达 ${timeFormatted} 播放时刻](${timestampedUrl})
- **原始地址**: ${currentUrl}

${userNotes ? `### 📝 调研备忘笔记\n\n${userNotes}\n\n` : ''}
> 💡 *此多模态线索已建立音视频时间轴锚点，待 DSH 智能体接入后可自动调用 Whisper 转录或截取关键视频帧。*
`;

  return {
    title: `[视频线索] ${title.slice(0, 40)}`,
    url: timestampedUrl,
    sourcePlatform: platform,
    documentType: 'media',
    tags: ['Video', platform, 'MultimodalCue'],
    markdownContent: markdown,
    userNotes,
  };
}
