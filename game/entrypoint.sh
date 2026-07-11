#!/bin/bash
# ============================================================================
# 幻兽帕鲁服务端 启动脚本 (基于 cm2network/steamcmd)
#   1. 通过 steamcmd 安装/更新 PalServer (Steam CDN, 国内可达)
#   2. 首次生成 / 补齐 PalWorldSettings.ini, 开启 REST API + RCON
#   3. 前台启动 PalServer, 作为容器主进程
# ============================================================================
set -e

# ---- 环境默认值 (均来自 game/server.env, 这里仅兜底) ----
INSTALL_DIR="/palworld"
APP_ID=2394010
# steamcmd 本体持久化到独立挂载 /opt/steamcmd (compose 里挂 ./data/steamcmd),
# 而非镜像内的 /home/steam/steamcmd。否则 down 删容器后再 up, steamcmd 会从镜像重新
# 引导自更新, 每次都白下一遍。
# 注意: 不能放进 /palworld 内, 否则 app_update ... validate 会校验到这个嵌套目录,
#       导致 "Missing file permissions"。二者必须各自独立持久化。
STEAMCMD_DIR="${STEAMCMD_DIR:-/opt/steamcmd}"
STEAMCMD_BUILTIN="/home/steam/steamcmd"     # 镜像自带的 steamcmd

# 启动参数相关
PORT="${PORT:-8211}"
PLAYERS="${PLAYERS:-32}"
USE_PERF_THREADS="${USE_PERF_THREADS:-false}"
NUMBER_OF_WORKER_THREADS="${NUMBER_OF_WORKER_THREADS:-}"
PUBLIC_LOBBY="${PUBLIC_LOBBY:-false}"
PUBLIC_IP="${PUBLIC_IP:-}"
PUBLIC_PORT="${PUBLIC_PORT:-}"
LOG_FORMAT="${LOG_FORMAT:-}"
EXTRA_ARGS="${EXTRA_ARGS:-}"

# 配置文件相关
SERVER_NAME="${SERVER_NAME:-Palworld Server}"
SERVER_DESCRIPTION="${SERVER_DESCRIPTION:-}"
SERVER_PASSWORD="${SERVER_PASSWORD:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-changeme}"
REST_API_PORT="${REST_API_PORT:-8212}"
RCON_PORT="${RCON_PORT:-25575}"
UPDATE_ON_BOOT="${UPDATE_ON_BOOT:-true}"

CONFIG_DIR="${INSTALL_DIR}/Pal/Saved/Config/LinuxServer"
CONFIG_FILE="${CONFIG_DIR}/PalWorldSettings.ini"
DEFAULT_CONFIG="${INSTALL_DIR}/DefaultPalWorldSettings.ini"

# 首次把镜像自带的 steamcmd 复制到持久化目录 (仅一次, 后续复用, 免去重新引导)
if [ ! -x "${STEAMCMD_DIR}/steamcmd.sh" ]; then
    echo "==> [0/3] 初始化持久化 steamcmd -> ${STEAMCMD_DIR}"
    mkdir -p "${STEAMCMD_DIR}"
    cp -a "${STEAMCMD_BUILTIN}/." "${STEAMCMD_DIR}/"
fi
# cm2network:root 镜像默认用户是 root, 但 steamcmd 目录及 steamcmd.sh 归属仍是 steam。
# 官方说明: 以 root 跑 steamcmd.sh 需先 chown 或 su steam, 否则可能因所有权失败。
# 我们全程以 root 运行(需写 /palworld 挂载 + 免装额外用户), 故把两处目录 chown 给 root,
# 与官方 "use chown to change ownership" 推荐对齐, 消除所有权隐患。幂等, 每次启动都校准。
chown -R root:root "${STEAMCMD_DIR}" 2>/dev/null || true
chown root:root "${INSTALL_DIR}" 2>/dev/null || true

echo "==> [1/3] 安装 / 更新 PalServer (app ${APP_ID})"
run_steamcmd() {
    "${STEAMCMD_DIR}/steamcmd.sh" \
        +@sSteamCmdForcePlatformType linux \
        +force_install_dir "${INSTALL_DIR}" \
        +login anonymous \
        +app_update ${APP_ID} validate \
        +quit
}

