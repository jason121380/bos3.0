import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from './utils'
import { useLayerRef } from './layer-stack'

// 浮層：rounded-lg、border、浮層陰影（STYLE.md §5）
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(({ className, align = 'start', sideOffset = 6, style, onPointerDownOutside, onFocusOutside, onInteractOutside, ...props }, forwardedRef) => {
  const { ref, zIndex, guardOutside } = useLayerRef(forwardedRef)
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        onPointerDownOutside={guardOutside(onPointerDownOutside)}
        onFocusOutside={guardOutside(onFocusOutside)}
        onInteractOutside={guardOutside(onInteractOutside)}
        style={{ ...style, zIndex }}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'ui-root z-[1400] rounded-lg border border-solid border-border bg-background shadow-float outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent }
