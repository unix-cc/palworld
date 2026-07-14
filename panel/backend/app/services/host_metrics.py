"""宿主机资源采样 (CPU / 内存)。

面板容器未做 /proc 虚拟化, psutil 读到的 /proc/stat、/proc/meminfo 即宿主机数据。
psutil 的 cpu_percent 已按总核心数归一到 0-100, 不会像 docker stats 那样超过 100%。
"""
from typing import Any

import psutil

# 预热: cpu_percent(interval=None) 首次调用需要一个基准, 否则返回 0.0。
# 这里先取一次基准, 之后每次调用返回距上次的平均占用 (轮询间隔即采样窗口)。
psutil.cpu_percent(interval=None)


def sample() -> dict[str, Any]:
    """单次采样宿主机 CPU% 与内存占用 (供 /api/server/status 使用)。"""
    vm = psutil.virtual_memory()
    return {
        "cpu_percent": round(psutil.cpu_percent(interval=None), 2),
        "mem_used_mb": round((vm.total - vm.available) / 1024 / 1024, 1),
        "mem_limit_mb": round(vm.total / 1024 / 1024, 1),
        "mem_percent": round(vm.percent, 2),
    }
