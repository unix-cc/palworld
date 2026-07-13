'use client'

/**
 * 广播 / 控制台页。
 * - 全服广播 (英文/数字内容)。
 * - 定时关服 (倒计时 + 提示语, 破坏性操作二次确认)。
 * - 容器日志 (实时轮询, 等宽字体, 自动滚到底)。
 */
import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Megaphone, Power, RefreshCw, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAnnounce, useShutdown, useServerLogs } from '@/features/server/hooks/use-server'

const announceSchema = z.object({
  message: z.string().min(1, '请输入广播内容').max(200, '内容过长'),
})
type AnnounceForm = z.infer<typeof announceSchema>

const shutdownSchema = z.object({
  seconds: z.number().int().min(5, '至少 5 秒').max(3600, '最多 3600 秒'),
  message: z.string().min(1, '请输入提示语').max(200, '内容过长'),
})
type ShutdownForm = z.infer<typeof shutdownSchema>

export default function ConsolePage() {
  const announce = useAnnounce()
  const shutdown = useShutdown()
  const { data: logs, isFetching, refetch } = useServerLogs()
  const logRef = React.useRef<HTMLPreElement>(null)

  const announceForm = useForm<AnnounceForm>({
    resolver: zodResolver(announceSchema),
    defaultValues: { message: '' },
  })
  const shutdownForm = useForm<ShutdownForm>({
    resolver: zodResolver(shutdownSchema),
    defaultValues: { seconds: 30, message: 'Server will shutdown soon.' },
  })

  // 日志更新后滚到底部
  React.useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs])

  function onAnnounce(values: AnnounceForm) {
    announce.mutate(values.message, { onSuccess: () => announceForm.reset() })
  }

  function onShutdown() {
    const values = shutdownForm.getValues()
    shutdown.mutate(values)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="广播 / 控制" description="向全服玩家广播消息，或发起定时关服。" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左侧: 广播 + 关服 */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="size-4 text-muted-foreground" />
                全服广播
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={announceForm.handleSubmit(onAnnounce)} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="announce-msg">广播内容</Label>
                  <Textarea
                    id="announce-msg"
                    rows={3}
                    placeholder="输入广播内容 (仅支持英文/数字)"
                    {...announceForm.register('message')}
                  />
                  {announceForm.formState.errors.message && (
                    <p className="text-xs text-destructive" role="alert">
                      {announceForm.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={announce.isPending}>
                  <Megaphone className="size-4" />
                  {announce.isPending ? '发送中…' : '发送广播'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="size-4 text-muted-foreground" />
                定时关服
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="shutdown-sec">倒计时（秒）</Label>
                  <Input
                    id="shutdown-sec"
                    type="number"
                    min={5}
                    max={3600}
                    className="tabular"
                    {...shutdownForm.register('seconds', { valueAsNumber: true })}
                  />
                  {shutdownForm.formState.errors.seconds && (
                    <p className="text-xs text-destructive" role="alert">
                      {shutdownForm.formState.errors.seconds.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shutdown-msg">提示语</Label>
                  <Input id="shutdown-msg" {...shutdownForm.register('message')} />
                  {shutdownForm.formState.errors.message && (
                    <p className="text-xs text-destructive" role="alert">
                      {shutdownForm.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="destructive" disabled={shutdown.isPending}>
                      <Power className="size-4" />
                      {shutdown.isPending ? '处理中…' : '关服'}
                    </Button>
                  }
                  title="确定倒计时关服？"
                  description="服务器将在倒计时结束后停止，届时在线玩家会被断开连接。"
                  destructive
                  confirmText="确定关服"
                  onConfirm={async () => {
                    const valid = await shutdownForm.trigger()
                    if (valid) onShutdown()
                  }}
                />
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 右侧: 日志 */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="size-4 text-muted-foreground" />
              容器日志
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              aria-label="刷新日志"
            >
              <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
            </Button>
          </CardHeader>
          <CardContent>
            <pre
              ref={logRef}
              className="h-[480px] overflow-auto rounded-md bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-fg"
            >
              {logs || '暂无日志'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
