/** 后端 API 契约类型 (对应 FastAPI 各 router 的响应/请求体)。 */

export type ContainerStatus = 'running' | 'stopped' | 'starting' | 'exited' | string

/** GET /api/server/status */
export interface ServerStatus {
  name: string
  status: ContainerStatus
  id: string
  cpu_percent?: number | null
  mem_used_mb?: number | null
  mem_limit_mb?: number | null
  mem_percent?: number | null
}

export interface ServerInfo {
  servername?: string
  version?: string
  worldguid?: string
  [k: string]: unknown
}

export interface ServerMetrics {
  serverfps?: number
  currentplayernum?: number
  maxplayernum?: number
  uptime?: number
  days?: number
  [k: string]: unknown
}

/** GET /api/server/overview */
export interface ServerOverview {
  online: boolean
  info?: ServerInfo
  metrics?: ServerMetrics
  error?: string
}

/** GET /api/players -> { players: Player[] } */
export interface Player {
  name: string
  accountName?: string
  playerId?: string
  userId: string
  ip?: string
  ping?: number | null
  location_x?: number
  location_y?: number
  level?: number | null
}

export interface PlayersResponse {
  players: Player[]
}

/** GET /api/backups */
export interface Backup {
  name: string
  size_mb: number
  created: string
}

/** GET /api/tasks */
export type TaskAction = 'restart' | 'backup'

export interface ScheduledTask {
  id: string
  action: TaskAction | null
  cron: string
  next_run: string | null
}

/** GET /api/settings/ini -> Record<key, rawValue> */
export type IniSettings = Record<string, string>

/** POST /api/auth/login */
export interface TokenResponse {
  access_token: string
  token_type: string
}
