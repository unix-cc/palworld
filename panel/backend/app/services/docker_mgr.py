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
        """容器状态 + CPU/内存 占用 (单次采样)。"""
        c = self._container()
        info: dict[str, Any] = {"name": c.name, "status": c.status, "id": c.short_id}
        if c.status == "running":
            try:
                stats = c.stats(stream=False)
                info.update(_parse_stats(stats))
            except Exception:  # noqa: BLE001
                pass
        return info

    def start(self) -> None:
        self._container().start()

    def stop(self, timeout: int = 30) -> None:
        self._container().stop(timeout=timeout)

    def restart(self, timeout: int = 30) -> None:
        self._container().restart(timeout=timeout)

    def logs(self, tail: int = 200) -> str:
        return self._container().logs(tail=tail).decode("utf-8", errors="replace")


def _parse_stats(stats: dict) -> dict[str, Any]:
    """从 docker stats 原始数据算出 CPU% 与内存占用。"""
    out: dict[str, Any] = {}
    try:
        cpu = stats["cpu_stats"]
        pre = stats["precpu_stats"]
        cpu_delta = cpu["cpu_usage"]["total_usage"] - pre["cpu_usage"]["total_usage"]
        sys_delta = cpu["system_cpu_usage"] - pre["system_cpu_usage"]
        ncpu = cpu.get("online_cpus") or len(
            cpu["cpu_usage"].get("percpu_usage") or [1]
        )
        if sys_delta > 0 and cpu_delta > 0:
            out["cpu_percent"] = round(cpu_delta / sys_delta * ncpu * 100, 2)
    except (KeyError, TypeError):
        out["cpu_percent"] = None

    try:
        mem = stats["memory_stats"]
        used = mem["usage"] - mem.get("stats", {}).get("cache", 0)
        limit = mem["limit"]
        out["mem_used_mb"] = round(used / 1024 / 1024, 1)
        out["mem_limit_mb"] = round(limit / 1024 / 1024, 1)
        out["mem_percent"] = round(used / limit * 100, 2) if limit else None
    except (KeyError, TypeError):
        out["mem_used_mb"] = None

    return out


docker_mgr = DockerManager()
