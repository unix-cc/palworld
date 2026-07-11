"""服务器设置: 实时 (REST) + 文件编辑 (ini)。"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user
from ..services import settings_ini
from ..services.pal_api import PalApiError, pal_api

router = APIRouter(prefix="/api/settings", tags=["settings"], dependencies=[Depends(get_current_user)])


class SettingsUpdate(BaseModel):
    updates: dict[str, str]


@router.get("/live")
async def live_settings():
    """当前生效的设置 (来自 REST API)。"""
    try:
        return await pal_api.settings()
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/ini")
def read_ini():
    """读取 PalWorldSettings.ini 的 OptionSettings。"""
    try:
        return settings_ini.read_settings()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/ini")
def update_ini(body: SettingsUpdate):
    """修改配置文件, 需重启生效。"""
    try:
        return settings_ini.write_settings(body.updates)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
