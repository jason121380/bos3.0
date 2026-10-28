import React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from './utils'
import { useLayerRef } from './layer-stack'
import { inputClass } from './input'

const SelectOpen = React.createContext(false)
function Select({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen)
  const open = controlledOpen === undefined ? localOpen : controlledOpen
  return <SelectPrimitive.Root {...props} open={open} onOpenChange={next => {
    if (controlledOpen === undefined) setLocalOpen(next)
    if (onOpenChange) onOpenChange(next)
  }}>
    <SelectOpen.Provider value={open}>{children}</SelectOpen.Provider>
  </SelectPrimitive.Root>
}
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, invalid, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      inputClass,
      'flex items-center justify-between gap-2 text-left data-[placeholder]:text-text-tertiary',
      invalid && 'border-danger',
      className
    )}
    {...props}
  >
    <span className="truncate">{children}</span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectContent = React.forwardRef(({ className, children, position = 'popper', style, ...props }, forwardedRef) => {
  // Radix 在關閉後把內容移到 DocumentFragment，ref 不一定清除；以公開 open 狀態解除登記。
  const open = React.useContext(SelectOpen)
  const { ref, zIndex } = useLayerRef(forwardedRef, open)
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        style={{ ...style, zIndex }}
        position={position}
        sideOffset={4}
        className={cn(
          'ui-root relative z-[1400] max-h-80 min-w-[8rem] overflow-hidden rounded-lg border border-solid border-border bg-background shadow-float',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          position === 'popper' && 'w-[var(--radix-select-trigger-width)]',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = 'SelectContent'

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('px-2 py-1.5 text-caption text-text-tertiary', className)} {...props} />
))
SelectLabel.displayName = 'SelectLabel'

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex h-9 max-sm:min-h-10 cursor-pointer select-none items-center rounded-md pl-2 pr-8 text-body text-text outline-none',
      'data-[highlighted]:bg-surface-hover data-[disabled]:pointer-events-none data-[disabled]:text-text-tertiary',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2">
      <Check className="h-4 w-4" strokeWidth={1.75} />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = 'SelectItem'

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
))
SelectSeparator.displayName = 'SelectSeparator'

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }
