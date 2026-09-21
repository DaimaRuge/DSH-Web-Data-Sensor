"""
DSH (DeepSeek Harness) Local Companion Bridge
本地伴侣网关服务：突破浏览器沙箱限制，接收 Chrome 扩展传递的数据包，直接写入任意本地磁盘目录。
支持 /dshWebSensor 子目录自动切换、行为埋点采集落盘、智能大目录与主题洞察。
"""

import os
import re
import json
import base64
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from collections import Counter

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="DSH Companion Bridge",
    description="Local bridge for DSH Chrome Web Sensor to save knowledge bundles and telemetry to local disk",
    version="1.1.0"
)

# 允许来自任何 Chrome 扩展（chrome-extension://*）或本地前端的跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^chrome-extension://.*|http://localhost:.*|http://127.0.0.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GLOBAL_TELEMETRY_DIR = Path.home() / ".dsh" / "telemetry"
GLOBAL_TELEMETRY_FILE = GLOBAL_TELEMETRY_DIR / "events.jsonl"

class MediaAttachmentModel(BaseModel):
    id: str
    type: str
    originalUrl: str
    filename: str
    localPath: str
    blobDataUrl: Optional[str] = None
    sha256: Optional[str] = None

def resolve_url_type(url: Optional[str]) -> str:
    if not url:
        return "local_note"
    u = url.strip()
    if u.startswith("file://") or re.match(r"^[a-zA-Z]:[\\/]", u):
        return "local_file"
    if u.startswith("http://localhost") or u.startswith("http://127.0.0.1"):
        return "local_app"
    if u.startswith("local://") or u.startswith("dsh://"):
        return "local_note"
    if u.startswith("http://") or u.startswith("https://"):
        return "web"
    return "web"

class CapturedItemModel(BaseModel):
    id: str
    project: str
    topic: str
    topics: Optional[List[str]] = None
    title: str
    url: Optional[str] = ""
    urlType: Optional[str] = None
    sourcePlatform: str
    capturedAt: str
    documentType: str
    tags: List[str]
    aiSummary: Optional[str] = None
    userNotes: Optional[str] = None
    markdownContent: str
    aiMetadata: Optional[Dict[str, Any]] = None
    screenshotMetadata: Optional[Dict[str, Any]] = None
    mediaAttachments: Optional[List[MediaAttachmentModel]] = []

class SaveBundleRequest(BaseModel):
    workspace_path: str
    item: CapturedItemModel

class TelemetryEventModel(BaseModel):
    eventId: str
    eventType: str
    timestamp: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    topic: Optional[str] = None
    url: Optional[str] = None
    domain: Optional[str] = None
    pageTitle: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TelemetryBatchRequest(BaseModel):
    events: List[TelemetryEventModel]
    workspace_path: Optional[str] = None

class DiscoverProjectsRequest(BaseModel):
    parent_dir: str

class InitSensorRequest(BaseModel):
    workspace_path: str
    project_name: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.1.0",
        "service": "dsh_companion_bridge",
        "dsh_agent_ready": True,
        "current_time": datetime.now().isoformat()
    }

@app.get("/api/system_env")
def get_system_env():
    return {
        "status": "ok",
        "deepseek_api_key": os.getenv("DEEPSEEK_API_KEY", "")
    }

@app.post("/api/workspace/init_sensor")
def init_sensor(payload: InitSensorRequest):
    """
    当用户切换项目、创建项目或首次关联时，自动在本地磁盘物理创建或验证 /dshWebSensor 子目录。
    """
    try:
        ws = Path(payload.workspace_path).expanduser().resolve()
        ws.mkdir(parents=True, exist_ok=True)
        sensor_dir = ws / "dshWebSensor"
        sensor_dir.mkdir(parents=True, exist_ok=True)

        ready_flag = sensor_dir / ".sensor_ready"
        if not ready_flag.exists():
            with open(ready_flag, "w", encoding="utf-8") as f:
                json.dump({
                    "initialized_at": datetime.now().isoformat(),
                    "project_name": payload.project_name or ws.name,
                    "version": "1.1.0"
                }, f, ensure_ascii=False, indent=2)

        return {
            "success": True,
            "workspace_path": str(ws),
            "sensor_path": str(sensor_dir),
            "message": "dshWebSensor 子目录已自动创建并就绪"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"初始化 dshWebSensor 失败: {str(e)}")

