/** @jsxImportSource @emotion/react */
// 表格外框（className="ProductInventoryListTable"）即為 window.print() 的列印輸出：列印規則只以此 class 與 table／th／td 元素命中（不依賴 MUI class），
// 改用 ui/table 並以 wrapperClassName 保留；螢幕上的最大高度改為 Tailwind，列印時由 .ProductInventoryListTable { max-height: unset !important } 解除
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  medals: css({
    fontSize: '19px',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
  noData: css({
    fontSize: 24,
    textAlign: 'center'
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--background)) !important',
    },
  }),
}

function Results({ reportData }) {
  return (
    <>
      {reportData.length === 0 ? (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-baseline gap-3">
              <CardTitle>商品庫存列表</CardTitle>
              <span className="text-label tabular-nums text-text-secondary">
                共 {reportData.length} 筆
              </span>
            </div>
          </CardHeader>
          <div>
            <Table
              dense
              wrapperClassName='ProductInventoryListTable max-h-[calc(100vh-360px)] overflow-y-auto'
              className="min-w-[650px]"
              aria-label="a dense table"
            >
              <TableHeader>
                {/* 表頭 sticky：捲動容器是 ui/table 外框，底色用 surface（與卡片同色）避免捲動時透出內容；列印回到 static */}
                <TableRow className="sticky top-0 z-[100] bg-surface hover:bg-surface print:static">
                  <TableHead>代號</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead numeric>數量</TableHead>
                  <TableHead>類別</TableHead>
                  <TableHead>廠商</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((d, index) => (
                  <TableRow key={`${d.productNo}-${d.name}-${index}`}>
                    <TableCell>{d.productNo || <small className="text-caption text-text-tertiary">{`(無代號)`}</small>}</TableCell>
                    <TableCell>{d.productName}</TableCell>
                    <TableCell numeric>{d.count}</TableCell>
                    <TableCell>{d.productCategory}</TableCell>
                    <TableCell>{d.vendorName || <small className="text-caption text-text-tertiary">{`(無廠商)`}</small>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
}

Results.defaultProps = {
  reportData: [],
}

export default Results