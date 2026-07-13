import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-8 w-full rounded-md border border-input bg-elevated/30 px-3 py-1 text-[13px] transition-[border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground hover:border-border-strong',
        'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
