import React from 'react'
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from './utils'
import { useLayerRef } from './layer-stack'

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger

const DropdownMenuContent = React.forwardRef(({ className, align = 'end', sideOffset = 4, style, onPointerDownOutside, onFocusOutside, onInteractOutside, ...props }, forwardedRef) => {
  const { ref, zIndex, guardOutside } = useLayerRef(forwardedRef)
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        onPointerDownOutside={guardOutside(onPointerDownOutside)}
        onFocusOutside={guardOutside(onFocusOutside)}
        onInteractOutside={guardOutside(onInteractOutside)}
        style={{ ...style, zIndex }}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'ui-root z-[1400] min-w-[160px] rounded-lg border border-solid border-border bg-background p-1 shadow-float outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

// 選單項目：高 36px；danger 用於刪除類操作
const DropdownMenuItem = React.forwardRef(({ className, danger, ...props }, ref) => (
  <MenuPrimitive.Item
    ref={ref}
    className={cn(
      'flex h-9 cursor-pointer select-none items-center gap-2 rounded-md px-2 text-body outline-none [&_svg]:size-4',
      'data-[highlighted]:bg-surface-hover data-[disabled]:pointer-events-none data-[disabled]:text-text-tertiary',
      danger ? 'text-danger' : 'text-text',
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <MenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator }
