import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from './utils'

// 空狀態：置中說明＋主要動作（STYLE.md §6）
const EmptyState = ({ icon: Icon = Inbox, title = '目前沒有資料', description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-tertiary">
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-heading text-text">{title}</p>
      {description && <p className="text-body text-text-secondary">{description}</p>}
    </div>
    {action && <div className="pt-1">{action}</div>}
  </div>
)

export { EmptyState }
