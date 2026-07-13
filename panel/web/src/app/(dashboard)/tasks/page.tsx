'use client'

/**
 * 计划任务页: 添加 (类型 + 预设/自定义 cron) + 列表 (类型/规则/下次执行/删除)。
 * 类型徽章双通道 (色 + 文字), cron 用等宽字体。
 */
import * as React from 'react'
import { Clock, Plus, Trash2, RefreshCw, DatabaseBackup } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useTasks, useAddTask, useDeleteTask } from '@/features/tasks/hooks/use-tasks'
import type { TaskAction } from '@/types/api'

const CRON_PRESETS: { label: string; value: string }[] = [
  { label: '每天 05:00', value: '0 5 * * *' },
  { label: '每天 04:00', value: '0 4 * * *' },
  { label: '每 6 小时', value: '0 */6 * * *' },
  { label: '每 12 小时', value: '0 */12 * * *' },
  { label: '每周三 05:00', value: '0 5 * * 3' },
]

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const addTask = useAddTask()
  const deleteTask = useDeleteTask()

  const [action, setAction] = React.useState<TaskAction>('restart')
  const [cron, setCron] = React.useState('0 5 * * *')

  function handleAdd() {
    if (!cron.trim()) return
    addTask.mutate({ action, cron: cron.trim() })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="计划任务"
        description="配置定时重启与定时备份。使用标准 5 段 crontab 表达式（分 时 日 月 周）。"
      />

      {/* 添加任务 */}
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[180px_200px_1fr_auto] lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="task-type">任务类型</Label>
            <Select value={action} onValueChange={(v) => setAction(v as TaskAction)}>
              <SelectTrigger id="task-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restart">定时重启</SelectItem>
                <SelectItem value="backup">定时备份</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-preset">快速预设</Label>
            <Select onValueChange={(v) => setCron(v)}>
              <SelectTrigger id="task-preset">
                <SelectValue placeholder="选择预设" />
              </SelectTrigger>
              <SelectContent>
                {CRON_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-cron">Cron 表达式</Label>
            <Input
              id="task-cron"
              className="font-mono"
              placeholder="分 时 日 月 周"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
            />
          </div>

          <Button onClick={handleAdd} disabled={addTask.isPending || !cron.trim()}>
            <Plus className="size-4" />
            添加
          </Button>
        </div>
      </Card>

      {/* 任务列表 */}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-medium">
          已配置任务
          <Badge variant="secondary" className="tabular">
            {tasks.length}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="暂无计划任务"
            description="在上方添加定时重启或定时备份任务。"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">类型</TableHead>
                <TableHead>触发规则</TableHead>
                <TableHead>下次执行</TableHead>
                <TableHead className="w-[100px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.action === 'restart'
                          ? 'border-warning/40 text-warning'
                          : 'border-success/40 text-success'
                      }
                    >
                      {t.action === 'restart' ? (
                        <RefreshCw className="size-3" />
                      ) : (
                        <DatabaseBackup className="size-3" />
                      )}
                      {t.action === 'restart' ? '定时重启' : '定时备份'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.cron}</TableCell>
                  <TableCell className="tabular text-muted-foreground">
                    {t.next_run ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      title="删除此任务？"
                      description="该计划任务将被移除，不再触发。"
                      confirmText="删除"
                      destructive
                      onConfirm={() => deleteTask.mutateAsync(t.id)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
