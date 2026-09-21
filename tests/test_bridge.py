import sys
import tempfile
import base64
import json
from pathlib import Path

# 将工程根目录添加到 sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from server.dsh_bridge import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["dsh_agent_ready"] is True

def test_save_bundle_to_dsh_web_sensor_subdir():
    with tempfile.TemporaryDirectory() as tmpdir:
        fake_png_base64 = "data:image/png;base64," + base64.b64encode(b"fake image bytes").decode()

        payload = {
            "workspace_path": tmpdir,
            "item": {
                "id": "item-test-1001",
                "project": "AI-Research",
                "topic": "Harness-Architecture",
                "title": "DeepSeek Harness 架构全景测试",
                "url": "https://example.com/test-article",
                "sourcePlatform": "deepseek",
                "capturedAt": "2026-09-20T19:30:00+08:00",
                "documentType": "chat_turn",
                "tags": ["Agent", "Architecture", "DeepSeek"],
                "aiSummary": "本文测试了 Harness 架构的数据摄取与落盘流程。",
                "userNotes": "关键测试条目",
                "markdownContent": "### ❓ Prompt\n\n如何设计 DSH 架构？\n\n### 💡 回答\n\n采用双轨落盘与全模态感知...",
                "aiMetadata": {
                    "modelName": "DeepSeek-V3",
                    "hasThinkingChain": True
                },
                "mediaAttachments": [
                    {
                        "id": "att-01",
                        "type": "image",
                        "originalUrl": "https://example.com/arch.png",
                        "filename": "arch.png",
                        "localPath": "assets/arch.png",
                        "blobDataUrl": fake_png_base64
                    }
                ]
            }
        }

        response = client.post("/api/save_bundle", json=payload)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["success"] is True

        saved_path = Path(res_data["saved_path"])
        assert saved_path.exists()
        # 验证必须位于 /dshWebSensor 子目录中
        assert "dshWebSensor" in res_data["relative_path"]
        assert (Path(tmpdir) / "dshWebSensor").exists()

        assert (saved_path / "content.md").exists()
        assert (saved_path / "metadata.json").exists()
        assert (saved_path / "assets" / "arch.png").exists()

        # 验证 content.md
        content = (saved_path / "content.md").read_text(encoding="utf-8")
        assert "如何设计 DSH 架构？" in content

        # 验证 assets
        img_bytes = (saved_path / "assets" / "arch.png").read_bytes()
        assert img_bytes == b"fake image bytes"

        # 验证工作空间埋点记录
        ws_telemetry = Path(tmpdir) / "dshWebSensor" / ".telemetry" / "events.jsonl"
        assert ws_telemetry.exists()

        print(f"\n[Test Pass] 成功在 /dshWebSensor 子目录下生成结构化资产包: {saved_path}")

def test_save_screenshot_bundle_with_annotations():
    with tempfile.TemporaryDirectory() as tmpdir:
        fake_png_base64 = "data:image/png;base64," + base64.b64encode(b"fake screenshot png").decode()

        payload = {
            "workspace_path": tmpdir,
            "item": {
                "id": "snap-test-2001",
                "project": "UI-Research",
                "topic": "Screenshots",
                "title": "[截图快照] 竞品后台架构图",
                "url": "https://example.com/dashboard",
                "sourcePlatform": "web_article",
                "capturedAt": "2026-09-20T21:05:00+08:00",
                "documentType": "screenshot",
                "tags": ["Screenshot", "VisualSnapshot", "Multimodal"],
                "userNotes": "重点关注顶部指标卡与数据流向图",
                "markdownContent": "# 📸 网页截图快照\n\n![截图](assets/screenshot_2001.png)\n\n> 🤖 **Agent 视觉感知指令**: 请调用多模态模型解析图表。",
                "screenshotMetadata": {
                    "isScreenshot": True,
                    "cropArea": {
                        "x": 100,
                        "y": 150,
                        "width": 800,
                        "height": 450,
                        "devicePixelRatio": 1.25
                    },
                    "viewport": { "width": 1920, "height": 1080 },
                    "pageTitle": "竞品后台架构图",
                    "pageUrl": "https://example.com/dashboard",
                    "visualAnnotation": "重点关注顶部指标卡与数据流向图",
                    "agentInstruction": "【DSH 智能体提示】本线索为多模态网页图像截图快照，附件位于 assets/ 目录。请下游智能体使用视觉模型分析图中信息。"
                },
                "mediaAttachments": [
                    {
                        "id": "att-snap-01",
                        "type": "image",
                        "originalUrl": "https://example.com/dashboard",
                        "filename": "screenshot_2001.png",
                        "localPath": "assets/screenshot_2001.png",
                        "blobDataUrl": fake_png_base64
                    }
                ]
            }
        }

        response = client.post("/api/save_bundle", json=payload)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["success"] is True

        saved_path = Path(res_data["saved_path"])
        assert "dshWebSensor" in str(saved_path)
        assert (saved_path / "metadata.json").exists()
        assert (saved_path / "content.md").exists()
        assert (saved_path / "assets" / "screenshot_2001.png").exists()

        # 检查元数据结构化标注与 Agent 指令
        meta = json.loads((saved_path / "metadata.json").read_text(encoding="utf-8"))
        assert meta["is_screenshot"] is True
        assert meta["screenshot_metadata"] is not None
        assert meta["screenshot_metadata"]["isScreenshot"] is True
        assert "DSH 智能体提示" in meta["screenshot_metadata"]["agentInstruction"]
        assert meta["screenshot_metadata"]["visualAnnotation"] == "重点关注顶部指标卡与数据流向图"

        print(f"[Test Pass] 成功验证保存至 /dshWebSensor 的带数据标注截图快照: {saved_path}")

