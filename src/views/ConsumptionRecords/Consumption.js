import idx from 'idx'
import format from 'date-fns/format'
import { Card, CardContent } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatMoney } from 'ui/format'
import { TablePagination } from 'ui/table'

function Consumption({
  orders,
  pageLimit,
  pageOffset,
  totalCount,
  onPageChange,
  // refetch,
  ...rest
}) {
  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
    // refetch()
  }
  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
    // refetch()
  }
  return (
    <div {...rest} className="flex flex-col gap-4">
      <h1 className="text-title !font-bold text-text">消費記錄</h1>
      {orders.length === 0 && (
        <Card>
          <EmptyState />
        </Card>
      )}
      {/* 手機版：每筆消費一張卡片，取代寬表格 */}
      {orders.map((data, index) => (
        <Card key={`${data.id}-${index}`}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-caption text-text-secondary">帳單編號</span>
                <span className="break-all text-body tabular-nums text-text">{data.no}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-caption text-text-secondary">消費時間</span>
                <span className="text-body tabular-nums text-text">{format(data.date, 'yyyy/MM/dd')}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-caption text-text-secondary">消費項目</span>
              <p className="text-heading text-text">{data.previewItem.join('、')}</p>
            </div>
            <div className="h-px bg-border" />
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body">
              <dt className="text-label text-text-secondary">金額</dt>
              <dd className="m-0 text-right font-medium tabular-nums text-text">
                {formatMoney(
                  data.productOrders.reduce((total, item) => (total = total + item.price), 0) +
                    data.serviceOrders.reduce((total, item) => (total = total + item.price), 0) +
                    data.ticketOrders.reduce((total, item) => (total = total + item.price), 0) +
                    data.useTicketOrders.reduce((total, item) => (total = total + item.price), 0)
                )}
              </dd>
              <dt className="text-label text-text-secondary">設計師</dt>
              <dd className="m-0 text-right text-text">{idx(data, _ => _.designer.name)}</dd>
              <dt className="text-label text-text-secondary">付款方式</dt>
              <dd className="m-0 text-right text-text">{data.payType.join('、')}</dd>
            </dl>
          </CardContent>
        </Card>
      ))}
      <TablePagination
        className="flex-wrap justify-center pt-0"
        count={totalCount}
        onPageChange={handleOnChangePage}
        onRowsPerPageChange={handleOnChangeRowsPerPage}
        page={pageOffset}
        rowsPerPage={pageLimit}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
      />
    </div>
  )
}
export default Consumption
