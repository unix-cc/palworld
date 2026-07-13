/** 玩家服务: 列表 / 踢出 / 封禁 / 解封。 */
import { api } from '@/lib/api'
import type { PlayersResponse } from '@/types/api'

export async function fetchPlayers(): Promise<PlayersResponse> {
  const { data } = await api.get<PlayersResponse>('/api/players')
  return data
}

export type PlayerAction = 'kick' | 'ban' | 'unban'

export async function playerAction(
  action: PlayerAction,
  userid: string,
  message = '',
): Promise<{ message?: string }> {
  const { data } = await api.post(`/api/players/${action}`, { userid, message })
  return data
}
