'use client'

/**
 * 认证区外壳: 侧边栏 + 顶部栏 + 内容区。
 * - AuthGuard 包裹, 未登录跳登录页。
 * - 侧边栏折叠态提升到此处, 供 header 的折叠按钮联动。
 * - 移动端侧栏为抽屉式 (overlay), 桌面端为常驻可折叠。
 */
import { useState } from 'react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { CommandPalette } from '@/components/shared/command-palette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AuthGuard>
      <CommandPalette />
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            onToggleSidebar={() => {
              // 桌面端切折叠, 移动端开抽屉
              if (window.matchMedia('(min-width: 768px)').matches) {
                setCollapsed((c) => !c)
              } else {
                setMobileOpen(true)
              }
            }}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
