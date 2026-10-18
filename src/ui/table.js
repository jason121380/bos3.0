import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from './utils'
import { Button } from './button'
import { NativeSelect, NativeSelectOption } from './native-select'

// STYLE.md §6：表頭 surface 底、label 字級；列高 44px；hover surface-hover；數字欄右對齊
// dense：列高 32px（日報表、薪資條等密集表格）
// 列印：自動改為黑色細格線、白底黑字、不裁切（頁面自己的 @media print 規則權重較高，仍以頁面為準）
const PRINT = cn(
  'print:[&_td]:border print:[&_th]:border print:[&_td]:border-solid print:[&_th]:border-solid',
  'print:[&_td]:border-black print:[&_th]:border-black print:[&_td]:text-black print:[&_th]:text-black',
  'print:[&_thead]:bg-transparent print:[&_tfoot]:bg-transparent'
)
const Table = React.forwardRef(({ className, wrapperClassName, dense = false, ...props }, ref) => (
  <div className={cn('ui-scroll-x w-full overflow-x-auto rounded-lg border border-solid border-border print:overflow-visible print:rounded-none print:border-0', wrapperClassName)}>
    <table
      ref={ref}
      className={cn('w-full border-collapse text-body', dense && '[&_td]:h-8 [&_td]:py-1 [&_th]:h-8', PRINT, className)}
      {...props}
    />
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

// 手機螢幕：儲存格不換行、表格改橫向捲動（避免中文被擠成一字一行）；只限螢幕，不影響列印
const TableCell = React.forwardRef(({ className, numeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('h-11 px-4 py-2 align-middle text-text [@media_screen_and_(max-width:639.95px)]:whitespace-nowrap', numeric && 'text-right tabular-nums', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

// 分頁：手機上換頁按鈕 40px（觸控目標），桌機 32px；props 名稱與 MUI TablePagination 相同，遷移時可直接沿用原本的 state 與 handler
// - ref 掛在外框 div（原本傳給 MUI 分頁的 ref 可直接沿用；helper/pagenationLabel 找不到 MUI 元素時不會動作）
// - rowsPerPageOptions 可為數字或 { value, label }（與 MUI 相同）；每頁筆數用原生下拉，可放在 MUI Dialog 內
// - onRowsPerPageChange(event)：event.target.value 為數字
const TablePagination = React.forwardRef(function TablePagination(
  { count, page, rowsPerPage, onPageChange, rowsPerPageOptions = [10, 25, 50], onRowsPerPageChange, labelRowsPerPage = '每頁', className },
  ref
) {
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage)
  const lastPage = rowsPerPage === -1 ? 0 : Math.max(0, Math.ceil(count / rowsPerPage) - 1)
  return (
    <div ref={ref} className={cn('flex flex-wrap items-center justify-end gap-x-4 gap-y-2 pt-3 text-label text-text-secondary', className)}>
      {onRowsPerPageChange && rowsPerPageOptions.length > 1 && (
        <div className="flex items-center gap-2">
          <span>{labelRowsPerPage}</span>
          <NativeSelect
            fullWidth={false}
            aria-label="每頁筆數"
            value={rowsPerPage}
            onChange={e => onRowsPerPageChange(Object.assign(Object.create(e), { target: { value: Number(e.target.value) } }))}
            className="[&_select]:h-8 [&_select]:w-[84px]"
          >
            {rowsPerPageOptions.map(o => {
              const value = typeof o === 'object' ? o.value : o
              return (
                <NativeSelectOption key={value} value={value}>
                  {typeof o === 'object' ? o.label : o}
                </NativeSelectOption>
              )
            })}
          </NativeSelect>
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
})

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TablePagination }
