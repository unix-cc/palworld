# 🎮 Palworld Panel — 幻兽帕鲁服务器 Web 管理面板

用 docker-compose 一键部署幻兽帕鲁服务端，并附带一个浏览器管理后台。
面板基于官方 REST API，可远程管理服务器：启停、玩家、广播、存档备份、配置修改、定时任务。

- **游戏服务端**：`cm2network/steamcmd` 轻量镜像 + entrypoint 自动装/更新/配置/启动
- **管理面板**：FastAPI + Next.js，挂载 `docker.sock` 控制游戏容器
- 目标游戏版本：v1.0.0.100427 及以上（已支持官方 REST API）
- 部署环境：Linux + Docker

## 🏗️ 架构

```
                       ┌─────────────────────────────┐
   浏览器  ── :8000 ──▶ │  palworld-panel (容器)       │
                       │   FastAPI + 内置 Next.js 前端 │
                       │   ├─ 挂载 docker.sock ────────┼─▶ 启停/重启游戏容器
                       │   ├─ 调 REST API :8212 ───────┼─▶ 玩家/指标/存档/广播
                       │   ├─ 读写 ./data (存档/备份)  │
                       │   └─ APScheduler 定时任务     │
                       └──────────────┬──────────────┘
                                      │ compose 内网
                       ┌──────────────▼──────────────┐
                       │  palworld-server (容器)      │
   玩家 ── :8211/udp ──▶│   cm2network/steamcmd 轻量镜像│
                       │   entrypoint.sh 装/更新/配置  │
                       │   REST API :8212             │
                       │   本体+存档卷 ./data/palworld │
                       └─────────────────────────────┘
```

> 游戏服务端本体不打进镜像，容器首次启动时由 `game/entrypoint.sh` 通过 steamcmd
> 从 **Steam CDN**（国内可达）下载到 `./data/palworld`，并自动写好 REST API /
> 管理员密码等配置再启动。镜像本身仅约 200MB，更新只走 Steam 增量，无需重新拉 5GB 镜像。

## 🚀 部署（Linux + Docker）

```bash
git clone https://github.com/unix-cc/palworld-server.git && cd palworld

# 1. 配置 (两个文件)
cp .env.example .env                       # 部署/面板: PANEL_PASSWORD / JWT_SECRET / REGISTRY_MIRROR
cp game/server.env.example game/server.env # 服务端: ADMIN_PASSWORD / 服务器名 / 端口 / 启动参数
vim .env game/server.env                   # 必改: ADMIN_PASSWORD / PANEL_PASSWORD / JWT_SECRET
                                           # 生成随机密钥:  openssl rand -hex 32

# 2. 前置: 提前拉取所需镜像 (支持镜像站加速, 拉完自动重命名回原名)
chmod +x prepare-images.sh
./prepare-images.sh                       # 用 .env 里的 REGISTRY_MIRROR
# 或临时指定镜像站:  ./prepare-images.sh docker.m.daocloud.io

# 3. 一键启动（镜像已就位, 首次会构建面板 + steamcmd 下载游戏本体）
docker compose up -d --build

# 4. 访问
#    游戏:  <服务器IP>:8211 (UDP)
#    面板:  http://<服务器IP>:8000   用 PANEL_USERNAME / PANEL_PASSWORD 登录
```

### 需要科学上网拉取 Steam / 依赖时

`.env` 中填入代理（指向你本机/宿主机的 `7890`）：

```dotenv
# 构建面板镜像（pip/npm）走代理
BUILD_HTTP_PROXY=http://host.docker.internal:7890
# 游戏容器运行时（steamcmd 更新）走代理
SERVER_HTTP_PROXY=http://172.17.0.1:7890
```

> Linux 宿主机代理地址常用 docker0 网关 `172.17.0.1`；Docker Desktop 用 `host.docker.internal`。

## ⚙️ 配置文件说明

服务端的所有启动参数与设置都从 docker-compose 中剥离, 集中在两个文件:

| 文件 | 管什么 | 关键项 |
| --- | --- | --- |
| `.env` | 部署 / 面板 | `PANEL_PASSWORD` `JWT_SECRET` `PANEL_PORT` `REGISTRY_MIRROR` 代理 |
| `game/server.env` | 服务端启动参数 + 核心设置 | `ADMIN_PASSWORD` `PORT` `PLAYERS` `SERVER_NAME` `USE_PERF_THREADS` 等 |

`game/server.env` 依据官方两份文档拆分:
- **启动参数** [(arguments)](https://docs.palworldgame.com/settings-and-operation/arguments) — `PORT/PLAYERS/USE_PERF_THREADS/NUMBER_OF_WORKER_THREADS/PUBLIC_LOBBY/PUBLIC_IP/PUBLIC_PORT/LOG_FORMAT/EXTRA_ARGS`，由 `entrypoint.sh` 动态拼成 `PalServer.sh` 命令行。
- **服务器设置** [(configuration)](https://docs.palworldgame.com/settings-and-operation/configuration) — `SERVER_NAME/ADMIN_PASSWORD/REST_API_PORT` 等写入 `PalWorldSettings.ini`。

> 经验/掉落/死亡惩罚等大量**玩法平衡**项无需写在这里，启动后在面板「服务器设置」在线改即可。
> `USE_PERF_THREADS` 默认 `false` —— 官方文档指出 v1.0+ 不设置该参数反而可能提升性能。
> 若修改了 `server.env` 里的端口，记得同步 `docker-compose.yml` 的 `ports:` 映射。

## 🖥️ 面板功能

- **仪表盘** — 运行状态、在线人数、FPS、游戏内天数、容器 CPU/内存，一键启停/重启/存档
- **玩家管理** — 在线玩家列表、踢出、封禁、解封
- **广播 / 控制** — 全服广播、倒计时关服、实时容器日志
- **服务器设置** — 在线编辑 `PalWorldSettings.ini`，支持「保存并重启」
- **存档备份** — 手动备份、恢复（自动回滚保护）、删除
- **计划任务** — 定时重启 / 定时备份，Cron 预设，面板内可视化增删

## 🔌 用到的 Palworld REST API

Base：`http://palworld-server:8212/v1/api/`，HTTP Basic Auth（用户名 `admin`，密码 = `ADMIN_PASSWORD`）

| 方法 | 路径 | 面板用途 |
| --- | --- | --- |
| GET | `/info` `/metrics` `/players` `/settings` | 仪表盘 / 玩家 / 设置 |
| POST | `/announce` | 全服广播 |
| POST | `/kick` `/ban` `/unban` | 玩家管理 |
| POST | `/save` | 立即存档 |
| POST | `/shutdown` `/stop` | 倒计时关服 / 停止 |

## 🧑‍💻 本地开发

```bash
# 后端
cd panel/backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # 需要能连到游戏容器的 REST/docker

# 前端（另开终端，/api 自动代理到 8000）
cd panel/web && npm install && npm run dev   # http://localhost:3000
```

## ⚠️ 安全提示

- 面板挂载了 `docker.sock`，等同宿主机 root 权限，**务必**改掉默认密码，不要把 `:8000` 直接暴露公网；建议加反向代理 + HTTPS 或仅内网/VPN 访问。
- `ADMIN_PASSWORD` 同时是游戏管理员密码和 REST API 密码，请用强密码。
