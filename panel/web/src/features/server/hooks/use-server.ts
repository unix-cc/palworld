/** 服务器相关 Query/Mutation 钩子。 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/lib/api'
import {
  fetchStatus,
  fetchOverview,
  fetchLogs,
  serverAction,
  announce,
  shutdown,
  type ServerAction,
} from '../services/server-service'

/** 容器状态: 轻量轮询 (5s), 用于全局状态指示与仪表盘。 */
export function useServerStatus(pollMs = 5000) {
  return useQuery({
    queryKey: queryKeys.server.status,
    queryFn: fetchStatus,
    refetchInterval: pollMs,
    refetchIntervalInBackground: false,
  })
}

/** 概览: info + metrics (5s 轮询)。 */
export function useServerOverview(pollMs = 5000) {
  return useQuery({
    queryKey: queryKeys.server.overview,
    queryFn: fetchOverview,
    refetchInterval: pollMs,
  })
}

/** 容器日志 (可配置轮询)。 */
export function useServerLogs(tail = 300, pollMs = 8000) {
  return useQuery({
    queryKey: queryKeys.server.logs(tail),
    queryFn: () => fetchLogs(tail),
    refetchInterval: pollMs,
  })
}

/** 启动/停止/重启/存档。成功后使状态与概览失效并给出反馈。 */
export function useServerAction() {
  const qc = useQueryClient()
  const labels: Record<ServerAction, string> = {
    start: '启动',
    stop: '停止',
    restart: '重启',
    save: '存档',
  }
  return useMutation({
    mutationFn: (action: ServerAction) => serverAction(action),
    onSuccess: (_data, action) => {
      toast.success(`${labels[action]}成功`)
      // 操作后状态会延迟变化, 稍后再刷新一次
      setTimeout(() => {
        void qc.invalidateQueries({ queryKey: queryKeys.server.status })
        void qc.invalidateQueries({ queryKey: queryKeys.server.overview })
      }, 1500)
    },
    onError: (err, action) => toast.error(apiError(err, `${labels[action]}失败`)),
  })
}

/** 全服广播。 */
export function useAnnounce() {
  return useMutation({
    mutationFn: (message: string) => announce(message),
    onSuccess: () => toast.success('已广播'),
    onError: (err) => toast.error(apiError(err, '广播失败')),
  })
}

/** 定时关服。 */
export function useShutdown() {
  return useMutation({
    mutationFn: ({ seconds, message }: { seconds: number; message: string }) =>
      shutdown(seconds, message),
    onSuccess: () => toast.success('已发起关服倒计时'),
    onError: (err) => toast.error(apiError(err, '操作失败')),
  })
}
