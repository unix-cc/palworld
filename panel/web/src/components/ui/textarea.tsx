import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[72px] w-full rounded-md border border-input bg-elevated/30 px-3 py-2 text-[13px] transition-[border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground hover:border-border-strong',
        'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
