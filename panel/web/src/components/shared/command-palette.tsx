'use client'

/**
 * ⌘K 命令面板: 全局快捷入口。
 * - 页面跳转 (6 个导航项)。
 * - 服务器快捷操作 (启动/重启/立即存档)。
 * - 外观 (切换主题) 与会话 (退出登录)。
 * 由 ⌘K / Ctrl+K 唤起, 也可由 header 的入口按钮打开。
 * 破坏性操作 (停止) 不放这里, 避免误触; 保留在对应页面的二次确认流程。
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Users,
  Radio,
  Settings2,
  Archive,
  CalendarClock,
  Play,
  RotateCw,
  Save,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import { navItems } from '@/components/layout/sidebar-nav'
import { useServerAction } from '@/features/server/hooks/use-server'
import { useAuthStore } from '@/stores/auth-store'

const iconByHref: Record<string, typeof LayoutDashboard> = {
  '/dashboard': LayoutDashboard,
  '/players': Users,
  '/console': Radio,
  '/settings': Settings2,
  '/backups': Archive,
  '/tasks': CalendarClock,
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const action = useServerAction()
  const logout = useAuthStore((s) => s.logout)

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // 打开时提供全局入口 (供 header 按钮调用)
  React.useEffect(() => {
    function openHandler() {
      setOpen(true)
    }
    window.addEventListener('open-command-palette', openHandler)
    return () => window.removeEventListener('open-command-palette', openHandler)
  }, [])

  const run = React.useCallback((fn: () => void) => {
    setOpen(false)
    // 关闭动画后再执行, 避免焦点竞争
    setTimeout(fn, 0)
  }, [])

  const isDark = theme === 'dark'

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜索页面或执行操作…" />
      <CommandList>
        <CommandEmpty>无匹配结果</CommandEmpty>

        <CommandGroup heading="前往">
          {navItems.map((item) => {
            const Icon = iconByHref[item.href] ?? LayoutDashboard
            return (
              <CommandItem
                key={item.href}
                value={`前往 ${item.label} ${item.href}`}
                onSelect={() => run(() => router.push(item.href))}
              >
                <Icon />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandGroup heading="服务器操作">
          <CommandItem
            value="启动服务器 start"
            onSelect={() => run(() => action.mutate('start'))}
          >
            <Play />
            <span>启动服务器</span>
          </CommandItem>
          <CommandItem
            value="重启服务器 restart"
            onSelect={() => run(() => action.mutate('restart'))}
          >
            <RotateCw />
            <span>重启服务器</span>
          </CommandItem>
          <CommandItem
            value="立即存档 save"
            onSelect={() => run(() => action.mutate('save'))}
          >
            <Save />
            <span>立即存档</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="外观与会话">
          <CommandItem
            value="切换主题 theme dark light"
            onSelect={() => run(() => setTheme(isDark ? 'light' : 'dark'))}
          >
            {isDark ? <Sun /> : <Moon />}
            <span>{isDark ? '切换到浅色主题' : '切换到深色主题'}</span>
          </CommandItem>
          <CommandItem
            value="退出登录 logout"
            onSelect={() => run(() => {
              logout()
              router.replace('/login')
            })}
          >
            <LogOut />
            <span>退出登录</span>
            <CommandShortcut>⇧⌘Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
