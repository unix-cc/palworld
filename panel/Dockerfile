# ============================================================================
# 多阶段构建: 1) 编译 Vue 前端  2) 打进 Python 后端镜像统一托管
# ============================================================================

# ---- Stage 1: 构建前端 ----
FROM node:20.20-slim AS frontend
WORKDIR /build
# 构建期代理 (可选)
ARG HTTP_PROXY
ARG HTTPS_PROXY
# npm 源 (默认淘宝镜像, 可用 --build-arg NPM_REGISTRY=... 覆盖)
ARG NPM_REGISTRY=https://registry.npmmirror.com
COPY frontend/package.json ./
RUN npm install --registry="${NPM_REGISTRY}"
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: 后端 + 静态资源 ----
FROM python:3.12-slim AS runtime
WORKDIR /app
ARG HTTP_PROXY
ARG HTTPS_PROXY
# pip 源 (默认清华, 可用 --build-arg PIP_INDEX_URL=... 覆盖)
ARG PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -i "${PIP_INDEX_URL}" -r requirements.txt

COPY backend/app ./app
# 前端产物放入静态目录, 由 FastAPI 托管
COPY --from=frontend /build/dist ./static

ENV STATIC_DIR=/app/static
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
