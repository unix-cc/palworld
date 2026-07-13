/** 玩家相关 Query/Mutation 钩子。 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/lib/api'
import { fetchPlayers, playerAction, type PlayerAction } from '../services/players-service'

/** 在线玩家列表 (10s 轮询)。 */
export function usePlayers(pollMs = 10000) {
  return useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: pollMs,
    select: (data) => data.players ?? [],
  })
}

/** 踢出 / 封禁 / 解封。 */
export function usePlayerAction() {
  const qc = useQueryClient()
  const labels: Record<PlayerAction, string> = { kick: '踢出', ban: '封禁', unban: '解封' }
  return useMutation({
    mutationFn: ({
      action,
      userid,
      name,
    }: {
      action: PlayerAction
      userid: string
      name?: string
    }) => playerAction(action, userid).then((r) => ({ ...r, action, name })),
    onSuccess: (res) => {
      const who = res.name ? ` ${res.name}` : ''
      toast.success(`已${labels[res.action]}${who}`)
      void qc.invalidateQueries({ queryKey: queryKeys.players })
    },
    onError: (err, vars) => toast.error(apiError(err, `${labels[vars.action]}失败`)),
  })
}
