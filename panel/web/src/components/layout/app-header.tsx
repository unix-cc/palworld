'use client'

/**
 * 顶部栏: 折叠按钮 + 页面标题 + ⌘K 入口 + 实时服务器状态 + 主题切换 + 退出。
 * 状态用轻量轮询 (与 dashboard 共享同一 query key, 自动去重)。
 */
import { usePathname, useRouter } from 'next/navigation'
import { PanelLeft, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { navItems } from '@/components/layout/sidebar-nav'
import { useServerStatus, useServerOverview } from '@/features/server/hooks/use-server'
import { deriveServerState, type ServerRunState } from '@/features/server/services/server-service'
import { useAuthStore } from '@/stores/auth-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const RUN_STATE_TONE: Record<ServerRunState, 'running' | 'stopped' | 'pending' | 'unknown'> = {
  running: 'running',
  starting: 'pending',
  stopped: 'stopped',
  unknown: 'unknown',
}

const RUN_STATE_TEXT: Record<ServerRunState, string> = {
  running: '运行中',
  starting: '启动中',
  stopped: '已停止',
  unknown: '连接中',
}

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const { data, isError } = useServerStatus()
  const { data: overview } = useServerOverview()

  const active = navItems.find((n) => n.href === pathname)
  const pageTitle = active?.label ?? '幻兽帕鲁面板'

  const runState = deriveServerState(data?.status, overview?.online, isError)
  const tone = RUN_STATE_TONE[runState]
  const text = RUN_STATE_TEXT[runState]

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  function openPalette() {
    window.dispatchEvent(new Event('open-command-palette'))
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="切换侧边栏"
          className="shrink-0 text-muted-foreground"
        >
          <PanelLeft className="size-[18px]" />
        </Button>
        <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          <span className="hidden text-muted-foreground sm:inline">帕鲁面板</span>
          <span className="hidden text-muted-foreground/50 sm:inline">/</span>
          <span className="truncate font-medium tracking-tight text-foreground">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={openPalette}
          className="hidden h-8 items-center gap-2 rounded-md border border-border bg-elevated/40 pl-2.5 pr-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
          aria-label="打开命令面板"
        >
          <Search className="size-3.5" />
          <span>搜索…</span>
          <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={openPalette}
          aria-label="打开命令面板"
          className="text-muted-foreground sm:hidden"
        >
          <Search className="size-[18px]" />
        </Button>

        <div className="mx-1 hidden sm:block">
          <StatusIndicator tone={tone} label={text} pulse={tone === 'running'} />
        </div>
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
              <LogOut className="size-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>退出登录</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
