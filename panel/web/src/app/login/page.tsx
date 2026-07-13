'use client'

/**
 * 登录页。
 * - React Hook Form + Zod 校验, 错误就近显示。
 * - 已登录用户重定向到 /dashboard (避免回退到登录页)。
 * - 装饰性网格 + 光晕背景, 纯 CSS, aria-hidden 不干扰读屏。
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MonitorCog, User, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()

  useEffect(() => {
    useAuthStore.getState().hydrate()
    if (useAuthStore.getState().isAuthenticated) router.replace('/dashboard')
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: 'admin', password: '' },
  })

  function onSubmit(values: FormValues) {
    login.mutate(values)
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      {/* 装饰背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_40%,transparent_100%)]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[15%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <MonitorCog className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">幻兽帕鲁</h1>
            <p className="text-sm text-muted-foreground">服务器管理面板</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  {...register('username')}
                />
              </div>
              {errors.username ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.username.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
              {login.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  登录中…
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center font-mono text-xs text-muted-foreground">
          Palworld Dedicated Server · Web Console
        </p>
      </div>
    </div>
  )
}
