import { PluginSettings, DEFAULT_SETTINGS, ProjectConfig } from '@/types';

const SETTINGS_KEY = 'dsh_plugin_settings';

export async function getSettings(): Promise<PluginSettings> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    if (result && result[SETTINGS_KEY]) {
      return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
    }
  } else {
    // Fallback to localStorage for testing/mocking
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<PluginSettings>): Promise<PluginSettings> {
  const current = await getSettings();
  const updated: PluginSettings = { ...current, ...settings };
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: updated });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function getActiveProject(): Promise<ProjectConfig> {
  const settings = await getSettings();
  const project = settings.projects.find(p => p.id === settings.activeProjectId);
  return project || settings.projects[0];
}

export async function addProject(project: Omit<ProjectConfig, 'id' | 'createdAt'>): Promise<ProjectConfig> {
  const settings = await getSettings();
  const newProject: ProjectConfig = {
    ...project,
    id: `project-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const projects = [...settings.projects, newProject];
  await saveSettings({ projects, activeProjectId: newProject.id });
  return newProject;
}

export async function updateProject(id: string, updates: Partial<ProjectConfig>): Promise<void> {
  const settings = await getSettings();
  const projects = settings.projects.map(p => p.id === id ? { ...p, ...updates } : p);
  await saveSettings({ projects });
}

export async function deleteProject(id: string): Promise<void> {
  const settings = await getSettings();
  if (settings.projects.length <= 1) {
    throw new Error('至少保留一个项目空间');
  }
  const projects = settings.projects.filter(p => p.id !== id);
  const activeProjectId = settings.activeProjectId === id ? projects[0].id : settings.activeProjectId;
  await saveSettings({ projects, activeProjectId });
}
