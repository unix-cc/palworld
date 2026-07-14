"""服务器控制: 状态 / 指标 / 启停重启 / 存档 / 广播 / 日志。"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user
from ..services import host_metrics
from ..services.docker_mgr import DockerManagerError, docker_mgr
from ..services.pal_api import PalApiError, pal_api

router = APIRouter(prefix="/api/server", tags=["server"], dependencies=[Depends(get_current_user)])


class AnnounceIn(BaseModel):
    message: str


class ShutdownIn(BaseModel):
    seconds: int = 30
    message: str = "Server will shutdown."


@router.get("/status")
def status():
    """容器运行状态 (来自 docker) + 宿主机资源占用 (CPU/内存)。"""
    try:
        data = docker_mgr.status()
    except DockerManagerError as e:
        raise HTTPException(status_code=503, detail=str(e))
    data.update(host_metrics.sample())
    return data


@router.get("/overview")
async def overview():
    """聚合仪表盘数据: info + metrics (来自 REST API)。REST 不可用时降级。"""
    data: dict = {"online": True}
    try:
        data["info"] = await pal_api.info()
        data["metrics"] = await pal_api.metrics()
    except PalApiError as e:
        data["online"] = False
        data["error"] = str(e)
    return data


@router.post("/start")
def start():
    try:
        docker_mgr.start()
        return {"message": "已启动"}
    except DockerManagerError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/stop")
def stop():
    try:
        docker_mgr.stop()
        return {"message": "已停止"}
    except DockerManagerError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/restart")
def restart():
    try:
        docker_mgr.restart(timeout=40)
        return {"message": "已重启"}
    except DockerManagerError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/save")
async def save():
    try:
        return await pal_api.save()
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/announce")
async def announce(body: AnnounceIn):
    try:
        return await pal_api.announce(body.message)
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/shutdown")
async def shutdown(body: ShutdownIn):
    try:
        return await pal_api.shutdown(body.seconds, body.message)
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/logs")
def logs(tail: int = 200):
    try:
        return {"logs": docker_mgr.logs(tail=tail)}
    except DockerManagerError as e:
        raise HTTPException(status_code=503, detail=str(e))
