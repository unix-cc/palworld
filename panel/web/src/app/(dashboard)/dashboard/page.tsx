'use client'

/**
 * 仪表盘: 服务器运行概览 + 资源占用 + 基本信息 + 控制操作。
 * 数据来自 /api/server/status 与 /api/server/overview, 轻量轮询。
 */
import { Activity, Calendar, Cpu, Gauge, MemoryStick, Play, RefreshCw, RotateCw, Save, Square, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useServerOverview, useServerStatus, useServerAction } from '@/features/server/hooks/use-server'

const STATUS_TEXT: Record<string, string> = {
  running: '运行中',
  stopped: '已停止',
  starting: '启动中',
  exited: '已退出',
}

function pct(v: number | null | undefined): number {
  if (v == null) return 0
  return Math.min(100, Math.round(v))
}

function fpsTone(fps: number | undefined): 'success' | 'warning' | 'destructive' | 'muted' {
  if (fps == null) return 'muted'
  if (fps >= 50) return 'success'
  if (fps >= 25) return 'warning'
  return 'destructive'
}

function uptimeText(seconds: number | undefined): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}小时${m}分`
}

export default function DashboardPage() {
  const { data: status, isLoading: statusLoading } = useServerStatus()
  const { data: overview, isLoading: overviewLoading } = useServerOverview()
  const action = useServerAction()

  const isRunning = status?.status === 'running'
  const statusText = status?.status ? STATUS_TEXT[status.status] ?? status.status : '未知'
  const metrics = overview?.metrics ?? {}
  const info = overview?.info ?? {}

  return (
    <div className="space-y-6">
      <PageHeader title="仪表盘" description="服务器运行概览、资源占用与快捷控制。" />

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="运行状态"
              value={statusText}
              tone={isRunning ? 'success' : 'muted'}
              accent={isRunning}
              icon={Activity}
            />
            <StatCard
              label="在线玩家"
              value={metrics.currentplayernum ?? '-'}
              sub={`上限 ${metrics.maxplayernum ?? '-'}`}
              icon={Users}
            />
            <StatCard
              label="服务器 FPS"
              value={metrics.serverfps ?? '-'}
              tone={fpsTone(metrics.serverfps)}
              icon={Gauge}
            />
            <StatCard
              label="游戏内天数"
              value={metrics.days ?? '-'}
              icon={Calendar}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 资源占用 */}
        <Card>
          <CardHeader>
            <CardTitle>资源占用（容器）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Cpu className="size-4" /> CPU
                </span>
                <span className="tabular">{pct(status?.cpu_percent)}%</span>
              </div>
              <Progress value={pct(status?.cpu_percent)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MemoryStick className="size-4" /> 内存
                </span>
                <span className="tabular text-muted-foreground">
                  {status?.mem_used_mb ?? '-'} / {status?.mem_limit_mb ?? '-'} MB
                </span>
              </div>
              <Progress value={pct(status?.mem_percent)} />
            </div>
          </CardContent>
        </Card>

        {/* 服务器信息 */}
        <Card>
          <CardHeader>
            <CardTitle>服务器信息</CardTitle>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : (
              <dl className="divide-y divide-border text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">名称</dt>
                  <dd className="font-medium">{info.servername || '-'}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">版本</dt>
                  <dd className="tabular">{info.version || '-'}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">运行时长</dt>
                  <dd className="tabular">{uptimeText(metrics.uptime)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-muted-foreground">世界 GUID</dt>
                  <dd className="truncate tabular text-xs text-muted-foreground" title={info.worldguid || '-'}>
                    {info.worldguid || '-'}
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 控制 */}
      <Card>
        <CardHeader>
          <CardTitle>服务器控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="success"
              disabled={isRunning || action.isPending}
              onClick={() => action.mutate('start')}
            >
              <Play /> 启动
            </Button>
            <Button
              variant="warning"
              disabled={action.isPending}
              onClick={() => action.mutate('restart')}
            >
              <RotateCw /> 重启
            </Button>
            <Button
              variant="outline"
              disabled={action.isPending}
              onClick={() => action.mutate('save')}
            >
              <Save /> 立即存档
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={!isRunning || action.isPending}>
                  <Square /> 停止
                </Button>
              }
              title="确定停止服务器？"
              description="停止后所有在线玩家将断开连接，直到重新启动。"
              destructive
              confirmText="停止服务器"
              onConfirm={() => action.mutateAsync('stop')}
            />
            <div className="ml-auto flex items-center text-xs text-muted-foreground">
              <RefreshCw className="mr-1.5 size-3.5" /> 数据每 5 秒自动刷新
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
