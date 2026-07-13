"""palworld-panel 后端入口。

- /api/*        : REST 接口 (JWT 保护, 除 /api/auth/login)
- /*            : 托管 Next.js 静态导出 (out/) 的前端 (per-route .html + _next/ 资源)
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


# ---- 托管前端 (Next.js 静态导出产物存在时) ----
# Next.js `output: export` 产物结构:
#   out/_next/...            构建后的 JS/CSS 资源 (带 hash, 长期缓存)
#   out/index.html           根路由 (会 redirect 到 /dashboard)
#   out/login.html           /login
#   out/dashboard.html 等     每个路由一个 .html (非单页 SPA fallback)
#   out/404.html             兜底
if os.path.isdir(STATIC_DIR):
    _next_dir = os.path.join(STATIC_DIR, "_next")
    if os.path.isdir(_next_dir):
        app.mount("/_next", StaticFiles(directory=_next_dir), name="next-assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        # 1) 命中实体文件 (favicon、图标、_next 之外的静态资源) 直接返回
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)

        # 2) 路由 -> 对应的导出 .html (如 /dashboard -> dashboard.html)
        if full_path:
            html_candidate = os.path.join(STATIC_DIR, f"{full_path}.html")
            if os.path.isfile(html_candidate):
                return FileResponse(html_candidate)
            # 尾斜杠形式 (/dashboard/ -> dashboard/index.html)
            index_candidate = os.path.join(STATIC_DIR, full_path, "index.html")
            if os.path.isfile(index_candidate):
                return FileResponse(index_candidate)

        # 3) 根路径或未知路由: 回退到 404 页 (客户端会按需再路由)，无则根 index.html
        root_index = os.path.join(STATIC_DIR, "index.html")
        not_found = os.path.join(STATIC_DIR, "404.html")
        if not full_path and os.path.isfile(root_index):
            return FileResponse(root_index)
        return FileResponse(not_found if os.path.isfile(not_found) else root_index)