@app.post("/api/save_bundle")
def save_bundle(payload: SaveBundleRequest):
    item = payload.item
    workspace = Path(payload.workspace_path).expanduser().resolve()

    # 1. 规范化文件名与目录名
    safe_topic = re.sub(r'[\\/:*?"<>|]', '_', item.topic or 'General')
    date_str = item.capturedAt[:10].replace('-', '') if item.capturedAt else datetime.now().strftime('%Y%m%d')
    safe_title = re.sub(r'[\\/:*?"<>|\s]+', '_', item.title or 'untitled')[:30].strip('_')
    folder_name = f"{date_str}_{safe_title}_{item.id[-6:]}"

    # 自动切换至项目工作空间中的 /dshWebSensor 子目录
    sensor_root = workspace / "dshWebSensor"
    target_dir = sensor_root / safe_topic / folder_name
    assets_dir = target_dir / "assets"

    try:
        target_dir.mkdir(parents=True, exist_ok=True)
        if item.mediaAttachments:
            assets_dir.mkdir(parents=True, exist_ok=True)

        # 2. 写入 content.md
        md_file = target_dir / "content.md"
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(item.markdownContent)

        # 强制确保 URL 存在且非空，并解析 url_type
        raw_url = (item.url or "").strip()
        if not raw_url:
            raw_url = f"local://dsh/capture/{item.id}"
        url_type = item.urlType or resolve_url_type(raw_url)

        # 3. 写入 metadata.json
        meta_dict = {
            "id": item.id,
            "project": item.project,
            "topic": item.topic,
            "topics": item.topics or [item.topic],
            "title": item.title,
            "url": raw_url,
            "url_type": url_type,
            "source_platform": item.sourcePlatform,
            "captured_at": item.capturedAt,
            "document_type": item.documentType,
            "tags": item.tags,
            "ai_summary": item.aiSummary or "",
            "user_notes": item.userNotes or "",
            "ai_metadata": item.aiMetadata or {},
            "is_screenshot": item.documentType == "screenshot",
            "screenshot_metadata": item.screenshotMetadata or None,
            "media_attachments": [
                {
                    "id": m.id,
                    "type": m.type,
                    "original_url": m.originalUrl,
                    "filename": m.filename,
                    "local_path": m.localPath,
                }
                for m in (item.mediaAttachments or [])
            ]
        }
        meta_file = target_dir / "metadata.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta_dict, f, ensure_ascii=False, indent=2)

        # 4. 写入本地多模态资源
        for m in (item.mediaAttachments or []):
            if m.blobDataUrl and "," in m.blobDataUrl:
                try:
                    header, b64_data = m.blobDataUrl.split(",", 1)
                    file_bytes = base64.b64decode(b64_data)
                    asset_file = assets_dir / m.filename
                    with open(asset_file, "wb") as af:
                        af.write(file_bytes)
                except Exception as ex:
                    print(f"[Warn] 写入资源 {m.filename} 失败: {ex}")

        # 5. 同时向工作区写入一条采集埋点日志
        workspace_telemetry_file = sensor_root / ".telemetry" / "events.jsonl"
        try:
            workspace_telemetry_file.parent.mkdir(parents=True, exist_ok=True)
            with open(workspace_telemetry_file, "a", encoding="utf-8") as tf:
                capture_evt = {
                    "eventId": f"evt-save-{item.id}",
                    "eventType": "capture_item",
                    "timestamp": datetime.now().isoformat(),
                    "projectId": item.project,
                    "topic": item.topic,
                    "url": item.url,
                    "title": item.title,
                    "metadata": {"documentType": item.documentType, "saved_path": str(target_dir)}
                }
                tf.write(json.dumps(capture_evt, ensure_ascii=False) + "\n")
        except Exception as te:
            print(f"[Warn] 写入工作区埋点失败: {te}")

        print(f"[DSH Bridge] 成功落盘线索 -> {target_dir}")
        return {
            "success": True,
            "saved_path": str(target_dir),
            "relative_path": f"dshWebSensor/{safe_topic}/{folder_name}",
            "message": "线索资产包已成功落盘至本地项目 dshWebSensor 子目录"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"落盘发生异常: {str(e)}")

# ==================== 用户行为埋点与数据感知 API ====================

@app.post("/api/telemetry/events")
def record_telemetry_events(payload: TelemetryBatchRequest):
    """
    记录用户操作行为埋点（切换项目、切换主题、抓取内容、页面浏览等）
    双向持久化：写入用户全局 ~/.dsh/telemetry/events.jsonl 以及工作空间 .telemetry/events.jsonl
    """
    if not payload.events:
        return {"success": True, "count": 0}

    GLOBAL_TELEMETRY_DIR.mkdir(parents=True, exist_ok=True)
    with open(GLOBAL_TELEMETRY_FILE, "a", encoding="utf-8") as f:
        for evt in payload.events:
            f.write(evt.model_dump_json() + "\n")

    if payload.workspace_path:
        try:
            ws_path = Path(payload.workspace_path).expanduser().resolve()
            ws_telemetry = ws_path / "dshWebSensor" / ".telemetry" / "events.jsonl"
            ws_telemetry.parent.mkdir(parents=True, exist_ok=True)
            with open(ws_telemetry, "a", encoding="utf-8") as wf:
                for evt in payload.events:
                    wf.write(evt.model_dump_json() + "\n")
        except Exception as e:
            print(f"[Warn] 写入工作空间埋点异常: {e}")

    return {"success": True, "count": len(payload.events)}

