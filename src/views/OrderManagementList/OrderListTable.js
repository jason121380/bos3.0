import React, { Fragment } from 'react'
import LazyCSVLink from 'components/LazyCSVLink'
import { ChevronsDownUp, ChevronsUpDown, Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'
import OrderListRow from './OrderListRow'
import { STICKY_ACTION_HEAD, STICKY_NO_HEAD } from './orderListHelpers'

// 帳單列表卡片（標題列、表頭、各列）；自 ResultsV2.js 原樣搬出，state 與 handler 由 props 傳入
export default function OrderListTable({
  allExtend,
  setAllExtend,
  getExcelData,
  totalCount,
  selectedOrders,
  noCloseOrder,
  handleSelectAll,
  orders,
  raffleDisplay,
  membershipDisplay,
  bonusDisplay,
  selectedOrderSet,
  handleSelectOne,
  isExtended,
  orderStaticDetailLoading,
  handleOrderExtend,
  handlePrintOrder,
  disabled,
  printLoading,
  printOrderId,
  locationSearch,
  serialNumberUsing,
}) {
  return (
    <Card className="mt-6">
      <CardHeader
        // 手機寬度空間不夠時，按鈕整組換到下一行，標題與筆數不被擠成直排（2026/10/30 瀏覽器驗收）
        className="flex-wrap items-center pb-4"
        action={
          <Fragment>
            <Button size="sm" variant="secondary" onClick={() => setAllExtend(!allExtend)}>
              {allExtend ? <ChevronsDownUp strokeWidth={1.75} /> : <ChevronsUpDown strokeWidth={1.75} />}
              {allExtend ? '全部收合' : '全部展開'}
            </Button>
            <Button asChild size="sm" variant="secondary">
              {/* 按下才產生 CSV（效能修正 A）；內容與原本 react-csv CSVLink 逐字相同 */}
              <LazyCSVLink getData={getExcelData} filename="帳單列表.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </LazyCSVLink>
            </Button>
          </Fragment>
        }
      >
        <div className="flex items-baseline gap-3 whitespace-nowrap">
          <CardTitle>帳單列表</CardTitle>
          <span className="text-label text-text-secondary tabular-nums" data-testid="result-counter">
            共 {totalCount} 筆
          </span>
        </div>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[1400px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={STICKY_ACTION_HEAD}>
                <Checkbox
                  aria-label="全選"
                  checked={selectedOrders.length === noCloseOrder.length && noCloseOrder.length > 0}
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < noCloseOrder.length}
                  onChange={handleSelectAll}
                  disabled={orders.length === 0}
                />
              </TableHead>
              <TableHead className={cn('min-w-[150px]', STICKY_NO_HEAD)}>帳單編號/時間</TableHead>
              <TableHead className="min-w-[150px]">客戶</TableHead>
              <TableHead>設計師</TableHead>
              <TableHead>指定</TableHead>
              {raffleDisplay ? <TableHead numeric>活動券</TableHead> : null}
              <TableHead numeric className="text-text">
                營業現金應收
              </TableHead>
              <TableHead numeric>服務消費</TableHead>
              <TableHead numeric>店販消費</TableHead>
              {membershipDisplay && <TableHead numeric>會員卡販賣</TableHead>}
              <TableHead numeric>卡券使用 (入業績)</TableHead>
              <TableHead numeric>卡券販賣 (入業績)</TableHead>
              <TableHead numeric>業績收入</TableHead>
              <TableHead numeric>卡券販賣 (不入業績)</TableHead>
              <TableHead numeric>卡券使用(-)</TableHead>
              <TableHead numeric>第三方卡券(-)</TableHead>
              <TableHead numeric>其他付款方式(-)</TableHead>
              <TableHead numeric>入金使用(-)</TableHead>
              {bonusDisplay && <TableHead numeric>點數折抵金額(-)</TableHead>}
              <TableHead>備註</TableHead>
              <TableHead>帳單來源</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody id="whiteSpace">
            {orders.length > 0 &&
              orders.map((order, index) => (
                <OrderListRow
                  key={order.id}
                  order={order}
                  index={index}
                  // 列元件 memo（效能修正 A）：只傳這一列用得到的值（布林／字串）與固定身分的 handler，其他列的狀態變動不會重畫這一列
                  selected={selectedOrderSet.has(order.id)}
                  handleSelectOne={handleSelectOne}
                  extended={isExtended(order.id)}
                  orderStaticDetailLoading={orderStaticDetailLoading}
                  handleOrderExtend={handleOrderExtend}
                  handlePrintOrder={handlePrintOrder}
                  disabled={disabled}
                  printing={printLoading && printOrderId === order.id}
                  locationSearch={locationSearch}
                  serialNumberUsing={serialNumberUsing}
                  raffleDisplay={raffleDisplay}
                  membershipDisplay={membershipDisplay}
                  bonusDisplay={bonusDisplay}
                />
              ))}
          </TableBody>
        </Table>
        {orders.length === 0 && <EmptyState title="此區間沒有帳單" description="調整日期或篩選條件後再試一次。" />}
      </div>
    </Card>
  )
}
