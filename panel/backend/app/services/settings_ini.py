"""读写 PalWorldSettings.ini 的 OptionSettings 段。

格式:
[/Script/Pal.PalGameWorldSettings]
OptionSettings=(Difficulty=None,DayTimeSpeedRate=1.000000,...,ServerName="xxx")

修改后需重启游戏容器才能生效。
"""
import re
from pathlib import Path

from ..config import settings

_HEADER = "[/Script/Pal.PalGameWorldSettings]"


def _ini_path() -> Path:
    return (
        Path(settings.pal_data_dir)
        / "Pal" / "Saved" / "Config" / "LinuxServer" / "PalWorldSettings.ini"
    )


def _split_options(blob: str) -> list[str]:
    """按逗号切分, 但忽略引号内的逗号。"""
    parts, buf, in_q = [], [], False
    for ch in blob:
        if ch == '"':
            in_q = not in_q
            buf.append(ch)
        elif ch == "," and not in_q:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    if buf:
        parts.append("".join(buf))
    return parts


def read_settings() -> dict[str, str]:
    path = _ini_path()
    if not path.exists():
        raise FileNotFoundError(f"配置文件不存在(服务器需先启动一次): {path}")
    text = path.read_text("utf-8", errors="replace")
    m = re.search(r"OptionSettings=\((.*)\)", text, re.DOTALL)
    if not m:
        return {}
    result: dict[str, str] = {}
    for item in _split_options(m.group(1)):
        if "=" in item:
            k, v = item.split("=", 1)
            result[k.strip()] = v.strip()
    return result


def write_settings(updates: dict[str, str]) -> dict:
    """合并更新已有 key 的值 (值需包含引号的自行传入带引号字符串)。"""
    path = _ini_path()
    current = read_settings()
    current.update({k: str(v) for k, v in updates.items()})

    opts = ",".join(f"{k}={v}" for k, v in current.items())
    content = f"{_HEADER}\nOptionSettings=({opts})\n"
    path.write_text(content, "utf-8")
    return {"updated_keys": list(updates.keys()), "path": str(path)}
