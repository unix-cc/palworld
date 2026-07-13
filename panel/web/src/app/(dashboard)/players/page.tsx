'use client'

/**
 * 玩家管理页: 在线玩家表格 + 解封表单。
 * 数据每 10s 轮询; 操作后即时失效刷新。
 */
import { useState } from 'react'
import { Users, ShieldCheck } from 'lucide-react'
import type { Player } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { usePlayers, usePlayerAction } from '@/features/players/hooks/use-players'
import { PlayersTable } from '@/features/players/components/players-table'

export default function PlayersPage() {
  const { data, isLoading, isError } = usePlayers()
  const action = usePlayerAction()
  const [unbanId, setUnbanId] = useState('')

  const players = data?.players ?? []

  function handleRowAction(act: 'kick' | 'ban', player: Player) {
    return action.mutateAsync({ action: act, userid: player.userId })
  }

  function handleUnban() {
    if (!unbanId.trim()) return
    action.mutate(
      { action: 'unban', userid: unbanId.trim() },
      { onSuccess: () => setUnbanId('') },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="玩家管理" description="查看在线玩家, 执行踢出 / 封禁 / 解封操作。" />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full max-w-xs" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : isError ? (
            <EmptyState
              icon={Users}
              title="无法获取玩家列表"
              description="游戏服务器 REST API 可能未就绪, 请确认服务器已启动。"
            />
          ) : (
            <PlayersTable data={players} onAction={handleRowAction} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-muted-foreground" />
            解封玩家
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="unban-id">UserID</Label>
              <Input
                id="unban-id"
                placeholder="steam_xxx / UserID"
                value={unbanId}
                onChange={(e) => setUnbanId(e.target.value)}
                className="max-w-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleUnban()}
              />
            </div>
            <Button onClick={handleUnban} disabled={!unbanId.trim() || action.isPending}>
              解封
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