if [ "${UPDATE_ON_BOOT}" = "true" ] || [ ! -f "${INSTALL_DIR}/PalServer.sh" ]; then
    # steamcmd 首次运行常因自更新/初始化未完成而报 "Missing configuration",
    # 重试一次即可成功, 这里最多重试 5 次。
    MAX_TRY=5
    for i in $(seq 1 ${MAX_TRY}); do
        echo "    steamcmd 安装/更新 尝试 ${i}/${MAX_TRY} ..."
        run_steamcmd && [ -f "${INSTALL_DIR}/PalServer.sh" ] && { echo "    安装成功。"; break; }
        if [ "${i}" -eq "${MAX_TRY}" ]; then
            echo "    !! steamcmd 连续 ${MAX_TRY} 次失败, 退出。请检查网络/代理。"
            exit 1
        fi
        echo "    第 ${i} 次未成功 (常见首次 Missing configuration), 5 秒后重试..."
        sleep 5
    done
else
    echo "    已安装且关闭开机更新, 跳过。"
fi

# steamclient.so 软链 (PalServer 依赖)
mkdir -p "${HOME}/.steam/sdk64"
ln -sf "${STEAMCMD_DIR}/linux64/steamclient.so" "${HOME}/.steam/sdk64/steamclient.so" 2>/dev/null || true

# ---- 配置文件处理 ----
echo "==> [2/3] 处理 PalWorldSettings.ini"
mkdir -p "${CONFIG_DIR}"

# 转义 sed 替换串中的特殊字符 (& \)
esc() { printf '%s' "$1" | sed -e 's/[&\\]/\\&/g'; }

# set_opt KEY VALUE : 在 OptionSettings(...) 中幂等设置某项 (用 \001 作分隔符, 兼容含特殊字符的值)
set_opt() {
    local key="$1" raw="$2" d=$'\001'
    local val; val="$(esc "$raw")"
    if grep -q "${key}=" "${CONFIG_FILE}"; then
        sed -i "s${d}\(${key}=\)[^,)]*${d}\1${val}${d}" "${CONFIG_FILE}"
    else
        # 插入到 OptionSettings 末尾的 ) 之前
        sed -i "s${d})[[:space:]]*\$${d},${key}=${val})${d}" "${CONFIG_FILE}"
    fi
}

if [ ! -f "${CONFIG_FILE}" ]; then
    echo "    首次运行, 生成默认配置。"
    if [ -f "${DEFAULT_CONFIG}" ]; then
        cp "${DEFAULT_CONFIG}" "${CONFIG_FILE}"
    else
        # 兜底: 写一个最小可用配置
        printf '[/Script/Pal.PalGameWorldSettings]\nOptionSettings=()\n' > "${CONFIG_FILE}"
    fi
fi

# 强制开启面板依赖的关键项 (每次启动都校准, 避免被改乱后连不上)
set_opt "RESTAPIEnabled"  "True"
set_opt "RESTAPIPort"     "${REST_API_PORT}"
set_opt "RCONEnabled"     "True"
set_opt "RCONPort"        "${RCON_PORT}"
set_opt "AdminPassword"   "\"${ADMIN_PASSWORD}\""
set_opt "PublicPort"      "${PORT}"
set_opt "ServerName"      "\"${SERVER_NAME}\""
set_opt "ServerPlayerMaxNum" "${PLAYERS}"
[ -n "${SERVER_DESCRIPTION}" ] && set_opt "ServerDescription" "\"${SERVER_DESCRIPTION}\""
[ -n "${SERVER_PASSWORD}" ]    && set_opt "ServerPassword"    "\"${SERVER_PASSWORD}\""

echo "    配置就绪: REST=${REST_API_PORT} RCON=${RCON_PORT} 端口=${PORT}"

# ---- 组装启动参数 (arguments) ----
echo "==> [3/3] 启动 PalServer"
cd "${INSTALL_DIR}"

ARGS=( "-port=${PORT}" "-players=${PLAYERS}" "-RESTAPIEnabled=True" )

if [ "${USE_PERF_THREADS}" = "true" ]; then
    ARGS+=( -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS )
fi
[ -n "${NUMBER_OF_WORKER_THREADS}" ] && ARGS+=( "-NumberOfWorkerThreadsServer=${NUMBER_OF_WORKER_THREADS}" )
[ "${PUBLIC_LOBBY}" = "true" ] && ARGS+=( -publiclobby )
[ -n "${PUBLIC_IP}" ]   && ARGS+=( "-publicip=${PUBLIC_IP}" )
[ -n "${PUBLIC_PORT}" ] && ARGS+=( "-publicport=${PUBLIC_PORT}" )
[ -n "${LOG_FORMAT}" ]  && ARGS+=( "-logformat=${LOG_FORMAT}" )
# 追加自定义参数 (按空格拆分)
[ -n "${EXTRA_ARGS}" ]  && ARGS+=( ${EXTRA_ARGS} )

echo "    启动参数: ${ARGS[*]}"
exec ./PalServer.sh "${ARGS[@]}"
