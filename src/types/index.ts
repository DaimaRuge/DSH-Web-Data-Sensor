/**
 * DSH Web Sensor - 数据契约与核心类型定义
 */

export type SourcePlatform = 
  | 'web_article' 
  | 'deepseek' 
  | 'chatgpt' 
  | 'claude' 
  | 'gemini' 
  | 'doubao' 
  | 'grok' 
  | 'bilibili' 
  | 'youtube' 
  | 'pdf' 
  | 'local_file'
  | 'other';

export type DocumentType = 
  | 'article' 
  | 'chat_turn' 
  | 'chat_session' 
  | 'snippet' 
  | 'pdf' 
  | 'media' 
  | 'note'
  | 'screenshot'
  | 'file'
  | 'download';

export interface ScreenshotMetadata {
  isScreenshot: true;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  pageTitle: string;
  pageUrl: string;
  visualAnnotation?: string;
  agentInstruction: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'file';
  originalUrl: string;
  filename: string;
  localPath: string; // e.g. "assets/img_01_a9f2.png"
  blobDataUrl?: string; // base64 data url for storage transfer
  sha256?: string;
}

export interface AIMetadata {
  modelName?: string;
  hasThinkingChain?: boolean;
  thinkingContent?: string;
  promptContext?: string;
  turnIndex?: number;
}

export interface CapturedItem {
  id: string;
  project: string;
  topic: string;
  topics?: string[];
  title: string;
  url: string;
  urlType?: 'web' | 'local_file' | 'local_app' | 'local_note';
  sourcePlatform: SourcePlatform;
  capturedAt: string; // ISO 8601
  documentType: DocumentType;
  tags: string[];
  aiSummary?: string;
  userNotes?: string;
  markdownContent: string;
  aiMetadata?: AIMetadata;
  screenshotMetadata?: ScreenshotMetadata;
  mediaAttachments: MediaAttachment[];
  status?: 'pending' | 'saved' | 'error';
  savedPath?: string;
  errorMessage?: string;
}

export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  topics: string[];
  workspacePath: string; // e.g. "D:/KnowledgeBase/AI-Agent"
  storageMode: 'fs_access' | 'local_bridge' | 'downloads';
  createdAt: string;
}

export interface PluginSettings {
  activeProjectId: string;
  activeTopic: string;
  activeTopics?: string[];
  projects: ProjectConfig[];
  deepseekApiKey: string;
  deepseekModel: string;
  deepseekBaseUrl: string;
  bridgeUrl: string;
  enableAutoTagging: boolean;
  enableAutoSummary: boolean;
  autoDownloadImages: boolean;
  quickCaptureToastDuration: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  activeProjectId: 'default-project',
  activeTopic: 'General',
  activeTopics: ['General'],
  projects: [
    {
      id: 'default-project',
      name: '通用调研 (Default)',
      description: '默认知识收集与前期线索工作空间',
      topics: ['General', 'Architecture', 'Notes', 'AI-Chat', 'Papers'],
      workspacePath: 'D:/KnowledgeBase/Default',
      storageMode: 'local_bridge',
      createdAt: new Date().toISOString(),
    }
  ],
  deepseekApiKey: '',
  deepseekModel: 'deepseek-flash',
  deepseekBaseUrl: 'https://api.deepseek.com',
  bridgeUrl: 'http://127.0.0.1:8765',
  enableAutoTagging: true,
  enableAutoSummary: true,
  autoDownloadImages: true,
  quickCaptureToastDuration: 3000,
};

export type MessageType = 
  | 'PING'
  | 'GET_PAGE_INFO'
  | 'CAPTURE_FULL_PAGE'
  | 'CAPTURE_SELECTION'
  | 'CAPTURE_CHAT_TURN'
  | 'CAPTURE_CHAT_SESSION'
  | 'START_SCREENSHOT_CAPTURE'
  | 'CAPTURE_VISIBLE_TAB_REQUEST'
  | 'SAVE_BUNDLE'
  | 'EXECUTE_SAVE_IN_SIDEPANEL'
  | 'TRIGGER_SIDE_PANEL'
  | 'SHOW_TOAST'
  | 'ITEM_SAVED_EVENT'
  | 'DETECT_PAGE_FILES'
  | 'DETECT_PAGE_FILES_RESPONSE'
  | 'OPEN_DOWNLOAD_PANEL'
  | 'BATCH_DOWNLOAD_PROGRESS';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export type TelemetryEventType =
  | 'capture_item'
  | 'switch_project'
  | 'switch_topic'
  | 'create_project'
  | 'create_topic'
  | 'page_view'
  | 'download_file'
  | 'batch_download_files';

export interface TelemetryEvent {
  eventId: string;
  eventType: TelemetryEventType;
  timestamp: string;
  projectId: string;
  projectName?: string;
  topic?: string;
  url?: string;
  domain?: string;
  pageTitle?: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryInsights {
  frequentParentDirs: string[];
  frequentProjects: { projectId: string; projectName: string; count: number; lastUsed: string }[];
  frequentTopics: { topic: string; count: number }[];
  suggestedTopicsForCurrentDomain?: string[];
}

/**
 * 识别并归类 URL 模态与来源类型
 */
export function resolveUrlType(url?: string): 'web' | 'local_file' | 'local_app' | 'local_note' {
  if (!url) return 'local_note';
  const trimmed = url.trim();
  if (trimmed.startsWith('file://') || /^[a-zA-Z]:[\\/]/.test(trimmed)) {
    return 'local_file';
  }
  if (trimmed.startsWith('http://localhost') || trimmed.startsWith('http://127.0.0.1')) {
    return 'local_app';
  }
  if (trimmed.startsWith('local://') || trimmed.startsWith('dsh://')) {
    return 'local_note';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'web';
  }
  return 'web';
}

export type { DownloadableFile, FileCategory } from '@/lib/parser/fileDetector';

