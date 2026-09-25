import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FolderKanban, Sparkles, Download, FileText, Video, Camera,
  Bot, Settings, CheckCircle2, AlertCircle, RefreshCw, 
  Plus, Tag, Bookmark, Layers, HardDrive, Terminal,
  Eye, EyeOff, Search, Compass, FolderDown, Loader2, ArrowDownToLine
} from 'lucide-react';
import { set as setIdb } from 'idb-keyval';
import { PluginSettings, DEFAULT_SETTINGS, ProjectConfig, CapturedItem, resolveUrlType, DownloadableFile, FileCategory, ExtensionMessage } from '@/types';
import { getSettings, saveSettings, updateProject } from '@/lib/storage/settings';
import { pickWorkspaceDirectory, getWorkspaceDirectoryHandle, ensureSensorDirectoryOnHandle } from '@/lib/storage/fsAccess';
import { checkBridgeHealth, fetchSystemEnvFromBridge, initSensorWorkspaceViaBridge } from '@/lib/storage/bridgeClient';
import { getRecentCaptures, executeSaveBundle } from '@/lib/storage/bundleSaver';
import { fetchAvailableModels } from '@/lib/ai/deepseek';
import { trackEvent, fetchTelemetryInsights, discoverProjectsInDirectory } from '@/lib/telemetry/tracker';
import { parseTopicsInput } from '@/lib/parser/topics';
import { deriveFilename } from '@/lib/parser/fileDetector';

