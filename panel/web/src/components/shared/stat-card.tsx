/**
 * KPI / 统计卡片。标题 + 大数值 + 可选图标 + 可选副标/趋势。
 * 数值用等宽 tabular 字体, 避免抖动。
 */
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  sub?: React.ReactNode
  /** 数值语义色 */
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'muted'
  /** 左侧强调条 (如运行中) */
  accent?: boolean
  /** value 是否用等宽 (数字/ID 用 true; 中文文案用 false, 走正文字体) */
  mono?: boolean
  className?: string
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
}

const iconToneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-muted-foreground/60',
  success: 'text-success/70',
  warning: 'text-warning/70',
  destructive: 'text-destructive/70',
  muted: 'text-muted-foreground/60',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  tone = 'default',
  accent,
  mono = true,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative gap-0 overflow-hidden p-4',
        accent && 'ring-1 ring-inset ring-success/30',
        className,
      )}
    >
      {accent ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-success/60 to-transparent"
        />
      ) : null}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-tight text-muted-foreground">{label}</span>
        {Icon ? <Icon className={cn('h-4 w-4', iconToneClass[tone])} /> : null}
      </div>
      <div
        className={cn(
          'mt-2.5 text-[26px] font-semibold leading-none tracking-tight',
          mono && 'tabular',
          toneClass[tone],
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div> : null}
    </Card>
  )
}
