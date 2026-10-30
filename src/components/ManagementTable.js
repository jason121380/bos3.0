import PropTypes from 'prop-types'
import { useRef, useEffect } from 'react'
import { CSVLink } from "react-csv"
import paginationLabel from './../helper/paginationLabel'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Table, TableHeader, TablePagination, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

// 列表頁共用表格卡片（STYLE.md §6）：卡片標題＋筆數＋匯出／自訂動作、可橫向捲動的表格、分頁
// props 與舊版相同。表格本體使用 ui/table（size='small' 對應 dense）：
// 傳入的 tableHead/children 須為 ui/table 的 TableHead/TableCell（消費者已逐頁換置）
const ManagementTable = ({
    title,
    totalCount,
    excelData,
    excelFilename,
    tableHead,
    children,
    pageLimit,
    pageOffset,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50, 1000],
    minWidth = 1000,
    headerAction,
    className,
    hidePagination = false,
    size = 'medium',
}) => {
    const pageRef = useRef(null)

    useEffect(() => {
        if (pageRef.current && !hidePagination) {
            paginationLabel(pageRef.current)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pageRef.current 放進依賴，讓分頁元件掛上 DOM 後的下一次 render 補上中文分頁標籤
    }, [children, pageRef.current, hidePagination])

    return (
        <Card className={cn('ui-root overflow-hidden', typeof className === 'string' && className)}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                    <h2 className="text-heading text-text">{title}</h2>
                    <span className="shrink-0 text-label tabular-nums text-text-secondary">共 {totalCount} 筆</span>
                </div>
                <div className="flex items-center gap-2">
                    {excelData && (
                        <Button asChild size="sm">
                            <CSVLink data={excelData} filename={excelFilename || "data.csv"}>
                                報表匯出
                            </CSVLink>
                        </Button>
                    )}
                    {headerAction}
                </div>
            </div>
            <div className="w-full overflow-x-auto border-0 border-t border-solid border-border">
                <div style={{ minWidth }}>
                    <Table dense={size === 'small'} wrapperClassName="overflow-visible rounded-none border-0">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {tableHead}
                            </TableRow>
                        </TableHeader>
                        {children}
                    </Table>
                </div>
            </div>
            {!hidePagination && (
                <TablePagination
                    ref={pageRef}
                    labelRowsPerPage='每頁顯示數量'
                    count={totalCount}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    page={pageOffset}
                    rowsPerPage={pageLimit}
                    rowsPerPageOptions={rowsPerPageOptions}
                    className="border-0 border-t border-solid border-border px-5 pb-3"
                />
            )}
        </Card>
    )
}

ManagementTable.propTypes = {
    title: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    excelData: PropTypes.array,
    excelFilename: PropTypes.string,
    tableHead: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    pageLimit: PropTypes.number.isRequired,
    pageOffset: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    rowsPerPageOptions: PropTypes.array,
    minWidth: PropTypes.number,
    headerAction: PropTypes.node,
    className: PropTypes.any,
    hidePagination: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium']),
}

export default ManagementTable
