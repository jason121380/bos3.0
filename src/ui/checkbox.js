import React, { useEffect, useRef } from 'react'
import { cn } from './utils'

// 原生 checkbox，支援 indeterminate；選取色為 primary（STYLE.md §2）
const Checkbox = React.forwardRef(({ className, indeterminate = false, ...props }, forwardedRef) => {
  const innerRef = useRef(null)
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      type="checkbox"
      ref={node => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      className={cn(
        'h-4 w-4 cursor-pointer rounded-sm accent-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40',
        'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        className
      )}
      {...props}
    />
  )
})
Checkbox.displayName = 'Checkbox'

export { Checkbox }