@app.get("/api/telemetry/insights")
def get_telemetry_insights(domain: Optional[str] = Query(None)):
    """
    分析历史埋点行为，输出洞察建议：
    1. 常用大目录列表（用于自动扫描项目空间）
    2. 高频项目与主题统计
    3. 基于当前网页 Domain 的智能主题推荐
    """
    events: List[Dict[str, Any]] = []
    if GLOBAL_TELEMETRY_FILE.exists():
        try:
            with open(GLOBAL_TELEMETRY_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()[-1000:]  # 最近 1000 条
                for line in lines:
                    line = line.strip()
                    if line:
                        try:
                            events.append(json.loads(line))
                        except Exception:
                            pass
        except Exception as e:
            print(f"[Warn] 读取全局埋点失败: {e}")

    # 1. 统计常用大目录 (Parent Dirs of Workspaces)
    parent_dirs_counter = Counter()
    for evt in events:
        meta = evt.get("metadata") or {}
        ws = meta.get("workspacePath") or meta.get("workspace_path")
        if ws:
            try:
                parent = str(Path(ws).parent)
                if parent and parent != "." and parent != "/":
                    parent_dirs_counter[parent] += 1
            except Exception:
                pass

    frequent_parent_dirs = [p for p, _ in parent_dirs_counter.most_common(5)]

    # 2. 统计高频项目
    project_counter = Counter()
    project_names: Dict[str, str] = {}
    project_last_used: Dict[str, str] = {}
    for evt in events:
        pid = evt.get("projectId")
        if pid:
            project_counter[pid] += 1
            if evt.get("projectName"):
                project_names[pid] = evt["projectName"]
            project_last_used[pid] = evt.get("timestamp", "")

    frequent_projects = [
        {
            "projectId": pid,
            "projectName": project_names.get(pid, pid),
            "count": count,
            "lastUsed": project_last_used.get(pid, "")
        }
        for pid, count in project_counter.most_common(10)
    ]

    # 3. 统计高频主题
    topic_counter = Counter()
    domain_topic_counter = Counter()
    for evt in events:
        t = evt.get("topic")
        if t and t not in ("General", ""):
            topic_counter[t] += 1
            if domain and evt.get("domain") == domain:
                domain_topic_counter[t] += 1

    frequent_topics = [
        {"topic": t, "count": c}
        for t, c in topic_counter.most_common(8)
    ]

    # 4. 基于当前 Domain 或经典启发式的智能主题推荐
    suggested_topics: List[str] = []
    if domain:
        # 优先从历史该域名的主题中提取
        for t, _ in domain_topic_counter.most_common(3):
            if t not in suggested_topics:
                suggested_topics.append(t)

        # 经典规则启发式兜底
        d_lower = domain.lower()
        if any(k in d_lower for k in ["arxiv", "acm", "ieee", "sciencedirect", "semanticscholar", "nature", "cell"]):
            for st in ["Papers", "Literature", "Academic"]:
                if st not in suggested_topics:
                    suggested_topics.append(st)
        elif any(k in d_lower for k in ["github", "gitlab", "gitee", "stackoverflow", "v2ex"]):
            for st in ["Code", "Architecture", "OpenSource"]:
                if st not in suggested_topics:
                    suggested_topics.append(st)
        elif any(k in d_lower for k in ["chatgpt", "deepseek", "claude", "gemini", "doubao", "grok", "ai"]):
            for st in ["AI-Chat", "Prompts", "Agent"]:
                if st not in suggested_topics:
                    suggested_topics.append(st)
        elif any(k in d_lower for k in ["bilibili", "youtube", "b23.tv", "douyin", "tiktok"]):
            for st in ["Video", "Tutorials", "Multimedia"]:
                if st not in suggested_topics:
                    suggested_topics.append(st)
        elif any(k in d_lower for k in ["news", "36kr", "huxiu", "zhihu", "weibo", "x.com", "twitter"]):
            for st in ["IndustryTrends", "Commercial", "News"]:
                if st not in suggested_topics:
                    suggested_topics.append(st)

    if not suggested_topics:
        suggested_topics = ["General", "Research", "Notes"]

    return {
        "frequentParentDirs": frequent_parent_dirs,
        "frequentProjects": frequent_projects,
        "frequentTopics": frequent_topics,
        "suggestedTopicsForCurrentDomain": suggested_topics
    }

@app.post("/api/projects/discover")
def discover_projects_in_parent(payload: DiscoverProjectsRequest):
    """
    扫描给定的常用大目录，列出子项目，并自动探测是否已有 /dshWebSensor
    """
    p = Path(payload.parent_dir).expanduser().resolve()
    if not p.exists() or not p.is_dir():
        raise HTTPException(status_code=400, detail="指定的目录不存在或不是文件夹")

    projects = []
    try:
        for child in p.iterdir():
            if child.is_dir() and not child.name.startswith("."):
                sensor_exists = (child / "dshWebSensor").exists()
                projects.append({
                    "name": child.name,
                    "path": str(child),
                    "hasDshSensor": sensor_exists
                })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"扫描大目录失败: {str(e)}")

    # 优先将已含有 dshWebSensor 的项目排在前面
    projects.sort(key=lambda x: (not x["hasDshSensor"], x["name"].lower()))
    return {"parent_dir": str(p), "projects": projects}

if __name__ == "__main__":
    import uvicorn
    print("启动 DSH Local Companion Bridge 守护服务 (http://127.0.0.1:8765)...")
    uvicorn.run(app, host="127.0.0.1", port=8765)