export default function App() {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([
    'deepseek-flash',
    'deepseek flash',
    'deepseek-v4-pro',
    'deepseek-chat',
    'deepseek-reasoner'
  ]);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [activeTab, setActiveTab] = useState<{ id?: number; title?: string; url?: string }>({});
  const [bridgeOnline, setBridgeOnline] = useState<boolean | null>(null);
  const [fsHandleActive, setFsHandleActive] = useState<boolean>(false);
  const [fsDirName, setFsDirName] = useState<string>('');
  const [recentItems, setRecentItems] = useState<CapturedItem[]>([]);
  const [currentView, setCurrentView] = useState<'workbench' | 'projects' | 'settings'>('workbench');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaunchingBridge, setIsLaunchingBridge] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // 快速便签状态
  const [quickNote, setQuickNote] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);

  // 新建项目状态与选定目录句柄
  const [newProjName, setNewProjName] = useState('');
  const [newProjPath, setNewProjPath] = useState('');
  const [newProjTopics, setNewProjTopics] = useState('General, Architecture, Notes');
  const [tempDirHandle, setTempDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // 行为埋点与洞察推荐
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [frequentParentDirs, setFrequentParentDirs] = useState<string[]>([]);
  const [discoveredProjects, setDiscoveredProjects] = useState<{ path: string; name: string; hasDshSensor: boolean }[]>([]);
  const [parentScanDir, setParentScanDir] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // 页面文件嗅探与批量下载状态
  const [detectedFiles, setDetectedFiles] = useState<DownloadableFile[]>([]);
  const [isDetectingFiles, setIsDetectingFiles] = useState(false);
  const [fileFilterCategory, setFileFilterCategory] = useState<string>('all');
  const [fileSearchKeyword, setFileSearchKeyword] = useState('');
  const [fileDisplayLimit, setFileDisplayLimit] = useState<number>(30);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchDownloadProgress, setBatchDownloadProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);

    // 检查桥接服务心跳
    const health = await checkBridgeHealth(s.bridgeUrl);
    const isBridgeUp = !!health && health.status === 'ok';
    setBridgeOnline(isBridgeUp);

    const currentProject = s.projects.find(p => p.id === s.activeProjectId) || s.projects[0];

    // 检查当前项目的 File System Handle (支持继承与 /dshWebSensor 自动创建)
    const handle = await getWorkspaceDirectoryHandle(s.activeProjectId, currentProject?.name);
    if (handle) {
      setFsHandleActive(true);
      setFsDirName(handle.name);
    } else {
      setFsHandleActive(false);
      setFsDirName('');
    }

    // 若 Bridge 在线，同时确保当前项目的 /dshWebSensor 子目录在物理磁盘就绪
    if (isBridgeUp && currentProject?.workspacePath) {
      initSensorWorkspaceViaBridge(s.bridgeUrl, currentProject.workspacePath, currentProject.name).catch(() => {});
    }

    // 加载历史
    const history = await getRecentCaptures();
    setRecentItems(history);
  }, []);

  // 动态精准获取当前活跃聚焦的标签页信息（支持本地 file:/// 与网络 http/https）
  const refreshActiveTab = useCallback(async (): Promise<{ id?: number; title?: string; url?: string }> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const processTab = (tab: chrome.tabs.Tab) => {
          const tabInfo = {
            id: tab.id,
            title: tab.title || '当前标签页',
            url: tab.url || 'about:blank',
          };
          setActiveTab(tabInfo);

          if (tab.url) {
            try {
              const domain = tab.url.startsWith('file://') ? 'local_file' : (new URL(tab.url).hostname || 'local');
              fetchTelemetryInsights(domain).then(insights => {
                if (insights) {
                  if (insights.suggestedTopicsForCurrentDomain) {
                    setSuggestedTopics(insights.suggestedTopicsForCurrentDomain);
                  }
                  if (insights.frequentParentDirs && insights.frequentParentDirs.length > 0) {
                    setFrequentParentDirs(insights.frequentParentDirs);
                    setParentScanDir(prev => prev || insights.frequentParentDirs[0]);
                  }
                }
              });

              trackEvent({
                eventType: 'page_view',
                projectId: settings.activeProjectId,
                url: tab.url,
                domain,
                pageTitle: tab.title,
              }).catch(() => {});
            } catch {}
          }
          resolve(tabInfo);
        };

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            processTab(tabs[0]);
            return;
          }
          // 回退使用 lastFocusedWindow，保证在 SidePanel 聚焦时也能获取浏览窗口活跃 Tab
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (fallbackTabs) => {
            if (fallbackTabs && fallbackTabs[0]) {
              processTab(fallbackTabs[0]);
              return;
            }
            resolve({});
          });
        });
      } else {
        resolve({});
      }
    });
  }, [settings.activeProjectId]);

  useEffect(() => {
    loadData();
    refreshActiveTab();

    // 实时监听标签页切换与地址变更，使 Side Panel 始终与当前焦点页面保持完全同步
    const onTabActivated = () => {
      refreshActiveTab();
    };
    const onTabUpdated = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        refreshActiveTab();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onActivated?.addListener(onTabActivated);
      chrome.tabs.onUpdated?.addListener(onTabUpdated);
    }

    // 监听实时线索落盘通知（如截图快照完成或抓取保存）与前台落盘委托
    let handleRuntimeMsg: ((msg: any, sender: any, sendResponse: (res?: any) => void) => boolean | void) | null = null;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      handleRuntimeMsg = (msg: any, _sender: any, sendResponse: (res?: any) => void) => {
        if (msg.type === 'EXECUTE_SAVE_IN_SIDEPANEL') {
          const item = msg.payload as CapturedItem;
          executeSaveBundle(item)
            .then(res => {
              sendResponse({ success: true, data: res });
              loadData();
              if (item.title) {
                showToast(`✓ 已成功存入本地目录: ${item.title.slice(0, 20)}`);
              }
            })
            .catch(err => {
              sendResponse({ success: false, error: (err as Error).message });
            });
          return true; // 异步响应
        }

        if (msg.type === 'ITEM_SAVED_EVENT') {
          loadData();
          if (msg.payload?.title) {
            showToast(`✓ 已自动同步新线索: ${msg.payload.title.slice(0, 20)}`);
          }
        } else if (msg.type === 'OPEN_DOWNLOAD_PANEL') {
          setCurrentView('workbench');
          setTimeout(() => {
            handleDetectFiles();
          }, 150);
        }
      };
      chrome.runtime.onMessage.addListener(handleRuntimeMsg);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.onActivated?.removeListener(onTabActivated);
        chrome.tabs.onUpdated?.removeListener(onTabUpdated);
      }
      if (handleRuntimeMsg && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleRuntimeMsg);
      }
    };
  }, [loadData, refreshActiveTab]);

  const activeProject = settings.projects.find(p => p.id === settings.activeProjectId) || settings.projects[0];

  // 切换项目
  const activeTopics = (settings.activeTopics && settings.activeTopics.length > 0)
    ? settings.activeTopics
    : [settings.activeTopic || 'General'];

  // 切换项目（并自动切换/继承授权目录，且确保 /dshWebSensor 子目录就绪）
  const handleSwitchProject = async (projId: string) => {
    const target = settings.projects.find(p => p.id === projId);
    if (!target) return;

    const targetTopics = target.topics || ['General'];
    const validTopics = activeTopics.filter(t => targetTopics.includes(t));
    const newActiveTopics = validTopics.length > 0 ? validTopics : [targetTopics[0]];

    const updated = await saveSettings({ 
      activeProjectId: projId,
      activeTopics: newActiveTopics,
      activeTopic: newActiveTopics[0]
    });
    setSettings(updated);

    // 1. 自动切换/继承并就绪当前项目的 File System 句柄及 /dshWebSensor 子目录
    const handle = await getWorkspaceDirectoryHandle(projId, target.name);
    if (handle) {
      setFsHandleActive(true);
      setFsDirName(handle.name);
    } else {
      setFsHandleActive(false);
      setFsDirName('');
    }

    // 2. 若 Bridge 在线，立即向 Bridge 发送指令初始化物理 /dshWebSensor 子目录
    if (bridgeOnline && target.workspacePath) {
      initSensorWorkspaceViaBridge(settings.bridgeUrl, target.workspacePath, target.name).catch(() => {});
    }

    const displayTarget = handle ? `${handle.name}/dshWebSensor` : (target.workspacePath ? `${target.workspacePath}/dshWebSensor` : 'dshWebSensor');
    showToast(`✓ 已自动切换至【${target.name}】，落盘空间: ${displayTarget} 已就绪`);

    trackEvent({
      eventType: 'switch_project',
      projectId: projId,
      projectName: target.name,
      metadata: { 
        workspacePath: target.workspacePath, 
        activeTopics: newActiveTopics,
        sensorPath: `${target.workspacePath}/dshWebSensor`
      },
    }).catch(() => {});
  };

  // 切换主题多选状态 (Toggle)
  const handleToggleTopic = async (topic: string) => {
    let updatedTopics: string[];
    if (activeTopics.includes(topic)) {
      if (activeTopics.length <= 1) {
        showToast('至少需保留一个选中的研究主题');
        return;
      }
      updatedTopics = activeTopics.filter(t => t !== topic);
    } else {
      updatedTopics = [...activeTopics, topic];
    }

    const updated = await saveSettings({ 
      activeTopics: updatedTopics, 
      activeTopic: updatedTopics[0] 
    });
    setSettings(updated);

    trackEvent({
      eventType: 'switch_topic',
      projectId: activeProject.id,
      projectName: activeProject.name,
      topic: updatedTopics.join('+'),
      metadata: { activeTopics: updatedTopics },
    }).catch(() => {});
  };

  // 全选当前项目的所有主题
  const handleSelectAllTopics = async () => {
    const allTopics = activeProject.topics || ['General'];
    const updated = await saveSettings({
      activeTopics: allTopics,
      activeTopic: allTopics[0],
    });
    setSettings(updated);
    showToast(`已全选当前项目 ${allTopics.length} 个主题`);
  };

  // 添加推荐主题并加入多选
  const handleAddSuggestedTopic = async (st: string) => {
    if (!activeProject.topics.includes(st)) {
      const newTopics = [...activeProject.topics, st];
      await updateProject(activeProject.id, { topics: newTopics });
    }
    if (!activeTopics.includes(st)) {
      const updatedActiveTopics = [...activeTopics, st];
      const updated = await saveSettings({
        activeTopics: updatedActiveTopics,
        activeTopic: updatedActiveTopics[0],
      });
      setSettings(updated);
      showToast(`已将【${st}】加入多选研究主题`);
    } else {
      showToast(`【${st}】已在已选主题中`);
    }
  };

  const handleAddTopicConfirm = async () => {
    const inputTopics = parseTopicsInput(customTopicInput);
    if (inputTopics.length === 0) return;

    const currentTopics = activeProject.topics || [];
    const newTopicsToAdd = inputTopics.filter(t => !currentTopics.includes(t));
    const allProjectTopics = [...currentTopics, ...newTopicsToAdd];

    if (newTopicsToAdd.length > 0) {
      await updateProject(activeProject.id, { topics: allProjectTopics });
    }

    // 自动将新输入的主题加入多选激活主题中
    const updatedActiveTopics = Array.from(new Set([...activeTopics, ...inputTopics]));
    const updated = await saveSettings({ 
      activeTopics: updatedActiveTopics, 
      activeTopic: updatedActiveTopics[0] 
    });
    setSettings(updated);
    setCustomTopicInput('');
    setShowAddTopic(false);

    // 针对新主题发送行为埋点
    for (const t of newTopicsToAdd) {
      trackEvent({
        eventType: 'create_topic',
        projectId: activeProject.id,
        projectName: activeProject.name,
        topic: t,
      }).catch(() => {});
    }

    if (inputTopics.length === 1) {
      showToast(`主题【${inputTopics[0]}】已创建并选中`);
    } else {
      showToast(`已批量添加 ${inputTopics.length} 个主题并选中: ${inputTopics.join('、')}`);
    }
  };

  // 授权本地文件夹并就绪 /dshWebSensor 子目录
  const handleAuthorizeFolder = async () => {
    try {
      const res = await pickWorkspaceDirectory(activeProject.id);
      setFsHandleActive(true);
      setFsDirName(res.name);
      await updateProject(activeProject.id, { workspacePath: res.name });
      showToast(`已授权本地目录，落盘空间: ${res.name}/dshWebSensor 已就绪`);
      loadData();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showToast(`授权失败: ${(err as Error).message}`, true);
      }
    }
  };

  // 一键调起本地 Bridge 伴侣服务（开启 100% 免授权直写）
  const handleLaunchBridge = async () => {
    setIsLaunchingBridge(true);
    showToast('正在调起本地 DSH Bridge 伴侣服务...');

    try {
      const a = document.createElement('a');
      a.href = 'dshbridge://start';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = 'dshbridge://start';
    }

    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      const health = await checkBridgeHealth(settings.bridgeUrl);
      if (health && health.status === 'ok') {
        clearInterval(timer);
        setBridgeOnline(true);
        setIsLaunchingBridge(false);
        showToast('🎉 DSH 本地 Bridge 伴侣已成功启动！已进入 100% 免授权直写模式！');
        loadData();
      } else if (attempts >= 10) {
        clearInterval(timer);
        setIsLaunchingBridge(false);
        showToast('⚠️ 未检测到服务响应，若首次使用可双击运行根目录 start_bridge.bat', true);
      }
    }, 600);
  };

  // 检测是否为受浏览器严格安全保护而无法注入脚本的页面
  const isRestrictedUrl = (url?: string): boolean => {
    if (!url) return false;
    return (
      url.startsWith('chrome://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('devtools://') ||
      url.startsWith('view-source:') ||
      url.includes('chromewebstore.google.com')
    );
  };

  // 确保目标标签页已准备好 Content Script，若因此前已打开而未加载则自动动态注入
  const ensureContentScript = async (tabId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { type: 'PING' }, async (res) => {
        if (!chrome.runtime.lastError && res?.pong) {
          resolve(true);
          return;
        }
        // 尝试通过 chrome.scripting 动态注入
        try {
          const manifest = chrome.runtime.getManifest();
          const scripts = manifest.content_scripts?.[0]?.js;
          if (scripts && scripts.length > 0) {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: scripts,
            });
            setTimeout(() => resolve(true), 150);
            return;
          }
        } catch (err) {
          console.warn('动态注入 Content Script 异常:', err);
        }
        resolve(false);
      });
    });
  };

  // 1-Click 抓取网页正文
  const handleCaptureCurrentPage = async () => {
    const curTab = await refreshActiveTab();
    if (!curTab.id) {
      showToast('未检测到活跃标签页', true);
      return;
    }
    if (isRestrictedUrl(curTab.url)) {
      showToast('浏览器安全限制：无法在内部系统页或应用商店中抓取', true);
      return;
    }
    setIsProcessing(true);
    await ensureContentScript(curTab.id);
    chrome.tabs.sendMessage(curTab.id, { type: 'CAPTURE_FULL_PAGE' }, (response) => {
      setIsProcessing(false);
      if (response && response.success) {
        showToast('正文抓取成功并已开始落盘！');
        loadData();
      } else {
        const isLocal = curTab.url?.startsWith('file://');
        const hint = isLocal ? '（提示：本地 file:/// 文件需在 chrome://extensions 详情中开启“允许访问文件网址”）' : '';
        showToast(`抓取遇到问题: ${response?.error || '页面可能未完全加载'}${hint}`, true);
      }
    });
  };

  // 1-Click 归档 AI 对话会话
  const handleCaptureChatSession = async () => {
    const curTab = await refreshActiveTab();
    if (!curTab.id) {
      showToast('未检测到活跃标签页', true);
      return;
    }
    if (isRestrictedUrl(curTab.url)) {
      showToast('浏览器安全限制：无法在内部系统页中归档', true);
      return;
    }
    setIsProcessing(true);
    await ensureContentScript(curTab.id);
    chrome.tabs.sendMessage(curTab.id, { type: 'CAPTURE_CHAT_SESSION' }, (response) => {
      setIsProcessing(false);
      if (response && response.success) {
        showToast('整场 AI 对话已成功归档！');
        loadData();
      } else {
        showToast(`会话归档失败: ${response?.error || '请确认当前页面为支持的 AI Chat 平台'}`, true);
      }
    });
  };

  // 1-Click 抓取视频时间戳线索
  const handleCaptureVideo = async () => {
    const curTab = await refreshActiveTab();
    if (!curTab.id) {
      showToast('未检测到活跃标签页', true);
      return;
    }
    if (isRestrictedUrl(curTab.url)) {
      showToast('浏览器安全限制：无法在内部系统页中抓取视频', true);
      return;
    }
    setIsProcessing(true);
    await ensureContentScript(curTab.id);
    chrome.tabs.sendMessage(curTab.id, { type: 'CAPTURE_VIDEO_CUE' as any }, (response) => {
      setIsProcessing(false);
      if (response && response.success) {
        showToast('视频时间轴线索已成功落盘！');
        loadData();
      } else {
        showToast(`视频抓取失败: ${response?.error || '当前页面未检测到视频'}`, true);
      }
    });
  };

  // 1-Click 网页区域截图快照与视觉数据标注
  const handleCaptureScreenshot = async () => {
    const curTab = await refreshActiveTab();
    if (!curTab.id) {
      showToast('未检测到活跃标签页', true);
      return;
    }

    if (isRestrictedUrl(curTab.url)) {
      showToast('浏览器安全限制：无法在内部系统页或应用商店中截图，请在常规网页或本地文件中使用', true);
      return;
    }

    // 自动检测并注入 Content Script，确保即使是扩展加载前打开的页面也能立即启动截图
    await ensureContentScript(curTab.id);

    chrome.tabs.sendMessage(
      curTab.id,
      {
        type: 'START_SCREENSHOT_CAPTURE',
        payload: {
          project: activeProject.name,
          topics: activeTopics,
        },
      },
      () => {
        if (chrome.runtime.lastError) {
          const isLocal = curTab.url?.startsWith('file://');
          const hint = isLocal ? '。本地 file:/// 文件需在扩展管理中勾选【允许访问文件网址】' : '，请刷新目标页面重试';
          showToast(`唤起截图失败: ${chrome.runtime.lastError.message}${hint}`, true);
        }
      }
    );
  };

  // 辅助函数：ArrayBuffer 转换 Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + chunkSize, len))));
    }
    return btoa(binary);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const downloadFileBlobDataUrl = async (url: string): Promise<{ dataUrl: string; size: number; contentType: string; serverFilename?: string }> => {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    }
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const disposition = resp.headers.get('content-disposition') || '';
    let serverFilename = '';
    if (disposition) {
      const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
      if (filenameMatch && filenameMatch[1]) {
        serverFilename = decodeURIComponent(filenameMatch[1].trim());
      }
    }

    const buffer = await resp.arrayBuffer();
    const size = buffer.byteLength;
    const base64 = arrayBufferToBase64(buffer);
    const dataUrl = `data:${contentType};base64,${base64}`;

    return {
      dataUrl,
      size,
      contentType,
      serverFilename: serverFilename || undefined,
    };
  };

  const getCategoryBadge = (category: FileCategory, extension: string) => {
    switch (category) {
      case 'document':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: extension.toUpperCase() || 'DOC' };
      case 'data':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: extension.toUpperCase() || 'DATA' };
      case 'archive':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: extension.toUpperCase() || 'ZIP' };
      case 'media':
        return { bg: 'bg-sky-100 text-sky-800 border-sky-200', label: extension.toUpperCase() || 'MEDIA' };
      case 'model':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: extension.toUpperCase() || 'MODEL' };
      case 'code':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: extension.toUpperCase() || 'CODE' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: extension.toUpperCase() || 'FILE' };
    }
  };

  // 1-Click 嗅探当前页面的所有可下载文件
  const handleDetectFiles = async () => {
    const curTab = await refreshActiveTab();
    if (!curTab.id) {
      showToast('未检测到活跃标签页', true);
      return;
    }
    if (isRestrictedUrl(curTab.url)) {
      showToast('受限系统页面无法嗅探文件', true);
      return;
    }

    setIsDetectingFiles(true);
    await ensureContentScript(curTab.id);
    chrome.tabs.sendMessage(curTab.id, { type: 'DETECT_PAGE_FILES' }, (res) => {
      setIsDetectingFiles(false);
      if (res && res.success && Array.isArray(res.files)) {
        setDetectedFiles(res.files);
        setFileDisplayLimit(30);
        if (res.files.length === 0) {
          showToast('当前页面未检测到可下载文件');
        } else {
          showToast(`已嗅探到本页 ${res.files.length} 个可下载文件`);
        }
      } else {
        showToast(`嗅探文件失败: ${res?.error || '无法解析页面元素'}`, true);
      }
    });
  };

  // 单个文件下载至 DSH 研究目录并打标索引
  const handleDownloadSingleFile = async (file: DownloadableFile) => {
    const curTab = await refreshActiveTab();
    setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'downloading', errorMessage: undefined } : f));
    showToast(`⏳ 正在下载【${file.filename}】并索引至 DSH...`);

    try {
      const fileData = await downloadFileBlobDataUrl(file.url);
      const derived = deriveFilename(file.url, fileData.serverFilename || file.filename);
      const filename = fileData.serverFilename || file.filename || derived.filename;
      const ext = derived.extension || file.extension || 'bin';
      const sizeStr = formatFileSize(fileData.size);

      const item: CapturedItem = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        project: activeProject.name,
        topic: activeTopics.join('+'),
        topics: activeTopics,
        title: `[文件] ${filename}`,
        url: file.url,
        urlType: resolveUrlType(file.url),
        sourcePlatform: 'other',
        capturedAt: new Date().toISOString(),
        documentType: 'file',
        tags: ['Download', 'File', ext.toUpperCase(), file.category, ...activeTopics],
        markdownContent: `# 📁 文件下载索引: ${filename}\n\n> 🌐 **来源下载地址**: [${file.url}](${file.url})\n> 📄 **来源页面**: [${curTab.title || curTab.url || '未知页面'}](${curTab.url || file.url})\n> 🏷️ **归属主题**: ${activeTopics.join('、')}\n> 📦 **文件类型**: ${ext.toUpperCase()} (${file.category})\n> 📊 **文件大小**: ${sizeStr}\n> ⏰ **下载时刻**: ${new Date().toLocaleString()}\n\n---\n### 💾 本地物理文件\n- 相对路径: \`assets/${filename}\`\n- 存储空间: \`dshWebSensor/${activeTopics.join('+')}/.../assets/${filename}\`\n`,
        mediaAttachments: [
          {
            id: `att-file-${Date.now()}`,
            type: 'file',
            originalUrl: file.url,
            filename: filename,
            localPath: `assets/${filename}`,
            blobDataUrl: fileData.dataUrl,
          },
        ],
      };

      const result = await executeSaveBundle(item);
      setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'saved', savedPath: result.savedPath } : f));
      showToast(`✓【${filename}】已存入 DSH 研究目录并完成索引！`);
      loadData();

      trackEvent({
        eventType: 'download_file',
        projectId: activeProject.id,
        projectName: activeProject.name,
        topic: activeTopics.join('+'),
        url: file.url,
        pageTitle: filename,
        metadata: {
          filename,
          category: file.category,
          size: fileData.size,
          savedPath: result.savedPath,
        },
      }).catch(() => {});
    } catch (err) {
      const errMsg = (err as Error).message || '下载失败';
      setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', errorMessage: errMsg } : f));
      showToast(`下载【${file.filename}】失败: ${errMsg}`, true);
    }
  };

  // 批量下载所选文件至 DSH 研究目录并打标索引
  const handleBatchDownloadSelected = async () => {
    const toDownload = detectedFiles.filter(f => f.isSelected && f.status !== 'saved');
    if (toDownload.length === 0) {
      showToast('请先勾选需要下载的文件', true);
      return;
    }

    setIsBatchDownloading(true);
    setBatchDownloadProgress({ current: 0, total: toDownload.length, filename: toDownload[0].filename });
    const curTab = await refreshActiveTab();

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < toDownload.length; i++) {
      const file = toDownload[i];
      setBatchDownloadProgress({ current: i + 1, total: toDownload.length, filename: file.filename });
      setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'downloading', errorMessage: undefined } : f));

      try {
        const fileData = await downloadFileBlobDataUrl(file.url);
        const derived = deriveFilename(file.url, fileData.serverFilename || file.filename);
        const filename = fileData.serverFilename || file.filename || derived.filename;
        const ext = derived.extension || file.extension || 'bin';
        const sizeStr = formatFileSize(fileData.size);

        const item: CapturedItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          project: activeProject.name,
          topic: activeTopics.join('+'),
          topics: activeTopics,
          title: `[文件] ${filename}`,
          url: file.url,
          urlType: resolveUrlType(file.url),
          sourcePlatform: 'other',
          capturedAt: new Date().toISOString(),
          documentType: 'file',
          tags: ['Download', 'File', ext.toUpperCase(), file.category, ...activeTopics],
          markdownContent: `# 📁 文件下载索引: ${filename}\n\n> 🌐 **来源下载地址**: [${file.url}](${file.url})\n> 📄 **来源页面**: [${curTab.title || curTab.url || '未知页面'}](${curTab.url || file.url})\n> 🏷️ **归属主题**: ${activeTopics.join('、')}\n> 📦 **文件类型**: ${ext.toUpperCase()} (${file.category})\n> 📊 **文件大小**: ${sizeStr}\n> ⏰ **下载时刻**: ${new Date().toLocaleString()}\n\n---\n### 💾 本地物理文件\n- 相对路径: \`assets/${filename}\`\n- 存储空间: \`dshWebSensor/${activeTopics.join('+')}/.../assets/${filename}\`\n`,
          mediaAttachments: [
            {
              id: `att-file-${Date.now()}`,
              type: 'file',
              originalUrl: file.url,
              filename: filename,
              localPath: `assets/${filename}`,
              blobDataUrl: fileData.dataUrl,
            },
          ],
        };

        const result = await executeSaveBundle(item);
        setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'saved', savedPath: result.savedPath } : f));
        successCount++;
      } catch (err) {
        failCount++;
        const errMsg = (err as Error).message || '下载失败';
        setDetectedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', errorMessage: errMsg } : f));
      }
    }

    setIsBatchDownloading(false);
    setBatchDownloadProgress(null);
    loadData();

    trackEvent({
      eventType: 'batch_download_files',
      projectId: activeProject.id,
      projectName: activeProject.name,
      topic: activeTopics.join('+'),
      metadata: {
        total: toDownload.length,
        successCount,
        failCount,
      },
    }).catch(() => {});

    if (failCount === 0) {
      showToast(`🎉 批量下载完成！已将 ${successCount} 个文件全部存入 DSH 研究目录并打标索引`);
    } else {
      showToast(`批量下载结束: 成功 ${successCount} 个，失败 ${failCount} 个`, true);
    }
  };

  const filteredFiles = useMemo(() => {
    return detectedFiles.filter(f => {
      if (fileFilterCategory !== 'all' && f.category !== fileFilterCategory) {
        return false;
      }
      if (fileSearchKeyword.trim()) {
        const kw = fileSearchKeyword.toLowerCase();
        return f.filename.toLowerCase().includes(kw) || f.title.toLowerCase().includes(kw) || f.extension.toLowerCase().includes(kw);
      }
      return true;
    });
  }, [detectedFiles, fileFilterCategory, fileSearchKeyword]);

  const selectedCount = useMemo(() => {
    return filteredFiles.filter(f => f.isSelected).length;
  }, [filteredFiles]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: detectedFiles.length,
      document: 0,
      data: 0,
      archive: 0,
      media: 0,
      code: 0,
    };
    for (const f of detectedFiles) {
      if (f.category in counts) {
        counts[f.category as keyof typeof counts]++;
      }
    }
    return counts;
  }, [detectedFiles]);

  const handleToggleSelectFile = useCallback((id: string) => {
    setDetectedFiles(prev => prev.map(f => f.id === id ? { ...f, isSelected: !f.isSelected } : f));
  }, []);

  const handleSelectAllFiles = useCallback((selectAll: boolean) => {
    const filteredIds = new Set(filteredFiles.map(f => f.id));
    setDetectedFiles(prev => prev.map(f => filteredIds.has(f.id) ? { ...f, isSelected: selectAll } : f));
  }, [filteredFiles]);

  // 快速提交便签/灵感
  const handleSaveQuickNote = async () => {
    if (!quickNote.trim()) return;
    setIsProcessing(true);
    const curTab = await refreshActiveTab();
    const noteId = `note-${Date.now()}`;
    
    // 无论是公网网页还是本地 file:/// 文件，均准确提取关联 URL；在无网页标签时生成标准本地便签 URL
    const noteUrl = (curTab.url && curTab.url !== 'about:blank')
      ? curTab.url
      : `local://dsh/quick-note?id=${noteId}&time=${Date.now()}`;
    const noteUrlType = resolveUrlType(noteUrl);

    const item: CapturedItem = {
      id: noteId,
      project: activeProject.name,
      topic: activeTopics.join('+'),
      topics: activeTopics,
      title: `调研便签: ${quickNote.slice(0, 20)}...`,
      url: noteUrl,
      urlType: noteUrlType,
      sourcePlatform: noteUrlType === 'local_file' ? 'local_file' : (noteUrl.includes('deepseek.com') ? 'deepseek' : 'other'),
      capturedAt: new Date().toISOString(),
      documentType: 'note',
      tags: ['QuickNote', 'Idea', ...activeTopics],
      markdownContent: `### 📝 快速调研备忘便签\n\n${quickNote}\n\n---\n> 🏷️ **归属主题**: ${activeTopics.join('、')}\n> ⏰ **记录时刻**: ${new Date().toLocaleString()}\n> 🌐 **关联 URL**: [${curTab.title || noteUrl}](${noteUrl})\n> 📌 **URL 类型**: ${noteUrlType === 'web' ? '公网网址' : (noteUrlType === 'local_file' ? '本地文件 (file:///)' : '本地便签')}`,
      mediaAttachments: [],
    };

    try {
      await executeSaveBundle(item);
      setQuickNote('');
      showToast('灵感便签已成功落盘');
      loadData();
    } catch (e) {
      showToast(`保存失败: ${(e as Error).message}`, true);
    } finally {
      setIsProcessing(false);
    }
  };

  // 浏览原生目录并自动建议与物理创建 /dshWebSensor
  const handleBrowseNewProjectFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        showToast('当前浏览器不支持文件夹选取 API，请手动输入路径', true);
        return;
      }
      const handle = await (window as unknown as { showDirectoryPicker: (options?: { mode?: string }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
        mode: 'readwrite',
      });
      if (handle) {
        // 立即物理创建/确保 dshWebSensor 子目录存在
        await ensureSensorDirectoryOnHandle(handle).catch(() => {});
        setTempDirHandle(handle);
        setNewProjPath(handle.name);
        if (!newProjName.trim()) {
          setNewProjName(handle.name);
        }
        showToast(`已选取目录并自动建议/就绪: ${handle.name}/dshWebSensor`);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showToast(`选择目录失败: ${(err as Error).message}`, true);
      }
    }
  };

  // 创建新项目
  const handleCreateProject = async () => {
    if (!newProjName.trim()) {
      showToast('请输入项目名称', true);
      return;
    }
    const topicsArr = parseTopicsInput(newProjTopics);
    const chosenWorkspace = newProjPath.trim() || (parentScanDir ? `${parentScanDir}/${newProjName.trim()}` : `D:/KnowledgeBase/${newProjName.trim()}`);
    
    const newP: ProjectConfig = {
      id: `proj-${Date.now()}`,
      name: newProjName.trim(),
      description: '用户自定义项目空间',
      topics: topicsArr.length ? topicsArr : ['General'],
      workspacePath: chosenWorkspace,
      storageMode: tempDirHandle ? 'fs_access' : 'local_bridge',
      createdAt: new Date().toISOString(),
    };

    // 如果通过浏览器浏览选取了目录句柄，直接持久化绑定权限并缓存
    if (tempDirHandle) {
      await ensureSensorDirectoryOnHandle(tempDirHandle).catch(() => {});
      await setIdb(`dsh_fs_dir_handle_${newP.id}`, tempDirHandle);
      await setIdb(`dsh_fs_dir_handle_latest`, tempDirHandle);
      setFsHandleActive(true);
      setFsDirName(tempDirHandle.name);
    }

    // 若 Bridge 在线，立即物理创建项目文件夹及 /dshWebSensor 子目录
    if (bridgeOnline && newP.workspacePath) {
      initSensorWorkspaceViaBridge(settings.bridgeUrl, newP.workspacePath, newP.name).catch(() => {});
    }

    const updatedProjects = [...settings.projects, newP];
    const updated = await saveSettings({ 
      projects: updatedProjects, 
      activeProjectId: newP.id,
      activeTopics: newP.topics,
      activeTopic: newP.topics[0]
    });
    setSettings(updated);

    // 记录行为埋点
    trackEvent({
      eventType: 'create_project',
      projectId: newP.id,
      projectName: newP.name,
      metadata: { 
        workspacePath: newP.workspacePath, 
        topics: newP.topics,
        sensorPath: `${newP.workspacePath}/dshWebSensor`
      },
    }).catch(() => {});

    setNewProjName('');
    setNewProjPath('');
    setTempDirHandle(null);
    setCurrentView('workbench');
    showToast(`✓ 项目【${newP.name}】创建成功，已自动切换落盘空间至 /dshWebSensor`);
  };

  // 扫描常用大目录子工程
  const handleScanParentDir = async () => {
    if (!parentScanDir.trim()) {
      showToast('请输入或选择常用大目录路径', true);
      return;
    }
    setIsScanning(true);
    try {
      const projs = await discoverProjectsInDirectory(parentScanDir.trim());
      setDiscoveredProjects(projs);
      if (projs.length === 0) {
        showToast('未在指定目录下发现子项目或 Bridge 服务未启动', true);
      } else {
        showToast(`成功扫描到 ${projs.length} 个子项目文件夹`);
      }
    } catch (e) {
      showToast(`扫描异常: ${(e as Error).message}`, true);
    } finally {
      setIsScanning(false);
    }
  };

  // 1-Click 导入扫描到的项目
  const handleImportDiscoveredProject = async (p: { path: string; name: string; hasDshSensor: boolean }) => {
    if (settings.projects.some(exist => exist.workspacePath === p.path || exist.name === p.name)) {
      showToast(`项目【${p.name}】已在列表中`);
      return;
    }
    const newP: ProjectConfig = {
      id: `proj-${Date.now()}`,
      name: p.name,
      description: '从大目录扫描自动导入',
      topics: ['General', 'Architecture', 'Notes'],
      workspacePath: p.path,
      storageMode: 'local_bridge',
      createdAt: new Date().toISOString(),
    };

    // 若 Bridge 在线，确保目标项目的 /dshWebSensor 物理存在
    if (bridgeOnline) {
      initSensorWorkspaceViaBridge(settings.bridgeUrl, newP.workspacePath, newP.name).catch(() => {});
    }

    const updatedProjects = [...settings.projects, newP];
    const updated = await saveSettings({ 
      projects: updatedProjects, 
      activeProjectId: newP.id,
      activeTopics: newP.topics,
      activeTopic: newP.topics[0]
    });
    setSettings(updated);

    // 尝试获取或继承目录句柄
    const handle = await getWorkspaceDirectoryHandle(newP.id, newP.name);
    if (handle) {
      setFsHandleActive(true);
      setFsDirName(handle.name);
    }

    trackEvent({
      eventType: 'create_project',
      projectId: newP.id,
      projectName: newP.name,
      metadata: { workspacePath: newP.workspacePath, imported: true, sensorPath: `${newP.workspacePath}/dshWebSensor` },
    }).catch(() => {});
    showToast(`已导入并自动切换至【${newP.name}】，落盘目标 /dshWebSensor 已就绪`);
  };

  // 从 DeepSeek API 动态拉取模型列表
  const handleRefreshModels = async () => {
    if (!settings.deepseekApiKey) {
      showToast('请先输入 DeepSeek API Key 再刷新模型', true);
      return;
    }
    setIsRefreshingModels(true);
    try {
      const models = await fetchAvailableModels(settings.deepseekApiKey, settings.deepseekBaseUrl);
      if (models.length > 0) {
        setAvailableModels(models);
        showToast(`已成功从 DeepSeek API 获取到 ${models.length} 个可用模型`);
      } else {
        showToast('获取模型列表失败，请检查 API Key 或网络', true);
      }
    } catch {
      showToast('获取模型异常', true);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  // 通过本地伴侣 Bridge 同步系统环境变量中的 DEEPSEEK_API_KEY
  const handleSyncEnvKey = async () => {
    const envData = await fetchSystemEnvFromBridge(settings.bridgeUrl);
    if (envData && envData.deepseek_api_key) {
      setSettings({ ...settings, deepseekApiKey: envData.deepseek_api_key });
      showToast('已从本地环境变量同步 DEEPSEEK_API_KEY');
    } else {
      showToast('未从本地服务读取到 DEEPSEEK_API_KEY，请确认 Bridge 服务已启动', true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 text-xs select-none">
      {/* 顶部 Header */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/icons/icon48.png" className="w-5 h-5 object-contain" alt="DSH Whale" />
          <div>
            <h1 className="font-semibold tracking-wide text-xs text-slate-100 flex items-center gap-1.5">
              DSH Web Sensor
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">v1.0</span>
            </h1>
          </div>
        </div>

        {/* 状态灯与导航 */}
        <div className="flex items-center space-x-2">
          {bridgeOnline ? (
            <div 
              title="DSH 本地 Bridge 守护进程已连通 (已开启 100% 免授权物理直写)"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-emerald-500/40 text-[10px]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-mono">⚡ Bridge(免授权)</span>
            </div>
          ) : (
            <button 
              onClick={handleLaunchBridge}
              disabled={isLaunchingBridge}
              title="点击一键唤起本地伴侣网关，开启完全免授权直写"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-[10px] text-rose-200 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="font-mono">{isLaunchingBridge ? '启动中...' : '一键启动Bridge'}</span>
            </button>
          )}

          <button 
            onClick={() => setCurrentView(v => v === 'workbench' ? 'settings' : 'workbench')}
            className={`p-1.5 rounded transition ${currentView === 'settings' ? 'bg-slate-700 text-emerald-400' : 'hover:bg-slate-800 text-slate-300'}`}
            title="配置中心"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Toast 提示条 */}
      {toastMsg && (
        <div className={`mx-3 mt-2 p-2 rounded text-xs flex items-center gap-2 shadow transition-all ${toastMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
          {toastMsg.isError ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="truncate flex-1">{toastMsg.text}</span>
        </div>
      )}

      {/* 主视图切换 */}
      {currentView === 'workbench' && (
        <main className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Bridge 离线提示与一键启动免授权卡片 */}
          {!bridgeOnline && (
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-medium text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>本地 Bridge 伴侣服务未运行</span>
                </div>
                <span className="text-[9px] text-amber-700 font-mono bg-amber-100/90 px-1 py-0.2 rounded border border-amber-300/60">
                  当前沙箱受限
                </span>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                不想每次点击授权？点击下方按钮一键调起后台伴侣网关，即可开启 <strong className="text-amber-950 font-semibold">100% 免授权全自动落盘</strong>！
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleLaunchBridge}
                  disabled={isLaunchingBridge}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded font-medium text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLaunchingBridge ? '正在调起本地网关...' : '🚀 一键运行 Bridge (开启免授权直写)'}
                </button>
              </div>
            </div>
          )}
          {/* 项目与主题工作区卡片 */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
                <span>活跃研究项目</span>
              </div>
              <button 
                onClick={() => setCurrentView('projects')}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 新建/管理
              </button>
            </div>

            {/* 项目下拉选择 */}
            <div className="relative">
              <select 
                value={activeProject.id}
                onChange={(e) => handleSwitchProject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {settings.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 磁盘保存路径信息与文件夹授权入口 */}
            <div className={`p-2.5 rounded border transition-all ${bridgeOnline ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200/80'} flex items-center justify-between gap-2`}>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 flex items-center justify-between gap-1 mb-0.5">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <HardDrive className={`w-3 h-3 ${bridgeOnline ? 'text-emerald-600' : 'text-slate-500'}`} /> 磁盘落盘目标
                  </span>
                  {bridgeOnline ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-600 text-white font-medium flex items-center gap-0.5 shadow-2xs">
                      ⚡ Bridge 免授权直写
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 flex items-center gap-0.5">
                      ✓ /dshWebSensor 就绪
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-800 truncate" title={fsHandleActive ? `${fsDirName}/dshWebSensor` : `${activeProject.workspacePath || '未绑定'}/dshWebSensor`}>
                  {bridgeOnline ? (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-800 font-medium">{activeProject.workspacePath}</span>
                      <span className="text-emerald-700 font-semibold">/dshWebSensor</span>
                    </span>
                  ) : fsHandleActive ? (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-700 font-medium">📁 {fsDirName}</span>
                      <span className="text-emerald-700 font-semibold">/dshWebSensor</span>
                    </span>
                  ) : activeProject.workspacePath ? (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-700">{activeProject.workspacePath}</span>
                      <span className="text-emerald-700 font-semibold">/dshWebSensor</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-sans">待授权项目落盘目录</span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                  {bridgeOnline 
                    ? '⚡ 已连接本地伴侣服务：突破沙箱限制，无需任何授权直接物理写入磁盘！'
                    : (fsHandleActive 
                        ? '🛡️ Chrome 本地沙箱授权已绑定，线索自动存入 /dshWebSensor'
                        : '💡 提示：双击运行 start_bridge.bat 即可彻底开启【免授权】全自动落盘')}
                </div>
              </div>

              {bridgeOnline ? (
                <div className="flex-shrink-0 flex items-center gap-1">
                  <span className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-medium border border-emerald-300/60 flex items-center gap-1">
                    ✓ 免授权
                  </span>
                </div>
              ) : (
                <button 
                  onClick={handleAuthorizeFolder}
                  className="flex-shrink-0 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-medium shadow-xs transition"
                  title="受浏览器安全沙箱限制，如未启动 Bridge 需授权一次；启动 start_bridge.bat 即可完全免授权"
                >
                  {fsHandleActive ? '更改目录' : '授权目录'}
                </button>
              )}
            </div>

            {/* 主题标签流（支持多选） */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" /> 研究主题 
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    多选 ({activeTopics.length})
                  </span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button 
                    onClick={handleSelectAllTopics}
                    className="text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                    title="全选当前项目下的所有主题"
                  >
                    全选
                  </button>
                  <span className="text-slate-300">·</span>
                  <button 
                    onClick={() => setShowAddTopic(!showAddTopic)}
                    className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    {showAddTopic ? '取消' : '+ 新建'}
                  </button>
                </div>
              </div>

              {showAddTopic && (
                <div className="space-y-1 mb-2">
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      placeholder="输入主题 (支持空格、中英文逗号多选输入)..." 
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTopicConfirm()}
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleAddTopicConfirm}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 font-medium shrink-0"
                    >
                      添加并选中
                    </button>
                  </div>
                  {parseTopicsInput(customTopicInput).length > 1 && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                      <span>将识别为 {parseTopicsInput(customTopicInput).length} 个主题:</span>
                      {parseTopicsInput(customTopicInput).map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px] font-medium">
                          +{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {(activeProject.topics || ['General']).map(topic => {
                  const isSelected = activeTopics.includes(topic);
                  return (
                    <button 
                      key={topic}
                      onClick={() => handleToggleTopic(topic)}
                      className={`px-2 py-0.5 rounded-full text-[11px] transition flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white font-medium shadow-2xs ring-1 ring-emerald-500' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={isSelected ? '已选中，点击取消' : '未选中，点击加入多选'}
                    >
                      {isSelected && <span className="text-[10px] leading-none font-bold">✓</span>}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>

              {/* 智能主题推荐 */}
              {suggestedTopics.length > 0 && (
                <div className="flex items-center flex-wrap gap-1 mt-2 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] text-amber-700 flex items-center gap-0.5 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" /> 智能推荐:
                  </span>
                  {suggestedTopics.map(st => {
                    const isAdded = activeTopics.includes(st);
                    return (
                      <button
                        key={st}
                        onClick={() => handleAddSuggestedTopic(st)}
                        className={`px-1.5 py-0.5 rounded text-[10px] border transition flex items-center gap-0.5 ${
                          isAdded
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                        title={isAdded ? '已在多选主题中' : '点击加入多选主题'}
                      >
                        {isAdded ? `✓ ${st}` : `+ ${st}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 核心采集动作卡片 */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm space-y-2">
            <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>当前页面快速提取</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleCaptureCurrentPage}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-medium transition disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>抓取网页正文</span>
              </button>

              <button 
                onClick={handleCaptureChatSession}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md font-medium transition disabled:opacity-50"
                title="归档当前 AI 对话完整会话 (DeepSeek / Claude / ChatGPT)"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>归档 AI 会话</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleCaptureScreenshot}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 p-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-md font-medium transition disabled:opacity-50"
                title="鼠标框选裁剪网页局部重点并添加数据标注，告诉 Agent 关注重点"
              >
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>区域截图快照</span>
              </button>

              <button 
                onClick={handleCaptureVideo}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium transition disabled:opacity-50"
                title="抓取当前 B站 或 YouTube 视频的播放时刻与元数据锚点"
              >
                <Video className="w-3.5 h-3.5 text-amber-600" />
                <span>音视频锚点</span>
              </button>
            </div>

            {/* AI 预处理提示 */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                DeepSeek 智能提纯打标
              </span>
              <span className={settings.deepseekApiKey ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {settings.deepseekApiKey ? '已就绪' : '未配 Key (基础抓取)'}
              </span>
            </div>
          </div>

          {/* 页面文件嗅探与批量下载卡片 */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-slate-800 flex items-center gap-1.5">
                <FolderDown className="w-3.5 h-3.5 text-blue-600" />
                <span>页面文件嗅探与批量下载</span>
                {detectedFiles.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-mono font-medium border border-blue-200">
                    {detectedFiles.length} 个
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDetectFiles}
                  disabled={isDetectingFiles}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="扫描当前标签页中的所有 PDF、Word、表格、压缩包及音视频等文件"
                >
                  <Search className={`w-3 h-3 ${isDetectingFiles ? 'animate-spin' : ''}`} />
                  <span>{isDetectingFiles ? '嗅探中...' : (detectedFiles.length > 0 ? '刷新嗅探' : '🔍 嗅探本页文件')}</span>
                </button>
              </div>
            </div>

            {/* 如果已嗅探到文件 */}
            {detectedFiles.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {/* 存储空间与标签指引 */}
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200/70 text-[10px] text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate mr-1">
                    <span className="text-slate-400">存入空间:</span>
                    <span className="font-semibold text-slate-800">{activeProject.name}</span>
                    <span className="text-slate-400">/</span>
                    <span className="font-mono text-emerald-700 font-medium truncate">dshWebSensor/{activeTopics.join('+')}</span>
                  </div>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-medium shrink-0">
                    自动打标索引
                  </span>
                </div>

                {/* 分类筛选胶囊 */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                  <button
                    onClick={() => { setFileFilterCategory('all'); setFileDisplayLimit(30); }}
                    className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'all' ? 'bg-slate-800 text-white font-medium' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    全部 ({categoryCounts.all})
                  </button>
                  {categoryCounts.document > 0 && (
                    <button
                      onClick={() => { setFileFilterCategory('document'); setFileDisplayLimit(30); }}
                      className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'document' ? 'bg-rose-700 text-white font-medium' : 'bg-rose-50 hover:bg-rose-100 text-rose-700'}`}
                    >
                      文档 ({categoryCounts.document})
                    </button>
                  )}
                  {categoryCounts.data > 0 && (
                    <button
                      onClick={() => { setFileFilterCategory('data'); setFileDisplayLimit(30); }}
                      className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'data' ? 'bg-emerald-700 text-white font-medium' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
                    >
                      数据 ({categoryCounts.data})
                    </button>
                  )}
                  {categoryCounts.archive > 0 && (
                    <button
                      onClick={() => { setFileFilterCategory('archive'); setFileDisplayLimit(30); }}
                      className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'archive' ? 'bg-amber-700 text-white font-medium' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
                    >
                      压缩包 ({categoryCounts.archive})
                    </button>
                  )}
                  {categoryCounts.media > 0 && (
                    <button
                      onClick={() => { setFileFilterCategory('media'); setFileDisplayLimit(30); }}
                      className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'media' ? 'bg-sky-700 text-white font-medium' : 'bg-sky-50 hover:bg-sky-100 text-sky-700'}`}
                    >
                      媒体 ({categoryCounts.media})
                    </button>
                  )}
                  {categoryCounts.code > 0 && (
                    <button
                      onClick={() => { setFileFilterCategory('code'); setFileDisplayLimit(30); }}
                      className={`px-1.5 py-0.5 rounded-full transition shrink-0 ${fileFilterCategory === 'code' ? 'bg-indigo-700 text-white font-medium' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
                    >
                      代码 ({categoryCounts.code})
                    </button>
                  )}
                </div>

                {/* 搜索框与选择控制 */}
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="搜索文件名..."
                      value={fileSearchKeyword}
                      onChange={(e) => {
                        setFileSearchKeyword(e.target.value);
                        setFileDisplayLimit(30);
                      }}
                      className="w-full pl-2 pr-5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                    {fileSearchKeyword && (
                      <button
                        onClick={() => {
                          setFileSearchKeyword('');
                          setFileDisplayLimit(30);
                        }}
                        className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[10px]">
                    <button
                      onClick={() => handleSelectAllFiles(selectedCount < filteredFiles.length)}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      {selectedCount === filteredFiles.length ? '取消全选' : '全选'}
                    </button>
                    <span className="text-slate-400">已选 {selectedCount}/{filteredFiles.length}</span>
                  </div>
                </div>

                {/* 文件条目列表 */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                  {filteredFiles.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-xs">无匹配文件</div>
                  ) : (
                    <>
                      {filteredFiles.slice(0, fileDisplayLimit).map(file => {
                        const badge = getCategoryBadge(file.category, file.extension);
                        return (
                          <div
                            key={file.id}
                            className={`p-1.5 rounded border transition flex items-center justify-between gap-1.5 ${file.isSelected ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50/60 border-slate-200/80'}`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={file.isSelected || false}
                                onChange={() => handleToggleSelectFile(file.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-medium border shrink-0 ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <div className="truncate flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-slate-800 truncate" title={file.filename}>
                                  {file.filename}
                                </div>
                                <div className="text-[9px] text-slate-400 truncate flex items-center gap-1.5">
                                  {file.fileSizeEstimate && <span className="font-mono text-slate-500">{file.fileSizeEstimate}</span>}
                                  <span className="truncate">{file.url}</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              {file.status === 'downloading' && (
                                <span className="text-[10px] text-blue-600 flex items-center gap-0.5">
                                  <Loader2 className="w-3 h-3 animate-spin" /> 下载中
                                </span>
                              )}
                              {file.status === 'saved' && (
                                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> 已入库
                                </span>
                              )}
                              {file.status === 'error' && (
                                <button
                                  onClick={() => handleDownloadSingleFile(file)}
                                  className="text-[9px] px-1 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium cursor-pointer"
                                  title={file.errorMessage || '下载重试'}
                                >
                                  重试
                                </button>
                              )}
                              {(!file.status || file.status === 'pending') && (
                                <button
                                  onClick={() => handleDownloadSingleFile(file)}
                                  className="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-[10px] font-medium flex items-center gap-0.5 shadow-2xs transition cursor-pointer"
                                  title="单独下载此文件至 DSH 研究目录"
                                >
                                  <ArrowDownToLine className="w-2.5 h-2.5" />
                                  <span>下载</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {filteredFiles.length > fileDisplayLimit && (
                        <button
                          onClick={() => setFileDisplayLimit(prev => prev + 30)}
                          className="w-full py-1 text-center text-[10px] text-blue-600 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 rounded font-medium transition cursor-pointer"
                        >
                          显示更多文件 (已显示 {Math.min(fileDisplayLimit, filteredFiles.length)} / 共 {filteredFiles.length} 项)
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* 批量下载主按钮与实时进度条 */}
                <div className="pt-1 border-t border-slate-100">
                  {batchDownloadProgress ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-blue-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          正在下载 {batchDownloadProgress.current}/{batchDownloadProgress.total}...
                        </span>
                        <span className="font-mono text-slate-500 truncate max-w-[140px]">
                          {batchDownloadProgress.filename}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                          style={{ width: `${(batchDownloadProgress.current / batchDownloadProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleBatchDownloadSelected}
                      disabled={selectedCount === 0 || isBatchDownloading}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <FolderDown className="w-3.5 h-3.5" />
                      <span>🚀 批量下载选中的 {selectedCount} 个文件至 DSH</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50/80 rounded border border-dashed border-slate-200 text-center space-y-1.5">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  点击按钮一键智能识别当前网页中的 <strong className="text-slate-700 font-medium">PDF 论文、Word/PPT 讲义、CSV 数据、ZIP 源码包与音视频</strong>。
                </p>
                <button
                  onClick={handleDetectFiles}
                  disabled={isDetectingFiles}
                  className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded text-xs font-medium transition inline-flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  <Search className={`w-3 h-3 ${isDetectingFiles ? 'animate-spin' : ''}`} />
                  <span>{isDetectingFiles ? '正在嗅探网页资源...' : '开始嗅探本页文件'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 即时便签输入 */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>调研快速灵感 / 便签</span>
              </span>
            </div>
            <textarea 
              rows={2}
              placeholder="记录关于当前页面或调研的启发与线索..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-emerald-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSaveQuickNote}
                disabled={!quickNote.trim() || isProcessing}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium transition disabled:opacity-40"
              >
                存入线索库
              </button>
            </div>
          </div>

          {/* 最近采集线索流 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 px-1">
              <span>已采集资产 ({recentItems.length})</span>
              <button onClick={loadData} className="text-slate-400 hover:text-slate-600">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {recentItems.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                暂无线索，可在网页中划词或点击上方按钮开始采集
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentItems.slice(0, 10).map((item) => (
                  <div key={item.id} className="p-2 bg-white rounded-md border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-medium text-slate-800 text-xs truncate flex-1" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase flex-shrink-0">
                        {item.documentType}
                      </span>
                    </div>

                    {item.aiSummary && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed bg-slate-50 p-1 rounded">
                        💡 {item.aiSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-700 font-medium">#{item.topic}</span>
                        {item.tags?.slice(0, 2).map(t => (
                          <span key={t} className="text-slate-400">· {t}</span>
                        ))}
                      </div>
                      <span className="font-mono text-[9px]">{item.capturedAt.slice(11, 16)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* 项目管理视图 */}
      {currentView === 'projects' && (
        <main className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" /> 项目空间列表
            </h2>
            <button 
              onClick={() => setCurrentView('workbench')}
              className="text-slate-500 hover:text-slate-800 text-xs"
            >
              返回工作台
            </button>
          </div>

          <div className="space-y-2">
            {settings.projects.map(p => (
              <div key={p.id} className={`p-2.5 rounded-lg border transition ${p.id === activeProject.id ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-slate-800 text-xs">{p.name}</h3>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100/70 text-emerald-800 font-mono">
                      ✓ /dshWebSensor 就绪
                    </span>
                  </div>
                  {p.id === activeProject.id ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-medium">当前活跃</span>
                  ) : (
                    <button 
                      onClick={() => handleSwitchProject(p.id)}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                      切换并激活
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono truncate flex items-center gap-1">
                  <span>落盘目标:</span>
                  <span className="text-slate-700">{p.workspacePath}</span>
                  <span className="text-emerald-700 font-semibold">/dshWebSensor</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.topics.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 新增项目表单 */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <h3 className="font-medium text-slate-700 text-xs">+ 新建项目空间</h3>
            <div>
              <label className="text-[10px] text-slate-500">项目名称</label>
              <input 
                type="text"
                placeholder="例如: AI-Agent-调研"
                value={newProjName}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewProjName(val);
                  if (!tempDirHandle && (!newProjPath || newProjPath.startsWith('D:/KnowledgeBase/'))) {
                    setNewProjPath(val ? `D:/KnowledgeBase/${val.trim()}` : '');
                  }
                }}
                className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500">本地磁盘目标路径</label>
                <button
                  type="button"
                  onClick={handleBrowseNewProjectFolder}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                  title="调起系统文件夹选取框，选取后自动创建 /dshWebSensor 子目录"
                >
                  <HardDrive className="w-3 h-3" /> 📁 浏览目录
                </button>
              </div>
              <input 
                type="text"
                placeholder="例如: D:/KnowledgeBase/AI-Agent (或点击浏览目录选取)"
                value={newProjPath}
                onChange={(e) => setNewProjPath(e.target.value)}
                className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
              />
              <div className="mt-1 p-1.5 rounded bg-emerald-50/70 border border-emerald-200/80 text-[10px] text-emerald-800 space-y-0.5">
                <div className="flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>自动建议落盘空间:</span>
                </div>
                <div className="font-mono text-[9px] text-emerald-900 truncate">
                  {newProjPath || (newProjName ? `D:/KnowledgeBase/${newProjName}` : 'D:/KnowledgeBase/新项目')}
                  <span className="font-bold text-emerald-700">/dshWebSensor</span>
                </div>
                <p className="text-[9px] text-emerald-700/80">
                  ✓ 创建或选取后将立即自动建立 /dshWebSensor 文件夹，无需手动新建。
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] text-slate-500 font-medium">默认主题 / 预设标签 (支持空格、中英文逗号间隔)</label>
                <span className="text-[9px] text-slate-400">已识别 {parseTopicsInput(newProjTopics).length} 个</span>
              </div>
              <input 
                type="text"
                placeholder="例如: 架构 算法 笔记 (空格或逗号均可)"
                value={newProjTopics}
                onChange={(e) => setNewProjTopics(e.target.value)}
                className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              {parseTopicsInput(newProjTopics).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                  {parseTopicsInput(newProjTopics).map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] flex items-center gap-0.5">
                      <span className="text-emerald-500 font-bold">#</span>{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handleCreateProject}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
            >
              创建项目并就绪 /dshWebSensor
            </button>
          </div>

          {/* 常用大目录项目自动发现卡片 */}
          <div className="bg-slate-100/90 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800 text-xs flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-600" /> 常用大目录自动发现项目
              </h3>
              {frequentParentDirs.length > 0 && (
                <span className="text-[10px] text-slate-500">已学习 {frequentParentDirs.length} 个大目录</span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              基于操作行为记录，自动探测扫描常用工作大目录下的子项目与已存在的 /dshWebSensor。
            </p>

            <div className="flex gap-1.5">
              <input 
                type="text"
                placeholder="输入或选择常用大目录 (如 D:/Projects 或 D:/KnowledgeBase)"
                value={parentScanDir}
                onChange={(e) => setParentScanDir(e.target.value)}
                className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none font-mono"
              />
              <button
                onClick={handleScanParentDir}
                disabled={isScanning || !parentScanDir.trim()}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition disabled:opacity-40 flex items-center gap-1 flex-shrink-0"
              >
                <Search className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? '扫描中...' : '扫描发现'}
              </button>
            </div>

            {/* 快速选择已有父目录快捷项 */}
            {frequentParentDirs.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 text-[10px] text-slate-500 pt-0.5">
                <span>高频目录:</span>
                {frequentParentDirs.map(dir => (
                  <button
                    key={dir}
                    onClick={() => {
                      setParentScanDir(dir);
                      discoverProjectsInDirectory(dir).then(setDiscoveredProjects);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[9px]"
                  >
                    {dir.split(/[\\/]/).pop() || dir}
                  </button>
                ))}
              </div>
            )}

            {/* 发现的子项目列表 */}
            {discoveredProjects.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-400 font-medium">发现 {discoveredProjects.length} 个子项目文件夹:</div>
                {discoveredProjects.map(proj => {
                  const isImported = settings.projects.some(p => p.workspacePath === proj.path || p.name === proj.name);
                  return (
                    <div key={proj.path} className="flex items-center justify-between p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-xs">
                      <div className="truncate flex-1 mr-2">
                        <span className="font-medium text-slate-800">{proj.name}</span>
                        {proj.hasDshSensor && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-mono font-medium">
                            已含 dshWebSensor
                          </span>
                        )}
                      </div>
                      {isImported ? (
                        <span className="text-[10px] text-slate-400 font-medium">已在列表</span>
                      ) : (
                        <button
                          onClick={() => handleImportDiscoveredProject(proj)}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium"
                        >
                          导入项目
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* 配置中心视图 */}
      {currentView === 'settings' && (
        <main className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-emerald-600" /> 扩展配置中心
            </h2>
            <button 
              onClick={() => setCurrentView('workbench')}
              className="text-slate-500 hover:text-slate-800 text-xs"
            >
              返回工作台
            </button>
          </div>

          {/* DeepSeek API 配置 */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> DeepSeek API 配置
              </span>
              <a 
                href="https://platform.deepseek.com/api_keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-emerald-600 hover:underline"
              >
                获取 Key ↗
              </a>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500">API Key</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncEnvKey}
                    className="text-[9px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 font-medium"
                    title="从本地 Bridge 服务读取系统环境变量中的 DEEPSEEK_API_KEY"
                  >
                    从系统环境同步
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-slate-400 hover:text-slate-600"
                    title={showApiKey ? '隐藏 Key' : '显示 Key'}
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <input 
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={settings.deepseekApiKey}
                onChange={(e) => setSettings({ ...settings, deepseekApiKey: e.target.value })}
                className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500">模型选择</label>
                  <button 
                    type="button"
                    onClick={handleRefreshModels}
                    disabled={isRefreshingModels || !settings.deepseekApiKey}
                    className="text-[9px] text-emerald-600 hover:underline flex items-center gap-0.5 disabled:opacity-40"
                    title="从 DeepSeek 官方接口 (GET /models) 拉取当前最新模型"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isRefreshingModels ? 'animate-spin' : ''}`} /> 刷新
                  </button>
                </div>
                <select 
                  value={availableModels.includes(settings.deepseekModel) ? settings.deepseekModel : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setSettings({ ...settings, deepseekModel: e.target.value });
                    }
                  }}
                  className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono"
                >
                  {availableModels.map(m => {
                    let desc = m;
                    if (m === 'deepseek-flash' || m === 'deepseek flash') desc = `DeepSeek V4.1 Flash (${m})`;
                    else if (m === 'deepseek-v4-pro') desc = `DeepSeek-V4 Pro (${m})`;
                    else if (m === 'deepseek-chat') desc = `DeepSeek-V3 (${m})`;
                    else if (m === 'deepseek-reasoner') desc = `DeepSeek-R1 (${m})`;
                    return <option key={m} value={m}>{desc}</option>;
                  })}
                  <option value="custom">-- 自定义其他模型 --</option>
                </select>
                {(!availableModels.includes(settings.deepseekModel) || settings.deepseekModel === 'custom') && (
                  <input 
                    type="text"
                    placeholder="输入模型标识符..."
                    value={settings.deepseekModel === 'custom' ? '' : settings.deepseekModel}
                    onChange={(e) => setSettings({ ...settings, deepseekModel: e.target.value })}
                    className="w-full p-1 mt-1 bg-white border border-slate-200 rounded text-xs font-mono"
                  />
                )}
              </div>
              <div>
                <label className="text-[10px] text-slate-500">API Base URL</label>
                <input 
                  type="text"
                  value={settings.deepseekBaseUrl}
                  onChange={(e) => setSettings({ ...settings, deepseekBaseUrl: e.target.value })}
                  className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* DSH 本地 Bridge 伴侣服务配置 */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-blue-600" /> DSH 本地 Bridge 服务 (轨 B)
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${bridgeOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {bridgeOnline ? '在线' : '离线'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              运行仓库中的 <code>python server/dsh_bridge.py</code> 即可启动本地守护服务，无需浏览器手动授权即可突破沙箱直接写入任意物理磁盘路径。
            </p>
            <div>
              <label className="text-[10px] text-slate-500">Bridge 监听地址</label>
              <input 
                type="text"
                value={settings.bridgeUrl}
                onChange={(e) => setSettings({ ...settings, bridgeUrl: e.target.value })}
                className="w-full p-1.5 mt-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <button 
            onClick={async () => {
              await saveSettings(settings);
              showToast('配置已保存生效');
              loadData();
              setCurrentView('workbench');
            }}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition"
          >
            保存所有配置
          </button>
        </main>
      )}

      {/* 底部 Footer 状态条 */}
      <footer className="px-3 py-1.5 bg-white border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate max-w-[220px]" title={activeTab.url ? `${activeTab.title} (${activeTab.url})` : activeTab.title}>
          {activeTab.url?.startsWith('file://') ? (
            <span className="flex-shrink-0 px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-mono text-[9px] flex items-center gap-0.5" title="本地文件 URL (file:///)">
              📁 本地文件
            </span>
          ) : activeTab.url?.startsWith('http://localhost') || activeTab.url?.startsWith('http://127.0.0.1') ? (
            <span className="flex-shrink-0 px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-mono text-[9px] flex items-center gap-0.5" title="本地开发服务">
              ⚡ 本地服务
            </span>
          ) : activeTab.url?.startsWith('http') ? (
            <span className="flex-shrink-0 px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-mono text-[9px] flex items-center gap-0.5" title="互联网 Web 链接">
              🌐 网络
            </span>
          ) : (
            <span className="flex-shrink-0 px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] flex items-center gap-0.5">
              📝 本地
            </span>
          )}
          <span className="truncate text-slate-700 font-medium">{activeTab.title || '就绪'}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">DSH Web Sensor</span>
      </footer>
    </div>
  );
}
