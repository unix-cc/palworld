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
