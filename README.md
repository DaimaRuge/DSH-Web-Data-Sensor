# DSH Web Sensor - 多模态数据采集与预处理插件

**DSH (DeepSeek Harness)** 个人文献与知识智能体的浏览器端多模态数据感知、采集与结构化预处理扩展（适用于 Chrome、Edge、Brave 及其他 Chromium 内核浏览器）。

---

## 🌟 核心特性

1. **双轨落盘机制 (Dual-Track Storage)**：
   - **轨 A (浏览器原生)**：基于 Chrome File System Access API，在侧栏点击「授权目录」即可选取本地任意磁盘文件夹直接写入，无需启动后台服务，开箱即用。
   - **轨 B (本地网关直连)**：运行配套的 Python FastAPI 伴侣网关（`server/dsh_bridge.py`），突破浏览器沙箱限制，直接按绝对物理路径落盘，并无缝对接 DSH 本地智能体。

2. **Chrome Side Panel 调研工作台**：
   - 支持多项目管理（每个项目可绑定独立的本地磁盘工作空间）。
   - 主题标签（Topic）快速切换与新建。
   - 网页正文一键提取净化（基于 Readability + Turndown，自动本地化保存静态图片至 `assets/`）。
   - 快速调研备忘便签即时落盘。

3. **跨主流大模型 AI Chat 高保真适配矩阵**：
   - **DeepSeek Chat** (`chat.deepseek.com`)：在每条回复旁自动注入「存入 DSH」按钮，完整保留 `<details>` 深度思考链、代码高亮、数学公式与提问提示词。
   - **Claude AI** (`claude.ai`)：保真提取 Extended Thinking 思考流、Artifacts 与对话轮次。
   - **ChatGPT** (`chatgpt.com`)：适配 GPT-4o / o1 / o3 思考链、代码高亮与公式。
   - **Gemini / 豆包 / Grok**：全支持单轮 Q&A 提取与整场会话系统性归档。

4. **多模态音视频时间轴锚点**：
   - 在 Bilibili、YouTube 等视频页面，一键提取视频封面、播放时间戳（如 `04:25`）、直达跳转锚点链接与备忘笔记，为后续 DSH 智能体自动转录（Whisper）与关键帧抽取打下基础。

5. **DeepSeek API 智能预处理**：
   - 配置 DeepSeek API Key 后，抓取时自动生成 2 句中文核心结论，并自动提取 3~5 个高相关领域标签。

6. **网页快照与交互式区域截图 (带 Agent 视觉数据标注)**：
   - 侧边栏点击「区域截图快照」或网页右键即可呼出遮罩，支持自由拖拽框选裁剪目标局部区域；
   - 包含实时裁剪分辨率预览与说明输入框；
   - 自动生成面向 Agent 的结构化标注 (`is_screenshot: true`、截取坐标、视口信息与 Vision LLM 解析提示指令)，保存为独立的资产包（`content.md` + `metadata.json` + `assets/screenshot_xxx.png`）。

---

## 📁 本地资产包落盘结构规范

每个采集的线索或文档均生成如下标准化的独立资产包：
```text
{Your_Project_Workspace}/
  └── {Topic_Name}/
      └── {YYYYMMDD}_{Slug}_{Id}/
          ├── content.md         # 净化的 Markdown 正文或 AI 对话记录
          ├── metadata.json       # 完备规范的元数据描述
          └── assets/             # 关联的多模态本地文件 (图片/文档)
              ├── img_01_a9f2.png
              └── ...
```

---

## 🚀 安装与使用指南

### 第一步：加载到 Chrome / Edge / Brave / Arc 浏览器

#### 方式 A：直接使用发布包（免 Node.js 环境）
1. 解压 `DSH-Web-Data-Sensor-v1.0.0.zip` 到任意固定目录（如 `D:\Tools\DSH-Web-Data-Sensor`）。
2. 打开 Chromium 内核浏览器：
   - **Chrome**: 地址栏访问 `chrome://extensions`
   - **Edge**: 地址栏访问 `edge://extensions`
   - **Brave**: 地址栏访问 `brave://extensions`
3. 开启右上角或左下角的 **「开发者模式 (Developer mode)」** 开关。
4. 点击 **「加载已解压的扩展程序 (Load unpacked)」** 按钮。
5. 选择解压出的目录（包含 `manifest.json` 的文件夹），点击确定即可！
6. 看到 `DSH Web Sensor` 出现，建议在扩展栏点击固定（Pin）。

#### 方式 B：从源码编译构建加载
1. 运行 `pnpm install` 安装依赖。
2. 运行 `pnpm run build`（或 `pnpm run package` 生成 zip）。
3. 在浏览器扩展管理页点击 **「加载已解压的扩展程序」**，选择项目的 `dist` 目录。

---

### 第二步：开启使用与工作空间设置

1. 点击浏览器右上角扩展图标，右侧将自动展开 **DSH 调研工作台 (Side Panel)**。
2. **免授权全自动落盘 (推荐)**：
   - **一键运行**：在扩展侧边栏点击 **`[🚀 一键运行 Bridge (开启免授权直写)]`**；
   - 或双击根目录的 `start_bridge.bat`（亦可运行 `install_bridge_service.bat` 注册一键启动协议）；
   - 服务启动后，数据自动写入项目工作区内的 `/dshWebSensor` 子文件夹，完全免弹窗授权。
3. **纯浏览器沙箱模式 (免启动服务)**：
   - 在工作台点击 **「授权目录」**，直接选取本地想要作为知识库的文件夹即可。
4. **配置 DeepSeek 智能打标 (可选)**：
   - 点击工作台右上角 ⚙️ 图标进入配置中心，填写 `DeepSeek API Key`（支持一键从本地环境变量同步）。

---

### 第三步：多模态数据采集体验

- **网页划词**：在任意网页上划选关键句子，鼠标上方自动弹出 `[存入 DSH]` 黑色悬浮胶囊，点击即可秒级记录为摘录卡片。
- **网页正文**：在调研文章或论文页面，在侧栏点击 `[抓取网页正文]`，系统自动剔除广告干扰、转换 Markdown 并将图片下载至本地 `assets/`。
- **大模型对话**：在 DeepSeek、Claude 或 ChatGPT 聊天页面，AI 回复框上方会自动出现绿色 `[存入 DSH]` 按钮，点击即可将该轮「Prompt + 思考链 + 回答」完整落盘；侧栏亦可点击 `[归档 AI 会话]` 一键抓取整篇对话。
- **音视频线索**：在 B站 或 YouTube 视频页面，侧栏点击 `[提取音视频时间轴锚点]` 记录当下精彩时刻。

---

## 🛠️ 二次开发与重新构建

```bash
# 1. 安装依赖
pnpm install

# 2. 生成图标（如需）
python scripts/generate_icons.py

# 3. 构建 Chrome MV3 生产包 (输出至 dist/)
pnpm run build

# 4. 运行自动化测试验证
python tests/test_bridge.py
```
