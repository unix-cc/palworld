"""Palworld 官方 REST API 客户端 (v1.0.0)。

文档: https://docs.palworldgame.com/category/rest-api
鉴权: HTTP Basic Auth, 用户名固定 admin, 密码为服务端 AdminPassword。
Base: {host}:{RESTAPIPort}/v1/api/
"""
from typing import Any

import httpx

from ..config import settings


class PalApiError(Exception):
    """REST API 调用失败 (连接不上 / 认证失败 / 4xx-5xx)。"""


class PalAPI:
    def __init__(self) -> None:
        self._base = settings.pal_rest_base.rstrip("/") + "/v1/api"
        self._auth = (settings.pal_rest_username, settings.pal_admin_password)

    async def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        url = f"{self._base}/{path.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.request(method, url, auth=self._auth, **kwargs)
        except httpx.HTTPError as exc:
            raise PalApiError(f"无法连接游戏服务器 REST API: {exc}") from exc

        if resp.status_code == 401:
            raise PalApiError("REST API 认证失败, 请检查 ADMIN_PASSWORD 是否正确")
        if resp.status_code >= 400:
            raise PalApiError(f"REST API 返回 {resp.status_code}: {resp.text}")

        if resp.content and "application/json" in resp.headers.get("content-type", ""):
            return resp.json()
        return {"message": resp.text or "OK"}

    async def info(self) -> dict:
        return await self._request("GET", "info")

    async def metrics(self) -> dict:
        return await self._request("GET", "metrics")

    async def players(self) -> dict:
        return await self._request("GET", "players")

    async def settings(self) -> dict:
        return await self._request("GET", "settings")

    async def announce(self, message: str) -> dict:
        return await self._request("POST", "announce", json={"message": message})

    async def kick(self, userid: str, message: str = "You have been kicked.") -> dict:
        return await self._request("POST", "kick", json={"userid": userid, "message": message})

    async def ban(self, userid: str, message: str = "You have been banned.") -> dict:
        return await self._request("POST", "ban", json={"userid": userid, "message": message})

    async def unban(self, userid: str) -> dict:
        return await self._request("POST", "unban", json={"userid": userid})

    async def save(self) -> dict:
        return await self._request("POST", "save")

    async def shutdown(self, seconds: int = 30, message: str = "Server will shutdown.") -> dict:
        return await self._request(
            "POST", "shutdown", json={"waittime": seconds, "message": message}
        )

    async def stop(self) -> dict:
        return await self._request("POST", "stop")


pal_api = PalAPI()
