"""计划任务管理 (定时重启 / 定时备份)。"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user
from ..services import scheduler as sched

router = APIRouter(prefix="/api/tasks", tags=["tasks"], dependencies=[Depends(get_current_user)])


class TaskIn(BaseModel):
    action: str  # restart | backup
    cron: str    # 标准 5 段 crontab, 如 "0 5 * * *"


@router.get("")
def list_tasks():
    return sched.list_jobs()


@router.post("")
def add_task(body: TaskIn):
    try:
        job_id = f"{body.action}-{uuid.uuid4().hex[:8]}"
        sched.add_job(job_id, body.action, body.cron)
        return {"id": job_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{job_id}")
def remove_task(job_id: str):
    sched.remove_job(job_id)
    return {"message": "已删除"}
