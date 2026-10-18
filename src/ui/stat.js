import React from 'react'
import { cn } from './utils'

// 統計數值（STYLE.md：數字等寬、欄名 label、數值 heading）
// StatGrid：以 1px 格線分隔的統計格（帳單列表區間統計的樣式），cols 依斷點自動排列
// StatCard：單一大數字卡片（例如入金餘額、紅利點數餘額）
const colClass = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}

const StatGrid = ({ cols = 6, className, ...props }) => (
  <div
    className={cn('grid gap-px overflow-hidden rounded-lg border border-solid border-border bg-border', colClass[cols] || colClass[6], className)}
    {...props}
  />
)

const Stat = ({ label, hint, className, children, ...props }) => (
  <div className={cn('flex min-w-0 flex-col gap-1 bg-background px-4 py-4', className)} {...props}>
    <span className="text-label text-text-secondary">{label}</span>
    <span className="text-heading tabular-nums text-text">{children}</span>
    {hint && <span className="text-caption text-text-tertiary">{hint}</span>}
  </div>
)

const StatCard = ({ label, hint, action, className, children, ...props }) => (
  <div className={cn('flex flex-col gap-2 rounded-lg border border-solid border-border bg-background p-5', className)} {...props}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-label text-text-secondary">{label}</span>
      {action}
    </div>
    <span className="text-display tabular-nums text-text">{children}</span>
    {hint && <span className="text-caption text-text-tertiary">{hint}</span>}
  </div>
)

export { StatGrid, Stat, StatCard }
