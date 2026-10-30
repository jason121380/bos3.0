import React from 'react'
import { cn } from './utils'

// 定值線條進度，取代 MUI LinearProgress variant="determinate"（STYLE.md §6 Progress）
// 視覺對齊原 MUI：高 4px、圓角 3px（theme override）、軌道淺灰、進度桿 primary 深藍
// value 以 0–100 夾限後顯示；只呈現，不計算百分比、不改任何載入／假進度邏輯（計算仍由呼叫端負責）
const Progress = React.forwardRef(({ value = 0, className, ...props }, ref) => {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('h-1 w-full overflow-hidden rounded-[3px] bg-surface-hover', className)}
      {...props}
    >
      <div className="h-full rounded-[3px] bg-[rgb(var(--primary))] transition-[width] duration-300 ease-linear" style={{ width: `${clamped}%` }} />
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress }
