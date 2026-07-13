'use client'

/**
 * 认证后主框架: 左侧栏 (桌面固定 / 移动抽屉) + 顶栏 + 内容区。
 * - 折叠状态仅桌面生效; 移动端通过抽屉 (Sheet 风格) 呈现同一份 SidebarContent。
 * - 用 AuthGuard 包裹, 未登录跳登录页。
 */
import { useState } from 'react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { AppHeader } from '@/components/layout/app-header'
import { SidebarContent } from '@/components/layout/app-sidebar'
import { cn } from '@/lib/utils'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // 桌面侧栏折叠
  const [collapsed, setCollapsed] = useState(false)
  // 移动端抽屉开合
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* 桌面侧栏 */}
        <aside
          className={cn(
            'hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block',
            collapsed ? 'w-0 overflow-hidden' : 'w-60',
          )}
        >
          <SidebarContent />
        </aside>

        {/* 移动端抽屉 */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-60 border-r border-sidebar-border shadow-xl">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* 主区 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            onToggleSidebar={() => {
              // 桌面折叠 / 移动开抽屉
              if (window.matchMedia('(min-width: 768px)').matches) {
                setCollapsed((c) => !c)
              } else {
                setMobileOpen(true)
              }
            }}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
