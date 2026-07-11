"""存档备份 / 恢复。打包 <data>/Saved 为 tar.gz 放入备份目录。"""
import os
import shutil
import tarfile
from datetime import datetime
from pathlib import Path

from ..config import settings


class BackupError(Exception):
    pass


def _saved_dir() -> Path:
    # thijsvanloef 镜像存档位于 /palworld/Pal/Saved -> 宿主机 ./data/palworld/Pal/Saved
    return Path(settings.pal_data_dir) / "Pal" / "Saved"


def _backup_dir() -> Path:
    d = Path(settings.pal_backup_dir)
    d.mkdir(parents=True, exist_ok=True)
    return d


def list_backups() -> list[dict]:
    out = []
    for f in sorted(_backup_dir().glob("*.tar.gz"), reverse=True):
        st = f.stat()
        out.append(
            {
                "name": f.name,
                "size_mb": round(st.st_size / 1024 / 1024, 2),
                "created": datetime.fromtimestamp(st.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
    return out


def create_backup() -> dict:
    saved = _saved_dir()
    if not saved.exists():
        raise BackupError(f"存档目录不存在: {saved}")
    ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    name = f"backup_{ts}.tar.gz"
    target = _backup_dir() / name
    with tarfile.open(target, "w:gz") as tar:
        tar.add(saved, arcname="Saved")
    st = target.stat()
    return {"name": name, "size_mb": round(st.st_size / 1024 / 1024, 2)}


def restore_backup(name: str) -> dict:
    # 防目录穿越
    if "/" in name or "\\" in name or ".." in name:
        raise BackupError("非法的备份文件名")
    src = _backup_dir() / name
    if not src.exists():
        raise BackupError(f"备份文件不存在: {name}")

    saved = _saved_dir()
    saved.parent.mkdir(parents=True, exist_ok=True)
    # 先把当前存档移到 .bak, 失败可回滚
    rollback = None
    if saved.exists():
        rollback = saved.with_suffix(".restore_bak")
        if rollback.exists():
            shutil.rmtree(rollback)
        saved.rename(rollback)
    try:
        with tarfile.open(src, "r:gz") as tar:
            tar.extractall(saved.parent, filter="data")
        if rollback and rollback.exists():
            shutil.rmtree(rollback)
    except Exception as exc:  # noqa: BLE001
        if rollback and rollback.exists():
            if saved.exists():
                shutil.rmtree(saved)
            rollback.rename(saved)
        raise BackupError(f"恢复失败, 已回滚: {exc}") from exc
    return {"restored": name}


def delete_backup(name: str) -> None:
    if "/" in name or "\\" in name or ".." in name:
        raise BackupError("非法的备份文件名")
    f = _backup_dir() / name
    if f.exists():
        os.remove(f)