def test_telemetry_and_insights():
    with tempfile.TemporaryDirectory() as tmpdir:
        # 上报两批埋点事件
        events_payload = {
            "workspace_path": tmpdir,
            "events": [
                {
                    "eventId": "evt-t1",
                    "eventType": "switch_project",
                    "timestamp": "2026-09-20T21:10:00",
                    "projectId": "p1",
                    "projectName": "Agent-Research",
                    "metadata": {"workspacePath": f"{tmpdir}/Agent-Research"}
                },
                {
                    "eventId": "evt-t2",
                    "eventType": "switch_topic",
                    "timestamp": "2026-09-20T21:12:00",
                    "projectId": "p1",
                    "topic": "Papers",
                    "url": "https://arxiv.org/abs/2401.0001",
                    "domain": "arxiv.org"
                }
            ]
        }
        res = client.post("/api/telemetry/events", json=events_payload)
        assert res.status_code == 200
        assert res.json()["count"] == 2

        # 验证工作区事件持久化
        ws_events = Path(tmpdir) / "dshWebSensor" / ".telemetry" / "events.jsonl"
        assert ws_events.exists()
        lines = ws_events.read_text(encoding="utf-8").strip().splitlines()
        assert len(lines) == 2

        # 验证行为洞察与智能推荐端点
        insights_res = client.get("/api/telemetry/insights?domain=arxiv.org")
        assert insights_res.status_code == 200
        insights = insights_res.json()
        assert "suggestedTopicsForCurrentDomain" in insights
        assert "Papers" in insights["suggestedTopicsForCurrentDomain"]

        print("[Test Pass] 成功验证行为埋点持久化与智能主题推荐分析")

def test_discover_projects_in_parent():
    with tempfile.TemporaryDirectory() as tmpdir:
        parent_dir = Path(tmpdir)
        # 创建子工程 1 (含 dshWebSensor)
        p1 = parent_dir / "ProjectAlpha"
        (p1 / "dshWebSensor").mkdir(parents=True)
        # 创建子工程 2 (普通工程)
        p2 = parent_dir / "ProjectBeta"
        p2.mkdir(parents=True)

        res = client.post("/api/projects/discover", json={"parent_dir": str(parent_dir)})
        assert res.status_code == 200
        data = res.json()
        projects = data["projects"]
        assert len(projects) == 2
        # ProjectAlpha 包含 dshWebSensor 应排在前面
        assert projects[0]["name"] == "ProjectAlpha"
        assert projects[0]["hasDshSensor"] is True
        assert projects[1]["name"] == "ProjectBeta"
        assert projects[1]["hasDshSensor"] is False

        print("[Test Pass] 成功验证大目录下子工程与 dshWebSensor 自动扫描探测")

def test_save_bundle_with_multi_topics():
    with tempfile.TemporaryDirectory() as tmpdir:
        payload = {
            "workspace_path": tmpdir,
            "item": {
                "id": "item-multi-99",
                "project": "AI-Research",
                "topic": "Architecture+Agent",
                "topics": ["Architecture", "Agent", "DeepSeek"],
                "title": "多主题测试条目",
                "url": "https://example.com/multi",
                "sourcePlatform": "web_article",
                "capturedAt": "2026-09-20T22:20:00+08:00",
                "documentType": "article",
                "tags": ["Architecture", "Agent", "DeepSeek"],
                "markdownContent": "# 多主题线索\n\n测试多选主题落盘及 metadata 关联",
                "mediaAttachments": []
            }
        }
        res = client.post("/api/save_bundle", json=payload)
        assert res.status_code == 200
        data = res.json()
        saved_path = Path(data["saved_path"])
        meta = json.loads((saved_path / "metadata.json").read_text(encoding="utf-8"))
        assert meta["topics"] == ["Architecture", "Agent", "DeepSeek"]
        assert "Architecture" in meta["tags"]
        print(f"[Test Pass] 成功验证多主题线索落盘与 metadata.json 结构: {saved_path}")

