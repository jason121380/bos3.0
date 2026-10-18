import React from 'react'
import { cn } from './utils'

// 載入中佔位；各頁不得自寫 loading 樣式（STYLE.md §6）
const Skeleton = ({ className, ...props }) => (
  <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-surface-hover', className)} {...props} />
)

export { Skeleton }
