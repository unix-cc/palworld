/** 服务器控制服务: 状态 / 概览 / 启停重启 / 存档 / 广播 / 定时关服 / 日志。 */
import { api } from '@/lib/api'
import type { ServerStatus, ServerOverview } from '@/types/api'

export async function fetchStatus(): Promise<ServerStatus> {
  const { data } = await api.get<ServerStatus>('/api/server/status')
  return data
}

export async function fetchOverview(): Promise<ServerOverview> {
  const { data } = await api.get<ServerOverview>('/api/server/overview')
  return data
}

/**
 * 真实运行态。容器 running 只代表 docker 容器起来了, 但游戏进程加载存档、
 * 开始监听要额外几十秒到几分钟。用 REST API 是否可达 (overview.online) 才能
 * 判断游戏真正就绪。
 * - stopped: 容器未运行 (stopped/exited/created)
 * - starting: 容器 running 但 REST 尚不可达 (加载中 / 重启中)
 * - running: 容器 running 且 REST 可达 (游戏就绪)
 * - unknown: 状态未知 (请求失败或尚未加载)
 */
export type ServerRunState = 'running' | 'starting' | 'stopped' | 'unknown'

export function deriveServerState(
  containerStatus: string | undefined,
  online: boolean | undefined,
  statusError = false,
): ServerRunState {
  if (statusError || containerStatus === undefined) return 'unknown'
  if (containerStatus !== 'running') return 'stopped'
  // 容器已 running: 只有 REST 明确可达才算真正运行, 否则视为启动中
  return online === true ? 'running' : 'starting'
}

export type ServerAction = 'start' | 'stop' | 'restart' | 'save'

export async function serverAction(action: ServerAction): Promise<{ message?: string }> {
  const { data } = await api.post<{ message?: string }>(`/api/server/${action}`)
  return data
}

export async function announce(message: string): Promise<{ message?: string }> {
  const { data } = await api.post('/api/server/announce', { message })
  return data
}

export async function shutdown(seconds: number, message: string): Promise<{ message?: string }> {
  const { data } = await api.post('/api/server/shutdown', { seconds, message })
  return data
}

export async function fetchLogs(tail = 300): Promise<string> {
  const { data } = await api.get<{ logs: string }>(`/api/server/logs?tail=${tail}`)
  return data.logs
}
