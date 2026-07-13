import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium tracking-tight transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 主按钮: 顶部 1px 高光 (inset) + 极淡投影, Linear 招牌质感
        default:
          'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-destructive/90',
        success:
          'bg-success text-success-foreground shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-success/90',
        warning:
          'bg-warning text-warning-foreground shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-warning/90',
        outline:
          'border border-border bg-elevated/40 hover:bg-accent hover:border-border-strong hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3.5 py-1.5',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        lg: 'h-9 rounded-md px-5',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
