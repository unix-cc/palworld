"""通过挂载的 docker.sock 控制游戏服务端容器。"""
from typing import Any

import docker
from docker.errors import NotFound

from ..config import settings


class DockerManagerError(Exception):
    pass


class DockerManager:
    def __init__(self) -> None:
        self._client: docker.DockerClient | None = None

    @property
    def client(self) -> docker.DockerClient:
        if self._client is None:
            try:
                self._client = docker.from_env()
            except Exception as exc:  # noqa: BLE001
                raise DockerManagerError(f"无法连接 Docker: {exc}") from exc
        return self._client

    def _container(self):
        try:
            return self.client.containers.get(settings.pal_container_name)
        except NotFound as exc:
            raise DockerManagerError(
                f"未找到游戏容器 '{settings.pal_container_name}'"
            ) from exc

    def status(self) -> dict[str, Any]:
        """容器运行状态 (running/exited/...)。资源占用由宿主机采样单独提供。"""
        c = self._container()
        return {"name": c.name, "status": c.status, "id": c.short_id}

    def start(self) -> None:
        self._container().start()

    def stop(self, timeout: int = 30) -> None:
        self._container().stop(timeout=timeout)

    def restart(self, timeout: int = 30) -> None:
        self._container().restart(timeout=timeout)

    def logs(self, tail: int = 200) -> str:
        return self._container().logs(tail=tail).decode("utf-8", errors="replace")


docker_mgr = DockerManager()
