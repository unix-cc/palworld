'use client'

/**
 * Command 基础组件: 基于 cmdk, 套壳 shadcn 风格。
 * CommandDialog 复用 Dialog 的 overlay/动画, 内部渲染 cmdk 的搜索 + 分组列表。
 */
import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="top-[18%] max-w-[560px] translate-y-0 gap-0 overflow-hidden p-0"
      >
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-tight [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3" cmdk-input-wrapper="">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        className={cn(
          'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn('max-h-[340px] overflow-y-auto overflow-x-hidden p-2', className)}
      {...props}
    />
  )
}

function CommandEmpty(
  props: React.ComponentProps<typeof CommandPrimitive.Empty>,
) {
  return (
    <CommandPrimitive.Empty
      className="py-8 text-center text-sm text-muted-foreground"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn('overflow-hidden text-foreground', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2.5 rounded-md text-sm text-muted-foreground outline-none data-[selected=true]:bg-accent data-[selected=true]:text-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn('-mx-2 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'ml-auto font-mono text-[11px] tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
}
