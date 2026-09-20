import { TelemetryEvent, TelemetryInsights } from '@/types';
import { getSettings } from '../storage/settings';

const TELEMETRY_STORAGE_KEY = 'dsh_telemetry_events_buffer';
const MAX_LOCAL_BUFFER_SIZE = 100;

/**
 * 获取本地缓存的未上报埋点事件
 */
export async function getBufferedEvents(): Promise<TelemetryEvent[]> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const res = await chrome.storage.local.get(TELEMETRY_STORAGE_KEY);
    return res[TELEMETRY_STORAGE_KEY] || [];
  }
  const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * 记录埋点事件并尝试异步上报至本地 DSH Bridge 后端
 */
export async function trackEvent(
  partialEvent: Omit<TelemetryEvent, 'eventId' | 'timestamp'>
): Promise<void> {
  let domain = '';
  if (partialEvent.url) {
    try {
      domain = new URL(partialEvent.url).hostname;
    } catch {
      // 忽略无法解析的 URL
    }
  }

  const fullEvent: TelemetryEvent = {
    ...partialEvent,
    domain: partialEvent.domain || domain,
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  // 1. 存入本地缓存
  const currentBuffer = await getBufferedEvents();
  const updatedBuffer = [...currentBuffer, fullEvent].slice(-MAX_LOCAL_BUFFER_SIZE);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [TELEMETRY_STORAGE_KEY]: updatedBuffer });
  } else {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(updatedBuffer));
  }

  // 2. 异步尝试向本地 Bridge 后端批量上报
  flushTelemetryEvents().catch(() => {
    // 后台尝试上报失败时不阻塞用户体验
  });
}

/**
 * 将本地堆积的埋点批量上报至 DSH Bridge
 */
export async function flushTelemetryEvents(): Promise<boolean> {
  const events = await getBufferedEvents();
  if (events.length === 0) return true;

  try {
    const settings = await getSettings();
    const bridgeUrl = settings.bridgeUrl || 'http://127.0.0.1:8765';

    const resp = await fetch(`${bridgeUrl}/api/telemetry/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });

    if (resp.ok) {
      // 上报成功后清空已上报缓存
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [TELEMETRY_STORAGE_KEY]: [] });
      } else {
        localStorage.removeItem(TELEMETRY_STORAGE_KEY);
      }
      return true;
    }
  } catch {
    // Bridge 离线，暂存本地等待下一次触发
  }
  return false;
}

/**
 * 向 Bridge 请求基于历史行为分析的洞察数据（常用大目录、高频项目与推荐主题）
 */
export async function fetchTelemetryInsights(
  currentDomain?: string
): Promise<TelemetryInsights | null> {
  try {
    const settings = await getSettings();
    const bridgeUrl = settings.bridgeUrl || 'http://127.0.0.1:8765';
    const query = currentDomain ? `?domain=${encodeURIComponent(currentDomain)}` : '';

    const resp = await fetch(`${bridgeUrl}/api/telemetry/insights${query}`);
    if (resp.ok) {
      return (await resp.json()) as TelemetryInsights;
    }
  } catch (err) {
    console.warn('获取行为埋点洞察失败', err);
  }
  return null;
}

/**
 * 扫描常用大目录，自动寻找子工程
 */
export async function discoverProjectsInDirectory(
  parentDir: string
): Promise<{ path: string; name: string; hasDshSensor: boolean }[]> {
  try {
    const settings = await getSettings();
    const bridgeUrl = settings.bridgeUrl || 'http://127.0.0.1:8765';

    const resp = await fetch(`${bridgeUrl}/api/projects/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_dir: parentDir }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.projects || [];
    }
  } catch (err) {
    console.warn('扫描大目录失败', err);
  }
  return [];
}
