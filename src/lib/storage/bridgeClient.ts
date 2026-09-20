import { CapturedItem } from '@/types';

export interface BridgeHealthResponse {
  status: 'ok' | 'error';
  version?: string;
  default_workspace?: string;
  dsh_agent_ready?: boolean;
}

export interface BridgeSaveResponse {
  success: boolean;
  saved_path: string;
  message?: string;
}

/**
 * 检测本地 DSH Bridge 服务是否在线
 */
export async function checkBridgeHealth(bridgeUrl = 'http://127.0.0.1:8765'): Promise<BridgeHealthResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s 快速心跳超时
    const res = await fetch(`${bridgeUrl.replace(/\/$/, '')}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // 服务未启动或离线
  }
  return null;
}

/**
 * 从本地 Bridge 服务读取系统环境变量 (如 DEEPSEEK_API_KEY)
 */
export async function fetchSystemEnvFromBridge(bridgeUrl = 'http://127.0.0.1:8765'): Promise<{ deepseek_api_key?: string } | null> {
  try {
    const res = await fetch(`${bridgeUrl.replace(/\/$/, '')}/api/system_env`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // bridge 离线
  }
  return null;
}

/**
 * 通过本地 Python Bridge 网关提交资产包（突破浏览器沙箱，写入物理绝对路径）
 */
export async function saveBundleViaBridge(
  bridgeUrl: string,
  workspacePath: string,
  item: CapturedItem
): Promise<BridgeSaveResponse> {
  const url = `${bridgeUrl.replace(/\/$/, '')}/api/save_bundle`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspace_path: workspacePath,
      item: item,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bridge 保存失败 (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export interface BridgeInitSensorResponse {
  success: boolean;
  workspace_path: string;
  sensor_path: string;
  message?: string;
}

/**
 * 通知本地 Bridge 服务初始化或确保目标项目的 /dshWebSensor 子目录存在
 */
export async function initSensorWorkspaceViaBridge(
  bridgeUrl: string,
  workspacePath: string,
  projectName?: string
): Promise<BridgeInitSensorResponse | null> {
  try {
    const url = `${bridgeUrl.replace(/\/$/, '')}/api/workspace/init_sensor`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_path: workspacePath,
        project_name: projectName,
      }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('通知 Bridge 初始化 dshWebSensor 失败:', e);
  }
  return null;
}
