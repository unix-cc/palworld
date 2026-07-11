"""palworld-panel 后端入口。

- /api/*        : REST 接口 (JWT 保护, 除 /api/auth/login)
- /*            : 托管构建后的 Vue 前端 (SPA fallback)
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .routers import auth, backups, players, server, settings, tasks
from .services import scheduler as sched

STATIC_DIR = os.getenv("STATIC_DIR", "/app/static")


@asynccontextmanager
async def lifespan(app: FastAPI):
    sched.start()
    yield


app = FastAPI(title="Palworld 管理面板", version="1.0.0", lifespan=lifespan)

# 开发时前端跑在别的端口, 生产同源可忽略
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, server, players, settings, backups, tasks):
    app.include_router(r.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---- 托管前端 (打包后存在时) ----
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        # 让 Vue Router 处理前端路由: 非文件一律返回 index.html
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
