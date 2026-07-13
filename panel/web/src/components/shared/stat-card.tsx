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
  className?: string
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  tone = 'default',
  accent,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative gap-0 overflow-hidden p-5',
        accent && 'ring-1 ring-success/40',
        className,
      )}
    >
      {accent ? <span className="absolute inset-y-0 left-0 w-0.5 bg-success" /> : null}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground/70" /> : null}
      </div>
      <div className={cn('mt-2 text-3xl font-bold leading-tight tabular', toneClass[tone])}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-sm text-muted-foreground">{sub}</div> : null}
    </Card>
  )
}
