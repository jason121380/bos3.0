import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from './utils'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

// STYLE.md §6：表頭 surface 底、label 字級；列高 44px；hover surface-hover；數字欄右對齊
const Table = React.forwardRef(({ className, wrapperClassName, ...props }, ref) => (
  <div className={cn('w-full overflow-x-auto rounded-lg border border-solid border-border', wrapperClassName)}>
    <table ref={ref} className={cn('w-full border-collapse text-body', className)} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-surface', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&>tr:last-child]:border-b-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('bg-surface font-medium', className)} {...props} />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-0 border-b border-solid border-border transition-colors hover:bg-surface-hover data-[state=selected]:bg-surface-hover', className)}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, numeric, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 whitespace-nowrap border-0 border-b border-solid border-border px-4 text-left align-middle text-label text-text-secondary',
      numeric && 'text-right',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, numeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('h-11 px-4 py-2 align-middle text-text', numeric && 'text-right tabular-nums', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

// 分頁：手機上換頁按鈕 40px（觸控目標），桌機 32px；props 名稱與 MUI TablePagination 相同，遷移時可直接沿用原本的 state 與 handler
function TablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  rowsPerPageOptions = [10, 25, 50],
  onRowsPerPageChange,
  className,
}) {
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = Math.min(count, (page + 1) * rowsPerPage)
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1)
  return (
    <div className={cn('flex items-center justify-end gap-4 pt-3 text-label text-text-secondary', className)}>
      {onRowsPerPageChange && (
        <div className="flex items-center gap-2">
          <span>每頁</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={v => onRowsPerPageChange({ target: { value: Number(v) } })}
          >
            <SelectTrigger className="h-8 w-[72px]" aria-label="每頁筆數">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map(n => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <span className="tabular-nums">
        {from}–{to} / 共 {count} 筆
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8" aria-label="上一頁" disabled={page <= 0} onClick={e => onPageChange(e, page - 1)}>
          <ChevronLeft strokeWidth={1.75} />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8" aria-label="下一頁" disabled={page >= lastPage} onClick={e => onPageChange(e, page + 1)}>
          <ChevronRight strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TablePagination }
