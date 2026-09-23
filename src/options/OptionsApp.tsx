import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/storage/settings';
import { PluginSettings, DEFAULT_SETTINGS } from '@/types';
import { fetchAvailableModels } from '@/lib/ai/deepseek';
import { fetchSystemEnvFromBridge } from '@/lib/storage/bridgeClient';
import { Settings, Sparkles, Terminal, HardDrive, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function OptionsApp() {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [envNotice, setEnvNotice] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'deepseek-flash',
    'deepseek flash',
    'deepseek-v4-pro',
    'deepseek-chat',
    'deepseek-reasoner'
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleRefresh = async () => {
    if (!settings.deepseekApiKey) return;
    setIsRefreshing(true);
    try {
      const models = await fetchAvailableModels(settings.deepseekApiKey, settings.deepseekBaseUrl);
      if (models.length > 0) {
        setAvailableModels(models);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncEnv = async () => {
    const envData = await fetchSystemEnvFromBridge(settings.bridgeUrl);
    if (envData && envData.deepseek_api_key) {
      setSettings({ ...settings, deepseekApiKey: envData.deepseek_api_key });
      setEnvNotice('已成功读取系统环境变量 DEEPSEEK_API_KEY');
      setTimeout(() => setEnvNotice(''), 3000);
    } else {
      setEnvNotice('未能通过本地 Bridge 读取到环境变量，请先启动 python server/dsh_bridge.py');
      setTimeout(() => setEnvNotice(''), 4000);
    }
  };

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/icons/icon48.png" className="w-8 h-8 object-contain" alt="DSH Whale" />
            <div>
              <h1 className="text-base font-semibold">DSH Web Sensor 全局设置中心</h1>
              <p className="text-xs text-slate-400">DeepSeek Harness 前端多模态数据采集与预处理插件</p>
            </div>
          </div>
          <Settings className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-6 space-y-6">
          {/* DeepSeek API */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> DeepSeek 智能分析设置
            </h2>
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600">DeepSeek API Key</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncEnv}
                      className="text-emerald-600 hover:underline flex items-center gap-1 font-medium text-[11px]"
                      title="通过本地 Bridge 读取系统环境变量中的 DEEPSEEK_API_KEY"
                    >
                      从系统环境同步 (DEEPSEEK_API_KEY)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-slate-400 hover:text-slate-600"
                      title={showApiKey ? '隐藏 Key' : '显示 Key'}
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={settings.deepseekApiKey}
                  onChange={(e) => setSettings({ ...settings, deepseekApiKey: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
                {envNotice && (
                  <p className="text-[11px] text-emerald-600 mt-1">{envNotice}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600">分析模型</label>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isRefreshing || !settings.deepseekApiKey}
                      className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> 刷新模型
                    </button>
                  </div>
                  <select
                    value={availableModels.includes(settings.deepseekModel) ? settings.deepseekModel : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setSettings({ ...settings, deepseekModel: e.target.value });
                      }
                    }}
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:outline-none font-mono"
                  >
                    {availableModels.map(m => {
                      let desc = m;
                      if (m === 'deepseek-flash' || m === 'deepseek flash') desc = `DeepSeek V4.1 Flash (${m})`;
                      else if (m === 'deepseek-v4-pro') desc = `DeepSeek-V4 Pro (${m})`;
                      else if (m === 'deepseek-chat') desc = `DeepSeek-V3 (${m})`;
                      else if (m === 'deepseek-reasoner') desc = `DeepSeek-R1 (${m})`;
                      return <option key={m} value={m}>{desc}</option>;
                    })}
                    <option value="custom">-- 自定义输入模型 --</option>
                  </select>
                  {(!availableModels.includes(settings.deepseekModel) || settings.deepseekModel === 'custom') && (
                    <input
                      type="text"
                      placeholder="输入模型名称，如 deepseek-chat..."
                      value={settings.deepseekModel === 'custom' ? '' : settings.deepseekModel}
                      onChange={(e) => setSettings({ ...settings, deepseekModel: e.target.value })}
                      className="w-full p-1.5 mt-1 border border-slate-200 rounded text-xs font-mono"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">API Base URL</label>
                  <input
                    type="text"
                    value={settings.deepseekBaseUrl}
                    onChange={(e) => setSettings({ ...settings, deepseekBaseUrl: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* DSH 本地 Bridge 伴侣服务 */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" /> DSH 本地 Bridge 网关服务 (轨 B)
            </h2>
            <p className="text-xs text-slate-500">
              用于突破浏览器安全沙箱限制，直接将文件写至任意本地磁盘绝对路径。启动命令：<code>python server/dsh_bridge.py</code>
            </p>
            <div>
              <label className="block text-slate-600 text-xs mb-1">Bridge 监听地址</label>
              <input
                type="text"
                value={settings.bridgeUrl}
                onChange={(e) => setSettings({ ...settings, bridgeUrl: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded font-mono text-xs focus:outline-none"
              />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 项目工作空间概览 */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" /> 默认工作空间与下载设置
            </h2>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDownloadImages}
                  onChange={(e) => setSettings({ ...settings, autoDownloadImages: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>抓取网页正文时，自动下载图片并本地化归档到 assets/ 目录</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAutoSummary}
                  onChange={(e) => setSettings({ ...settings, enableAutoSummary: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>抓取线索时，自动调用 DeepSeek 提炼两句核心结论</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAutoTagging}
                  onChange={(e) => setSettings({ ...settings, enableAutoTagging: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>抓取线索时，自动基于语义生成推荐主题标签</span>
              </label>
            </div>
          </section>

          <div className="pt-4 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> 设置已成功保存
              </span>
            ) : <span />}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
