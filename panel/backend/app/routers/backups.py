"""存档备份管理。"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user
from ..services import backup as svc
from ..services.pal_api import PalApiError, pal_api

router = APIRouter(prefix="/api/backups", tags=["backups"], dependencies=[Depends(get_current_user)])


class BackupName(BaseModel):
    name: str


@router.get("")
def list_backups():
    return svc.list_backups()


@router.post("")
async def create_backup():
    # 备份前先存档, 保证数据最新
    try:
        await pal_api.save()
    except PalApiError:
        pass
    try:
        return svc.create_backup()
    except svc.BackupError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/restore")
def restore(body: BackupName):
    try:
        return svc.restore_backup(body.name)
    except svc.BackupError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{name}")
def delete(name: str):
    try:
        svc.delete_backup(name)
        return {"message": "已删除"}
    except svc.BackupError as e:
        raise HTTPException(status_code=400, detail=str(e))
