/**
 * 状态指示灯: 圆点 + 文案。用颜色 + 文字双通道传达 (不只靠颜色, 满足 a11y)。
 * tone: running(绿) / stopped(红) / pending(琥珀) / unknown(灰)
 */
import { cn } from '@/lib/utils'

export type StatusTone = 'running' | 'stopped' | 'pending' | 'unknown'

const toneMap: Record<StatusTone, { dot: string; text: string; ring: string }> = {
  running: { dot: 'bg-success', text: 'text-success', ring: 'bg-success/15' },
  stopped: { dot: 'bg-destructive', text: 'text-destructive', ring: 'bg-destructive/15' },
  pending: { dot: 'bg-warning', text: 'text-warning', ring: 'bg-warning/15' },
  unknown: { dot: 'bg-muted-foreground', text: 'text-muted-foreground', ring: 'bg-muted' },
}

interface StatusIndicatorProps {
  tone: StatusTone
  label: string
  /** 是否让圆点呼吸 (仅 running 时有意义) */
  pulse?: boolean
  className?: string
}

export function StatusIndicator({ tone, label, pulse, className }: StatusIndicatorProps) {
  const t = toneMap[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
        t.text,
        className,
      )}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {pulse ? (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden',
              t.dot,
            )}
          />
        ) : null}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', t.dot)} />
      </span>
      {label}
    </span>
  )
}
