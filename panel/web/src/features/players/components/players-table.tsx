'use client'

/**
 * 玩家表格 (TanStack Table)。
 * - 排序 / 全局搜索 / 粘性表头。
 * - 行操作: 踢出 (确认) / 封禁 (确认)。
 * - 延迟着色: ping 分档 (绿/琥珀/红) + 文本, 不只靠颜色。
 */
import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, LogOut, Ban } from 'lucide-react'
import type { Player } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { cn } from '@/lib/utils'

function pingTone(ping: number | null | undefined) {
  if (ping == null) return 'text-muted-foreground'
  if (ping > 150) return 'text-destructive'
  if (ping > 80) return 'text-warning'
  return 'text-success'
}

interface PlayersTableProps {
  data: Player[]
  onAction: (action: 'kick' | 'ban', player: Player) => unknown | Promise<unknown>
}

export function PlayersTable({ data, onAction }: PlayersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo<ColumnDef<Player>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            昵称 <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.name || '-'}</span>,
      },
      {
        accessorKey: 'accountName',
        header: '账号',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.accountName || '-'}</span>
        ),
      },
      {
        accessorKey: 'level',
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            等级 <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => <span className="tabular">{row.original.level ?? '-'}</span>,
      },
      {
        accessorKey: 'ping',
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            延迟 <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const p = row.original.ping
          return (
            <span className={cn('tabular', pingTone(p))}>
              {p != null ? `${Math.round(p)}ms` : '-'}
            </span>
          )
        },
      },
      {
        accessorKey: 'userId',
        header: 'UserID',
        cell: ({ row }) => (
          <span className="tabular text-xs text-muted-foreground">{row.original.userId}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <ConfirmDialog
              title={`踢出 ${row.original.name}?`}
              description="该玩家将被移出服务器, 可重新加入。"
              confirmText="踢出"
              onConfirm={() => onAction('kick', row.original)}
              trigger={
                <Button variant="outline" size="sm">
                  <LogOut className="size-3.5" /> 踢出
                </Button>
              }
            />
            <ConfirmDialog
              title={`封禁 ${row.original.name}?`}
              description="该玩家将被封禁, 需手动解封才能再次加入。"
              confirmText="封禁"
              destructive
              onConfirm={() => onAction('ban', row.original)}
              trigger={
                <Button variant="destructive" size="sm">
                  <Ban className="size-3.5" /> 封禁
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    [onAction],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="搜索昵称 / 账号 / UserID…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground">
          共 <span className="tabular">{data.length}</span> 人
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={h.id === 'actions' ? 'text-right' : undefined}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'actions' ? 'text-right' : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  暂无在线玩家
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
