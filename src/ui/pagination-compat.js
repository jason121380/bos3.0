import React from 'react'
import { cn } from './utils'
import { TableCell } from './table-compat'
import './table-compat.css'
import './pagination-compat.css'

// 舊頁面用的分頁列（取代 MUI TablePagination，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// 輸出 MUI 同名結構與 class：helper/pagenationLabel.js 會改寫 .MuiTablePagination-displayedRows 的文字（「1–5 of 20」→「第 1–5 筆 共 20 筆」），
// 所以顯示筆數的預設文字必須與 MUI 完全相同。每頁筆數改用原生 select（手機叫出系統選單），onRowsPerPageChange 的 event.target.value 為數字。
// 新畫面請用自家分頁元件。

// 圖示沿用 MUI 原本的 SVG 路徑，外觀不變
const ICONS = {
  left: 'M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
  right: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
  drop: 'M7 10l5 5 5-5z',
}
const Svg = ({ d, className }) => (
  <svg className={className} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)

const defaultLabelDisplayedRows = ({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
const defaultItemAriaLabel = type => `Go to ${type} page`

let seed = 0

const TablePagination = React.forwardRef(function TablePagination(
  {
    count,
    page,
    rowsPerPage,
    rowsPerPageOptions = [10, 25, 50, 100],
    onPageChange,
    onRowsPerPageChange,
    labelRowsPerPage = 'Rows per page:',
    labelDisplayedRows = defaultLabelDisplayedRows,
    getItemAriaLabel = defaultItemAriaLabel,
    component = 'td',
    colSpan,
    disabled = false,
    className,
    backIconButtonProps,
    nextIconButtonProps,
    SelectProps,
    ...rest
  },
  ref
) {
  const idRef = React.useRef(null)
  if (idRef.current === null) idRef.current = `pagination-${(seed += 1)}`
  const labelId = `${idRef.current}-label`
  const options = rowsPerPageOptions.map(o => (typeof o === 'object' ? o : { label: String(o), value: o }))
  const to = count === -1 ? (page + 1) * rowsPerPage : rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage)
  const lastPage = count === -1 ? Infinity : Math.max(0, Math.ceil(count / rowsPerPage) - 1)
  const prevDisabled = disabled || page === 0
  const nextDisabled = disabled || (count !== -1 && page >= lastPage)
  const handleRows = event => {
    const picked = options[Number(event.target.value)]
    if (!picked || !onRowsPerPageChange) return
    const target = { value: picked.value, name: event.target.name }
    onRowsPerPageChange(Object.assign(Object.create(event), { target, currentTarget: target }))
  }
  const selected = options.findIndex(o => String(o.value) === String(rowsPerPage))
  // 同 MUI：預設是表格儲存格；指定 component（如 "div"）時 MUI 以 as 換掉整個 TableCell，只剩分頁列自己的樣式
  const Root = component === 'td' ? TableCell : component
  const rootProps = component === 'td' ? { component, colSpan } : {}
  return (
    <Root ref={ref} {...rootProps} className={cn('MuiTablePagination-root', className)} {...rest}>
      <div className="MuiToolbar-root MuiToolbar-gutters MuiToolbar-regular MuiTablePagination-toolbar">
        <div className="MuiTablePagination-spacer" />
        {options.length > 1 && (
          <p className="MuiTablePagination-selectLabel" id={labelId}>
            {labelRowsPerPage}
          </p>
        )}
        {options.length > 1 && (
          <div className="MuiInputBase-root MuiInputBase-colorPrimary MuiTablePagination-input">
            {/* 同 MUI：顯示區只呈現目前值（寬度隨值變化），操作交給疊在上面的透明原生 select */}
            <div className="MuiSelect-select MuiSelect-standard MuiInputBase-input MuiTablePagination-select" aria-hidden="true">
              {selected === -1 ? '' : options[selected].label}
            </div>
            <select
              className="MuiTablePagination-nativeSelect"
              aria-labelledby={labelId}
              value={selected === -1 ? '' : String(selected)}
              onChange={handleRows}
              disabled={disabled}
              {...SelectProps}
            >
              {options.map((o, i) => (
                <option key={o.label} value={String(i)}>
                  {o.label}
                </option>
              ))}
            </select>
            <Svg d={ICONS.drop} className="MuiSvgIcon-root MuiTablePagination-selectIcon" />
          </div>
        )}
        <p className="MuiTablePagination-displayedRows">{labelDisplayedRows({ from: count === 0 ? 0 : page * rowsPerPage + 1, to, count, page })}</p>
        <div className="MuiTablePagination-actions">
          <button
            type="button"
            className={cn('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeMedium', prevDisabled && 'Mui-disabled')}
            disabled={prevDisabled}
            aria-label={getItemAriaLabel('previous', page)}
            title={getItemAriaLabel('previous', page)}
            onClick={event => onPageChange && onPageChange(event, page - 1)}
            {...backIconButtonProps}
          >
            <Svg d={ICONS.left} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" />
          </button>
          <button
            type="button"
            className={cn('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeMedium', nextDisabled && 'Mui-disabled')}
            disabled={nextDisabled}
            aria-label={getItemAriaLabel('next', page)}
            title={getItemAriaLabel('next', page)}
            onClick={event => onPageChange && onPageChange(event, page + 1)}
            {...nextIconButtonProps}
          >
            <Svg d={ICONS.right} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" />
          </button>
        </div>
      </div>
    </Root>
  )
})

export { TablePagination }
export default TablePagination
