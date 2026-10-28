import React from 'react'
import { X } from 'lucide-react'
import { cn, focusRing } from './utils'

// 選取值標籤沿用 Badge 的字色與淡底；可刪除時保留 40px 操作區及獨立按鈕語意。
const Tag = React.forwardRef(function Tag({ label, onDelete, deleteLabel, className, onKeyUp, onKeyDown, ...props }, ref) {
  return <span {...props} ref={ref} tabIndex={onDelete ? 0 : undefined}
    className={cn('ui-root inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-text/8 pl-2 text-caption font-medium text-text-secondary',
      onDelete ? cn('min-h-10', focusRing) : 'h-6 pr-2', className)}
    onKeyDown={event => {
      if (onKeyDown) onKeyDown(event)
      if (onDelete && event.target === event.currentTarget && ['Backspace', 'Delete'].includes(event.key)) event.preventDefault()
    }}
    onKeyUp={event => {
      if (onKeyUp) onKeyUp(event)
      if (!event.defaultPrevented && onDelete && event.target === event.currentTarget && ['Backspace', 'Delete'].includes(event.key)) onDelete(event)
    }}>
    <span>{label}</span>
    {onDelete && <button type="button" aria-label={deleteLabel || `刪除「${typeof label === 'string' || typeof label === 'number' ? label : '標籤'}」`}
      className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text', focusRing)}
      onClick={event => { event.stopPropagation(); onDelete(event) }}><X aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} /></button>}
  </span>
})

export { Tag }
