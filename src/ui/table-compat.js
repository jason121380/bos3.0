import React from 'react'
import { cn } from './utils'
import './table-compat.css'

// 舊頁面用的表格（取代 MUI Table／TableHead／TableBody／TableFooter／TableRow／TableCell／TableContainer，
// Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// 輸出與 MUI 相同的元素與 class 名稱，樣式由 table-compat.css 重現：報表列印（initialize.scss 數十條 .MuiTableCell-* 規則）、
// 深色模式與各頁的 '& .MuiTableCell-root' 選擇器都靠它們。新畫面請用 ui/table。

const TableContext = React.createContext({ size: 'medium', padding: 'normal', stickyHeader: false })
// 區段（thead／tbody／tfoot）決定儲存格是 head、body 還是 footer（同 MUI Tablelvl2Context）
const SectionContext = React.createContext(null)

const Table = React.forwardRef(function Table(
  { size = 'medium', padding = 'normal', stickyHeader = false, component: Component = 'table', className, ...rest },
  ref
) {
  const value = React.useMemo(() => ({ size, padding, stickyHeader }), [size, padding, stickyHeader])
  return (
    <TableContext.Provider value={value}>
      <Component ref={ref} className={cn('MuiTable-root', stickyHeader && 'MuiTable-stickyHeader', className)} {...rest} />
    </TableContext.Provider>
  )
})

const section = (variant, tag, rootClass) =>
  React.forwardRef(function TableSection({ component: Component = tag, className, ...rest }, ref) {
    return (
      <SectionContext.Provider value={variant}>
        <Component ref={ref} className={cn(rootClass, className)} {...rest} />
      </SectionContext.Provider>
    )
  })

const TableHead = section('head', 'thead', 'MuiTableHead-root')
TableHead.displayName = 'TableHead'
const TableBody = section('body', 'tbody', 'MuiTableBody-root')
TableBody.displayName = 'TableBody'
const TableFooter = section('footer', 'tfoot', 'MuiTableFooter-root')
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(function TableRow({ hover = false, selected = false, component: Component = 'tr', className, ...rest }, ref) {
  const sectionVariant = React.useContext(SectionContext)
  return (
    <Component
      ref={ref}
      className={cn(
        'MuiTableRow-root',
        hover && 'MuiTableRow-hover',
        selected && 'Mui-selected',
        sectionVariant === 'head' && 'MuiTableRow-head',
        sectionVariant === 'footer' && 'MuiTableRow-footer',
        className
      )}
      {...rest}
    />
  )
})

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

const TableCell = React.forwardRef(function TableCell(
  { align = 'inherit', padding: paddingProp, size: sizeProp, variant: variantProp, scope: scopeProp, sortDirection, component, className, ...rest },
  ref
) {
  const table = React.useContext(TableContext)
  const sectionVariant = React.useContext(SectionContext)
  const isHead = sectionVariant === 'head'
  const variant = variantProp || sectionVariant || 'body'
  const padding = paddingProp || table.padding || 'normal'
  const size = sizeProp || table.size || 'medium'
  const Component = component || (isHead ? 'th' : 'td')
  // 同 MUI：表頭的 th 預設 scope="col"；排序中的欄位加 aria-sort
  const scope = scopeProp || (!component && isHead ? 'col' : undefined)
  const ariaSort = sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
  return (
    <Component
      ref={ref}
      scope={scope}
      aria-sort={ariaSort}
      className={cn(
        'MuiTableCell-root',
        `MuiTableCell-${variant}`,
        `MuiTableCell-size${capitalize(size)}`,
        padding !== 'normal' && `MuiTableCell-padding${capitalize(padding)}`,
        align !== 'inherit' && `MuiTableCell-align${capitalize(align)}`,
        table.stickyHeader && 'MuiTableCell-stickyHeader',
        className
      )}
      {...rest}
    />
  )
})

// component={Paper} 時渲染該元件（MUI Paper 換掉前仍是 MUI 的 Paper），其餘屬性如 elevation 照傳
const TableContainer = React.forwardRef(function TableContainer({ component: Component = 'div', className, ...rest }, ref) {
  return <Component ref={ref} className={cn('MuiTableContainer-root', className)} {...rest} />
})

export { Table, TableHead, TableBody, TableFooter, TableRow, TableCell, TableContainer }
