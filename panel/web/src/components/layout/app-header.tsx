'use client'

/**
 * 顶部栏: 折叠按钮 + 页面标题 + 实时服务器状态 + 主题切换 + 退出。
 * 状态用轻量轮询 (与 dashboard 共享同一 query key, 自动去重)。
 */
import { usePathname, useRouter } from 'next/navigation'
import { PanelLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { navItems } from '@/components/layout/sidebar-nav'
import { useServerStatus } from '@/features/server/hooks/use-server'
import { useAuthStore } from '@/stores/auth-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function statusTone(status: string | undefined, isError: boolean) {
  if (isError || status === undefined) return 'unknown' as const
  if (status === 'running') return 'running' as const
  if (status === 'starting') return 'pending' as const
  return 'stopped' as const
}

const STATUS_TEXT: Record<string, string> = {
  running: '运行中',
  stopped: '已停止',
  starting: '启动中',
  exited: '已退出',
}

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const { data, isError } = useServerStatus()

  const active = navItems.find((n) => n.href === pathname)
  const pageTitle = active?.label ?? '幻兽帕鲁面板'

  const tone = statusTone(data?.status, isError)
  const text = data?.status ? STATUS_TEXT[data.status] ?? data.status : tone === 'unknown' ? '连接中' : ''

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="切换侧边栏"
          className="shrink-0"
        >
          <PanelLeft className="size-5" />
        </Button>
        <h1 className="text-base font-semibold tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <StatusIndicator tone={tone} label={text} />
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="退出登录"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>退出登录</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
