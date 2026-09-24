# DSH Web Data Sensor - Agent 协作会议与技术演进全景记录

> **文档定位**: 供后续接手、协同开发或代码审查的 AI Agent / 工程师快速建立全量上下文，避免重复踩坑或破坏已有设计。  
> **项目代码仓**: [https://github.com/DaimaRuge/DSH-Web-Data-Sensor](https://github.com/DaimaRuge/DSH-Web-Data-Sensor)  
> **当前版本**: `v1.0.0` (Manifest V3 Chrome 扩展 + Python 本地伴侣网关)  
> **更新时间**: 2026-09-25

---

## 1. 项目核心愿景与架构全景

### 1.1 核心愿景
**DSH Web Data Sensor (深度求索网络数据感知传感器)** 是专为 DeepSeek / 大模型科研与工程调研设计的全模态数据感知与线索索引插件。它作为下游智能体（Agent）的“感知神经元”，能够将用户在网页浏览、文献查阅、AI 对话以及文件下载过程中的所有碎片化资产，**结构化、全自动、免授权地落盘为标准化数据集**（含 `content.md`、`metadata.json` 与 `assets/*` 原始文件）。

### 1.2 架构拓扑
```mermaid
flowchart TD
    subgraph Browser["Chrome 浏览器 (Manifest V3 扩展)"]
        SP["侧边栏工作台 (Sidepanel React UI)"]
        CS["内容感知脚本 (Content Script)"]
        AD["AI Chat 适配器 (DeepSeek / Claude / ChatGPT...)"]
        FD["文件嗅探引擎 (FileDetector)"]
        BG["服务工作线程 (Background Service Worker)"]
    end

    subgraph OS["本地操作系统 / 宿主机"]
        Bridge["Python Bridge 本地网关 (server/dsh_bridge.py:8765)"]
        Disk["本地项目物理磁盘 (dshWebSensor/{activeTopics}/...)"]
    end

    SP -->|chrome.runtime.sendMessage| BG
    CS -->|chrome.runtime.sendMessage| BG
    AD --> CS
    FD --> CS
    BG -->|HTTP REST API (免授权直写)| Bridge
    BG -.->|浏览器 File System Access API (降级沙箱)| Disk
    Bridge -->|os/shutil 无弹窗极速物理写入| Disk
```

---

## 2. 会议需求演进脉络与关键技术决策记录 (Changelog)

本节按时间线记录用户历次核心需求、技术权衡及最终落地方案：

### 会议 1: 消除重复授权痛点，构建 Bridge 伴侣免授权机制
- **用户痛点**: “为什么每次都要授权点击【授权目录】，可以不要么？”
- **根本原因**: 现代 Chromium 浏览器的安全沙箱限制，使用原生 `showDirectoryPicker()` (File System Access API) 获得的句柄在浏览器重启或页面重载后权限会被重置，导致每次都需要用户手动弹窗确认。
- **技术决策**: 
  - 构建基于 Python FastAPI 的本地伴侣服务 [`server/dsh_bridge.py`](file:///d:/vibe-coding-2026/dataIndexChrome/server/dsh_bridge.py)（端口 `8765`）；
  - 侧边栏优先检测 `localhost:8765/api/health`。若在运行，插件直接调用 HTTP API 执行物理写盘，实现 **100% 免任何授权弹窗**；
  - 规范化子目录结构：统一将所有资产沉淀于项目目录下的 `/dshWebSensor` 文件夹中，绝不污染用户主工程根目录；
  - 双模兼容：若用户未运行 Bridge，自动平滑回退至浏览器沙箱 File System Access API。

### 会议 2: 侧边栏 Bridge 状态可视化与一键启动
- **用户需求**: “Bridge 没有启动应该在侧边栏显示状态，并支持点击一键运行，普通用户无法理解底层终端命令。”
- **技术实现**: 
  - 侧边栏设计动态健康脉冲指示灯（⚡ 绿色在线 / 🔴 红色离线）；
  - 提供专属无感后台调起方案：编写 `start_bridge.bat` 与 VBScript 静默启动脚本；
  - 侧边栏「一键启动 Bridge」按钮通过调用预置 URL 协议或系统指令无感唤起后台服务。

### 会议 3: 纯净编译打包与 GitHub 仓库独立发布
- **用户需求**: “打包原生插件编译，不要混入个人的 Chrome API Key 与本地数据，同步开源到 GitHub 仓库 `DSH-Web-Data-Sensor`。”
- **技术实现**:
  - 创建 `.gitignore` 与 `.zcodeignore`，彻底屏蔽配置缓存、测试临时文件与个人 Key；
  - 配置 `npm run package` 自动完成 TS 校验、Vite 生产打包、Zip 归档；
  - 使用 `gh` CLI 建立远端仓库并在本地配置 upstream：`git@github.com:DaimaRuge/DSH-Web-Data-Sensor.git`。

### 会议 4: 全模态采集数据 100% 具备有效 URL 溯源
- **用户需求**: “浏览器抓取的所有数据都必须有 URL，不管是本地的还是网络的。”
- **技术实现**:
  - 全链路排查修复：AI 对话适配器头部注入 URL、右键抓图 4 级回退补全、便签动态刷新聚焦 Tab、Readability 正文提取补全；
  - 制定四级统一 URL 分类标准 (`url_type`)：`web` (公网), `local_file` (本地 `file:///`), `local_app` (本地服务端口), `local_note` (离线便签)；
  - `metadata.json` 与 `content.md` 建立严格 **URL Guard 守卫机制**，杜绝任何空 URL 落盘。

### 会议 5: 网页截图快照功能彻底排查与修复
- **用户反馈**: “截图功能无法启用了，请排查并修复。”
- **排查根因**:
  1. `manifest.json` 缺少 `"tabs"` 权限（侧边栏点击在独立 frame，不会自动授权左侧网页 `activeTab`）；
  2. Service Worker 上下文没有当前活动窗口概念（`windowId: -2` 报错）；
  3. 老标签页未加载 Content Script，报 `Receiving end does not exist`。
- **技术实现**:
  - 在 `manifest.json` 显式补齐 `"tabs"`；
  - Background 实现**三级截屏容错**（Sender windowId $\rightarrow$ `captureVisibleTab()` $\rightarrow$ `getLastFocused` 重试）；
  - 引入 `ensureContentScript` 探活与动态热注入机制；
  - 交互式拖拽框选、高亮纯净原色裁剪与标注输入功能完全恢复。

### 会议 6: DeepSeek 官方鲸鱼 Logo 焕新重构
- **用户需求**: “参考 Aily / ChatGPT 插件 Logo，用 DeepSeek 官方鲸鱼元素创作新 Logo。”
- **技术实现**:
  - 提取 DeepSeek 官方标准矢量贝塞尔曲线，摒弃生硬硬币底盘，采用 **纯透明无边框、88% 画布饱满占比**；
  - 采用 **皇家深蓝 $\rightarrow$ DeepSeek 极光蓝 $\rightarrow$ 呼吸电光青** 高级渐变色系；
  - 使用 Chrome Headless 透明管道渲染生成 128px、48px、16px 极致锐利多模态图元。

### 会议 7: 研究主题全符号智能解析（空格、中文逗号等）
- **用户需求**: “研究主题支持空格、中文逗号（除英文逗号外）表示间隔；新建项目与侧栏新增均要支持。”
- **技术实现**:
  - 编写统一解析引擎 [`src/lib/parser/topics.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/lib/parser/topics.ts)，统一正则：`/[,，、;；\s\u3000\u00A0]+/`；
  - 新建项目支持连续空格输入并实时展示主题徽标动态预览；
  - 侧边栏「+ 新建」主题支持批量切分与一键加入多选。

### 会议 8 & 9: 单文件与批量文件下载至 DSH 研究目录并打标索引
- **用户需求**: “增加单文件/批量下载至 DSH 研究目录功能；右键单文件下载索引；右键批量下载并呼出侧边栏；侧栏支持嗅探本页文件；严禁删除或取消原有的右键功能！”
- **技术实现**:
  - 新增并保留全部右键菜单（原有的划词、正文、截图、抓图完整无损保留）；
  - 增加 `link` 上下文「📥 下载此文件到 DSH 研究目录并索引」以及 `page/selection` 上下文「📦 批量下载本页文件到 DSH 研究目录」；
  - 侧栏集成嗅探面板：支持文档、数据、压缩包、代码、媒体等 6 大分类胶囊过滤、关键词检索、全选反选与下载进度条；
  - 下载文件自动落盘到 `dshWebSensor/{activeTopics}/.../assets/{filename}`，同时生成标签与 Markdown 索引。

### 会议 10: 归类标签引发浏览器死机与内存剧增 Bug 根除
- **用户反馈**: “点击归类时，浏览器死机，然后浏览器内存占用剧增。归类标签功能有 bugs 请排查并解决。”
- **排查根因**:
  1. `fileDetector.ts` 正则过于泛化，把 URL 路径中带 `.js/`、`.c/` 或包含 `/download` 的普通网页链接全部当成文件，单页误报数千个伪文件；
  2. Content Script 在遍历 `<a>` 标签时频繁调用 `a.innerText` 与 `parentElement.innerText`，迫使浏览器产生大量**强制重排（Forced Layout/Reflow）**并产生上百兆垃圾字符串，卡死页面主线程；
  3. 侧边栏点击分类时无节制渲染数千个 DOM 节点，且在无 `useMemo` 情况下重复执行 6 次全量数组过滤，导致渲染线程雪崩。
- **技术实现**:
  - 精准限定仅匹配 URL 路径最后一个分段的扩展名，显式排除 `.html`、`.php` 等常规网页；
  - 使用 `textContent` 替代 `innerText`，消除 Forced Reflow；移除父元素文本遍历，设置 `MAX_DETECTED_FILES = 120` 硬上限；
  - 侧边栏采用 `useMemo` 缓存，`categoryCounts` 单次 O(N) 统计，引入 `fileDisplayLimit = 30` **分批窗口化分页渲染**，DOM 挂载时间降至 < 5ms。

---

## 3. 核心目录与代码模块索引

| 路径 | 核心职责 | 关键导出 / 入口 |
| :--- | :--- | :--- |
| [`manifest.json`](file:///d:/vibe-coding-2026/dataIndexChrome/manifest.json) | Chrome MV3 扩展配置清单 | 权限：`storage`, `sidePanel`, `contextMenus`, `downloads`, `activeTab`, `tabs`, `scripting`, `<all_urls>`, `file:///*` |
| [`src/sidepanel/App.tsx`](file:///d:/vibe-coding-2026/dataIndexChrome/src/sidepanel/App.tsx) | 侧边栏主工作台 UI | 项目管理、多选主题流、分类胶囊过滤、批量下载看板、快速便签 |
| [`src/content/index.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/content/index.ts) | 页面 Content Script | 划词浮标、聊天适配器挂载、页面文件检测与消息通信 |
| [`src/content/screenshotCropper.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/content/screenshotCropper.ts) | 交互式截图遮罩 | 框选、高亮纯净原色、标注输入悬浮窗、Base64 裁切 |
| [`src/background/index.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/background/index.ts) | 后台 Service Worker | 右键菜单注册、跨域二进制文件下载调度、截图三级回退调度 |
| [`src/lib/parser/fileDetector.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/lib/parser/fileDetector.ts) | 文件嗅探与元数据提取 | `scanElementForDownloadableFiles`、`isDownloadableUrl`、`deriveFilename` |
| [`src/lib/parser/topics.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/lib/parser/topics.ts) | 多符号主题切分引擎 | `parseTopicsInput`（支持空格、中文逗号、顿号、分号等） |
| [`src/lib/storage/bridgeClient.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/lib/storage/bridgeClient.ts) | Python Bridge 通信客户端 | `checkBridgeHealth`、`saveBundleViaBridge`、`initSensorWorkspaceViaBridge` |
| [`src/lib/storage/bundleSaver.ts`](file:///d:/vibe-coding-2026/dataIndexChrome/src/lib/storage/bundleSaver.ts) | 资产打包分发器 | 调度 Bridge 写入与本地 File System Handle 降级直写 |
| [`server/dsh_bridge.py`](file:///d:/vibe-coding-2026/dataIndexChrome/server/dsh_bridge.py) | Python FastAPI 本地网关 | 免授权落盘、物理文件存入、系统环境变量同步、大目录工程发现 |
| [`tests/test_bridge.py`](file:///d:/vibe-coding-2026/dataIndexChrome/tests/test_bridge.py) | 核心自动化测试用例 | 验证目录初始化、文件落盘、多主题、URL 完备性、文件下载索引等 |

---

## 4. 关键数据结构与落盘协议标准

### 4.1 抓取资产条目结构 (`CapturedItem`)
```typescript
interface CapturedItem {
  id: string;                      // 唯一 ID (如: page-1710..., file-1710...)
  project: string;                 // 归属项目空间名称 (如: "DeepSeek-V3")
  topic: string;                   // 主题展示拼接字 (如: "Architecture+Agent")
  topics?: string[];               // 主题数组
  title: string;                   // 资产标题 / 文件名
  url: string;                     // 溯源 URL (100% 非空)
  urlType?: 'web' | 'local_file' | 'local_app' | 'local_note'; // URL 模态类型
  sourcePlatform: string;          // deepseek | claude | web_article | local_file ...
  capturedAt: string;              // ISO 8601 时间戳
  documentType: 'chat_turn' | 'article' | 'snippet' | 'media' | 'file' | 'note';
  tags: string[];                  // 结构化标签列表
  markdownContent: string;         // content.md 正文
  mediaAttachments?: MediaAttachment[]; // 实体物理附件（图片、截图、下载的文件）
}
```

### 4.2 物理磁盘目录组织标准
资产在本地磁盘的沉淀结构严格保持如下层级，便于下游 Agent 直接解析：
```text
<用户工作区根目录>/
└── dshWebSensor/
    └── <主题A>+<主题B>/
        └── 20260925_<标题摘要>_<条目ID>/
            ├── content.md         # Markdown 报告 (含来源 URL 头部与关联说明)
            ├── metadata.json      # 机器自解析元数据 (包含 url, url_type, tags)
            └── assets/            # 实体二进制资源 (可选)
                ├── screenshot.png # 截屏原图
                └── paper.pdf      # 下载的源文件
```

---

## 5. Agent 协作避坑守则 (Critical Rules for AI Agents)

1. **绝对不要在 Content Script 中调用 `element.innerText` 批量遍历**：
   - 网页上可能有数千个元素，读取 `innerText` 会引发浏览器的同步布局重排（Forced Synchronous Layout）。
   - **正确做法**：一律使用 `(element.textContent || '').trim()`。

2. **绝对不要对未分页的动态列表做全量 DOM 挂载**：
   - 在 Chrome Sidepanel 这种有限高度容器中，一次性挂载数百个 DOM 节点会造成界面线程瞬间假死。
   - **正确做法**：采用 `fileDisplayLimit` 分批（如单批 30 个）分页/窗口化渲染，配以「显示更多」按钮。

3. **Service Worker 中截屏注意 Context 隔离**：
   - Service Worker 没有活动窗口，不能依赖默认上下文。
   - **正确做法**：遵循 `src/background/index.ts` 中的三级容错回退机制。

4. **保持右键菜单的多上下文兼容性**：
   - 用户极为依赖右键快捷操作。修改右键功能时，必须保留原有的 `selection`、`image`、`page` 抓取通道，任何新增项（如 `link` 文件的下载）只能采用追加方式，切忌覆盖删除。

5. **落盘路径必须隔离在 `/dshWebSensor`**：
   - 严禁把下载或抓取的临时文件直接散落到用户的项目根目录下，必须统一存入当前激活项目的 `dshWebSensor/{activeTopics}/...`。

---

## 6. 验证与构建命令备忘

- **类型校验**: `npx tsc --noEmit`
- **前端生产构建**: `npm run build`
- **全量打包交付 (Zip)**: `npm run package` (自动输出 `DSH-Web-Data-Sensor-v1.0.0.zip`)
- **Python Bridge 自动化测试**: `python tests/test_bridge.py`
- **主题解析单测**: `node tests/test_topics_parser.js`
