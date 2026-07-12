#!/bin/bash
# ============================================================================
# 前置脚本: 提前拉取所需 Docker 镜像 (支持镜像加速前缀)
#   国内直连 Docker Hub 常失败, 这里统一加一个镜像站前缀拉取, 再重打回原名,
#   之后的 `docker compose up -d --build` 就默认镜像已就位, 无需再改 compose。
#
# 用法:
#   ./prepare-images.sh                     # 用 .env 里的 REGISTRY_MIRROR
#   ./prepare-images.sh docker.m.daocloud.io   # 临时指定镜像站前缀
#   REGISTRY_MIRROR=xxx ./prepare-images.sh    # 环境变量指定
# ============================================================================
set -e

Green="\033[32m"; Red="\033[31m"; Yellow="\033[33m"; Font="\033[0m"

# 读取 .env 中的 REGISTRY_MIRROR (若存在)
if [ -f .env ]; then
    ENV_MIRROR=$(grep -E '^REGISTRY_MIRROR=' .env 2>/dev/null | tail -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
fi

# 优先级: 命令行参数 > 环境变量 > .env
MIRROR="${1:-${REGISTRY_MIRROR:-$ENV_MIRROR}}"
MIRROR="${MIRROR%/}"   # 去掉结尾的 /

# 需要的镜像:  "本地规范名|镜像站相对路径(官方镜像带 library/)"
IMAGES=(
    "cm2network/steamcmd:steam-bookworm|cm2network/steamcmd:steam-bookworm"
    "node:20.20-slim|node:20.20-slim"
    "python:3.12-slim|library/python:3.12-slim"
)

if [ -z "$MIRROR" ]; then
    echo -e "${Yellow}未设置 REGISTRY_MIRROR, 将直连 Docker Hub 拉取。${Font}"
    echo -e "${Yellow}如需加速, 可在 .env 设置 REGISTRY_MIRROR 或作为参数传入。${Font}"
else
    echo -e "${Green}使用镜像加速前缀: ${MIRROR}${Font}"
fi

pull_one() {
    local canonical="$1" relpath="$2"
    if docker image inspect "$canonical" >/dev/null 2>&1; then
        echo -e "${Green}[已存在] ${canonical}, 跳过。${Font}"
        return 0
    fi

    if [ -n "$MIRROR" ]; then
        local src="${MIRROR}/${relpath}"
        echo -e "${Green}[拉取] ${src}${Font}"
        docker pull "$src"
        echo -e "${Green}[重命名] ${src} -> ${canonical}${Font}"
        docker tag "$src" "$canonical"
        docker rmi "$src" >/dev/null 2>&1 || true
    else
        echo -e "${Green}[拉取] ${canonical}${Font}"
        docker pull "$canonical"
    fi
}

for entry in "${IMAGES[@]}"; do
    canonical="${entry%%|*}"
    relpath="${entry##*|}"
    if ! pull_one "$canonical" "$relpath"; then
        echo -e "${Red}拉取 ${canonical} 失败, 请检查网络或更换 REGISTRY_MIRROR。${Font}"
        exit 1
    fi
done

echo -e "${Green}==> 所有镜像已就位, 现在可执行:  docker compose up -d --build${Font}"