def test_init_sensor_workspace():
    with tempfile.TemporaryDirectory() as tmpdir:
        ws_path = Path(tmpdir) / "DeepSeekProject"
        payload = {
            "workspace_path": str(ws_path),
            "project_name": "DeepSeekProject"
        }
        res = client.post("/api/workspace/init_sensor", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        sensor_path = Path(data["sensor_path"])
        assert sensor_path.exists()
        assert sensor_path.name == "dshWebSensor"
        assert (sensor_path / ".sensor_ready").exists()
        ready_data = json.loads((sensor_path / ".sensor_ready").read_text(encoding="utf-8"))
        assert ready_data["project_name"] == "DeepSeekProject"
        print(f"[Test Pass] 成功验证 /api/workspace/init_sensor 自动建立 dshWebSensor 子目录: {sensor_path}")

def test_captured_item_url_guarantee_and_types():
    with tempfile.TemporaryDirectory() as tmpdir:
        test_cases = [
            {
                "id": "url-test-web",
                "title": "公网 DeepSeek 测试",
                "url": "https://chat.deepseek.com/c/123",
                "expected_type": "web",
                "expected_url": "https://chat.deepseek.com/c/123"
            },
            {
                "id": "url-test-local-file",
                "title": "本地文献 PDF 测试",
                "url": "file:///D:/research/survey.pdf",
                "expected_type": "local_file",
                "expected_url": "file:///D:/research/survey.pdf"
            },
            {
                "id": "url-test-local-app",
                "title": "本地服务端口测试",
                "url": "http://localhost:3000/dashboard",
                "expected_type": "local_app",
                "expected_url": "http://localhost:3000/dashboard"
            },
            {
                "id": "url-test-empty-fallback",
                "title": "无 URL 自动兜底测试",
                "url": "",
                "expected_type": "local_note",
                "expected_url": "local://dsh/capture/url-test-empty-fallback"
            },
            {
                "id": "url-test-note",
                "title": "侧边栏快速便签测试",
                "url": "local://dsh/quick-note?id=note-456",
                "expected_type": "local_note",
                "expected_url": "local://dsh/quick-note?id=note-456"
            }
        ]

        for tc in test_cases:
            payload = {
                "workspace_path": tmpdir,
                "item": {
                    "id": tc["id"],
                    "project": "URL-Test-Project",
                    "topic": "URL-Verification",
                    "title": tc["title"],
                    "url": tc["url"],
                    "sourcePlatform": "web_article",
                    "capturedAt": "2026-09-21T12:00:00+08:00",
                    "documentType": "article",
                    "tags": ["URLTest"],
                    "markdownContent": f"# {tc['title']}\n\n> 来源: [{tc['expected_url']}]({tc['expected_url']})"
                }
            }

            res = client.post("/api/save_bundle", json=payload)
            assert res.status_code == 200, f"Failed for {tc['id']}: {res.text}"
            res_data = res.json()
            assert res_data["success"] is True

            saved_path = Path(res_data["saved_path"])
            meta = json.loads((saved_path / "metadata.json").read_text(encoding="utf-8"))

            assert meta["url"] == tc["expected_url"], f"URL mismatch for {tc['id']}: {meta['url']} vs {tc['expected_url']}"
            assert meta["url_type"] == tc["expected_type"], f"url_type mismatch for {tc['id']}: {meta['url_type']} vs {tc['expected_type']}"
            assert len(meta["url"].strip()) > 0, f"URL must not be empty for {tc['id']}"

        print("[Test Pass] 成功验证公网 URL、本地文件 file:///、localhost 以及兜底 URL 100% 具备有效 URL 与正确的 url_type！")

if __name__ == "__main__":
    test_health_check()
    test_init_sensor_workspace()
    test_save_bundle_to_dsh_web_sensor_subdir()
    test_save_screenshot_bundle_with_annotations()
    test_telemetry_and_insights()
    test_discover_projects_in_parent()
    test_save_bundle_with_multi_topics()
    test_captured_item_url_guarantee_and_types()
    print("\n🎉 所有后端与 Bridge 测试 100% 成功通过！")
