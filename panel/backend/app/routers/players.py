"""玩家管理: 列表 / 踢出 / 封禁 / 解封。"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import get_current_user
from ..services.pal_api import PalApiError, pal_api

router = APIRouter(prefix="/api/players", tags=["players"], dependencies=[Depends(get_current_user)])


class PlayerAction(BaseModel):
    userid: str
    message: str = ""


@router.get("")
async def list_players():
    try:
        return await pal_api.players()
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/kick")
async def kick(body: PlayerAction):
    try:
        return await pal_api.kick(body.userid, body.message or "You have been kicked.")
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/ban")
async def ban(body: PlayerAction):
    try:
        return await pal_api.ban(body.userid, body.message or "You have been banned.")
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/unban")
async def unban(body: PlayerAction):
    try:
        return await pal_api.unban(body.userid)
    except PalApiError as e:
        raise HTTPException(status_code=503, detail=str(e))
