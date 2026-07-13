'use client'

/**
 * 侧栏: 品牌区 + 导航 + 底部版本。
 * - 桌面固定; 移动端由 header 的抽屉复用同一份内容 (SidebarContent)。
 * - 当前项高亮 (subtle bg + 左侧指示条 + aria-current), 不只靠颜色。
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navItems } from './sidebar-nav'

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* 品牌 */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <Gamepad2 className="size-[18px]" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          帕鲁面板
        </span>
      </div>

      {/* 导航 */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2" aria-label="主导航">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium tracking-tight transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                active
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  'size-[17px] shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* 底部版本 */}
      <div className="px-4 py-3">
        <span className="font-mono text-[11px] tracking-tight text-muted-foreground">
          Palworld Console · v1.0
        </span>
      </div>
    </div>
  )
}

interface AppSidebarProps {
  /** 桌面折叠 (宽度归零) */
  collapsed: boolean
  /** 移动端抽屉开合 */
  mobileOpen: boolean
  /** 关闭移动端抽屉 (点击遮罩 / 导航后) */
  onMobileClose: () => void
}

/**
 * 侧栏容器:
 * - 桌面 (md+): 固定列, collapsed 时宽度收起并隐藏。
 * - 移动端: 遮罩 + 抽屉, 复用同一份 SidebarContent。
 */
export function AppSidebar({ collapsed, mobileOpen, onMobileClose }: AppSidebarProps) {
  return (
    <>
      {/* 桌面侧栏 */}
      <aside
        className={cn(
          'hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block',
          collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-56',
        )}
      >
        <SidebarContent />
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-56 border-r border-sidebar-border shadow-xl">
            <SidebarContent onNavigate={onMobileClose} />
          </div>
        </div>
      )}
    </>
  )
}
