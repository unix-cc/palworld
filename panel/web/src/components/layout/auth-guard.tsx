'use client'

/**
 * 客户端路由守卫: 未登录跳 /login。
 * - hydrate 一次读取 localStorage token, 避免 SSR/CSR 首帧不一致。
 * - hydrate 完成前渲染占位, 防止已登录用户闪现登录页。
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    setReady(true)
  }, [hydrate])

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/login')
    }
  }, [ready, isAuthenticated, router])

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}
