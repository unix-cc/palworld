'use client'

/**
 * 存档备份页: 列表 (文件名/大小/时间) + 立即备份 + 恢复(确认)/删除(确认)。
 * 恢复为破坏性操作, 用 destructive 确认框并提示会覆盖当前存档。
 */
import { Archive, DatabaseBackup, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  useBackups,
  useCreateBackup,
  useRestoreBackup,
  useDeleteBackup,
} from '@/features/backups/hooks/use-backups'

export default function BackupsPage() {
  const { data: backups = [], isLoading } = useBackups()
  const createBackup = useCreateBackup()
  const restoreBackup = useRestoreBackup()
  const deleteBackup = useDeleteBackup()

  return (
    <div className="space-y-6">
      <PageHeader
        title="存档备份"
        description="打包世界存档并管理历史备份，恢复前会自动备份当前存档以便回滚。"
        actions={
          <Button
            onClick={() => createBackup.mutate()}
            disabled={createBackup.isPending}
          >
            <Plus className="size-4" />
            {createBackup.isPending ? '备份中…' : '立即备份'}
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            备份列表
            <Badge variant="secondary" className="tabular">
              {backups.length}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="暂无备份"
            description="点击右上角「立即备份」创建第一个存档快照。"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文件名</TableHead>
                <TableHead className="text-right">大小 (MB)</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-[180px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.name}>
                  <TableCell className="font-mono text-xs">{b.name}</TableCell>
                  <TableCell className="text-right tabular">{b.size_mb}</TableCell>
                  <TableCell className="tabular text-muted-foreground">{b.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ConfirmDialog
                        title="恢复此备份？"
                        description={`将用 ${b.name} 覆盖当前存档（恢复前会自动备份当前存档）。恢复后建议重启服务器。`}
                        confirmText="恢复"
                        onConfirm={() => restoreBackup.mutateAsync(b.name)}
                        trigger={
                          <Button variant="outline" size="sm">
                            <RotateCcw className="size-3.5" />
                            恢复
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title="删除此备份？"
                        description={`备份文件 ${b.name} 将被永久删除，无法恢复。`}
                        confirmText="删除"
                        destructive
                        onConfirm={() => deleteBackup.mutateAsync(b.name)}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Alert>
        <DatabaseBackup className="size-4" />
        <AlertDescription>
          恢复存档会先自动备份当前存档以便回滚。恢复完成后建议重启服务器以加载新存档。
        </AlertDescription>
      </Alert>
    </div>
  )
}
