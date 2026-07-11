"""计划任务: 替代原项目的 cron。支持定时重启 / 定时备份。

任务持久化到 <backup_dir>/../panel_jobs.json, 面板重启后自动恢复。
"""
import json
from pathlib import Path
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from ..config import settings
from . import backup as backup_svc
from .docker_mgr import docker_mgr
from .pal_api import pal_api

scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")

_STORE = Path(settings.pal_data_dir).parent / "panel_jobs.json"


# ---------------- 任务动作 ----------------
async def _job_restart() -> None:
    try:
        await pal_api.save()
        await pal_api.announce("[Panel] Scheduled restart in 30s")
    except Exception:  # noqa: BLE001
        pass
    docker_mgr.restart(timeout=40)


async def _job_backup() -> None:
    try:
        await pal_api.save()
    except Exception:  # noqa: BLE001
        pass
    backup_svc.create_backup()


ACTIONS = {"restart": _job_restart, "backup": _job_backup}


# ---------------- 持久化 ----------------
def _load() -> list[dict]:
    if _STORE.exists():
        try:
            return json.loads(_STORE.read_text("utf-8"))
        except Exception:  # noqa: BLE001
            return []
    return []


def _save(jobs: list[dict]) -> None:
    _STORE.parent.mkdir(parents=True, exist_ok=True)
    _STORE.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), "utf-8")


# ---------------- 对外 API ----------------
def list_jobs() -> list[dict[str, Any]]:
    out = []
    for j in scheduler.get_jobs():
        out.append(
            {
                "id": j.id,
                "action": j.kwargs.get("action") if j.kwargs else None,
                "cron": str(j.trigger),
                "next_run": j.next_run_time.strftime("%Y-%m-%d %H:%M:%S")
                if j.next_run_time
                else None,
            }
        )
    return out


async def _dispatch(action: str) -> None:
    fn = ACTIONS.get(action)
    if fn:
        await fn()


def add_job(job_id: str, action: str, cron: str, persist: bool = True) -> None:
    if action not in ACTIONS:
        raise ValueError(f"未知任务类型: {action}")
    trigger = CronTrigger.from_crontab(cron, timezone="Asia/Shanghai")
    scheduler.add_job(
        _dispatch, trigger, id=job_id, replace_existing=True,
        kwargs={"action": action},
    )
    if persist:
        jobs = [j for j in _load() if j["id"] != job_id]
        jobs.append({"id": job_id, "action": action, "cron": cron})
        _save(jobs)


def remove_job(job_id: str) -> None:
    try:
        scheduler.remove_job(job_id)
    except Exception:  # noqa: BLE001
        pass
    _save([j for j in _load() if j["id"] != job_id])


def start() -> None:
    if not scheduler.running:
        scheduler.start()
    for j in _load():
        try:
            add_job(j["id"], j["action"], j["cron"], persist=False)
        except Exception:  # noqa: BLE001
            continue
