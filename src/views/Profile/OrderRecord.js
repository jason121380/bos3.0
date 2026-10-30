import { format } from 'date-fns'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

const weekDisplay = week => {
  switch (week) {
    case 'Monday':
      return '(一)'
    case 'Tuesday':
      return '(二)'
    case 'Wednesday':
      return '(三)'
    case 'Thursday':
      return '(四)'
    case 'Friday':
      return '(五)'
    case 'Saturday':
      return '(六)'
    case 'Sunday':
      return '(日)'
    default:
      break
  }
}

function OrderRecord({
  profileOrders,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  page,
  totalCount,
  rowsPerPage,
  bonusDisplay,
  loading,
  membershipDisplay,
  pagenationLabel,
  ...rest
}) {
  const pageRef = useRef(null)
  const [orders, setOrders] = useState([])
  const [raffleDisplay, setRaffleDisplay] = useState(false)

  const renderTpName = names => {
    let returnString = ''
    const arr = names.map(d => d)
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }

  useEffect(() => {
    if (!profileOrders.loading && profileOrders.data !== undefined) {
      const data = idx(profileOrders, _ => _.data.getOrderList.orderList).slice(
        rowsPerPage * page, (rowsPerPage * page) + rowsPerPage
      )
      setOrders(data)
      if (pageRef.current) {
        pagenationLabel(pageRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [profileOrders.loading, page, rowsPerPage, pageRef.current] 變動時執行；pagenationLabel、profileOrders 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [profileOrders.loading, page, rowsPerPage, pageRef.current])

  useEffect(() => {
    if (orders.length === 0) return
    const display = orders.some(({ raffleCount }) => raffleCount > 0)
    setRaffleDisplay(display)
  }, [orders])

  // 分頁改用 ui/table 的 TablePagination：ref 原樣保留，pagenationLabel 找不到 MUI 元素時不動作
  return (
    <div {...rest}>
      <p className="pb-2 text-label tabular-nums text-text-secondary">
        共 {totalCount} 筆, {page + 1} / {Math.ceil(totalCount / rowsPerPage)}
      </p>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>帳單列表</CardTitle>
        </CardHeader>
        <div className="px-5">
          <Table className="min-w-[1150px] [&_td]:whitespace-nowrap">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>操作</TableHead>
                <TableHead>帳單編號/時間</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>指定/不指定</TableHead>
                {raffleDisplay ? <TableHead numeric>活動券</TableHead> : null}
                <TableHead numeric>服務消費</TableHead>
                <TableHead numeric>店販消費</TableHead>
                {membershipDisplay && <TableHead numeric>會員卡消費</TableHead>}
                <TableHead numeric>卡券使用</TableHead>
                <TableHead numeric>卡券銷售(預收款)</TableHead>
                <TableHead numeric>扣入金</TableHead>
                {bonusDisplay && <TableHead numeric>點數折抵金額</TableHead>}
                <TableHead numeric>其他付款方式</TableHead>
                <TableHead numeric>業績合計(含販賣)</TableHead>
                <TableHead numeric>現金應收</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink to={`/order/${order.id}`}>
                        詳情
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium tabular-nums">#{order.orderNo}</div>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {format(new Date(order.date), 'yyyy/MM/dd')}/
                      {weekDisplay(format(new Date(order.date), 'eeee'))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.customerName}
                    <div className="text-caption tabular-nums text-text-secondary">{order.customerCellphone}</div>
                  </TableCell>
                  <TableCell>
                    {order.designerName}
                    {order.designerNo ? `/${order.designerNo}` : ''}
                  </TableCell>
                  <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                  {raffleDisplay ? <TableCell numeric>{formatNumber(order.raffleCount)}</TableCell> : null}
                  <TableCell numeric>
                    {formatNumber(Math.round(order.service))}
                    <div className="text-caption text-text-secondary">
                      {order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}
                    </div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(order.product))}
                    <div className="text-caption text-text-secondary">
                      {order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}
                    </div>
                  </TableCell>
                  {membershipDisplay && (
                    <TableCell numeric>
                      {formatNumber(Math.round(order.membership))}
                      <div className="text-caption text-text-secondary">
                        {order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}
                      </div>
                    </TableCell>
                  )}
                  <TableCell numeric>{formatNumber(Math.round(order.ticketSellIntoPerformance))}</TableCell>
                  <TableCell numeric>
                    {formatNumber(order.ticketSellNotIntoPerformance)}
                  </TableCell>
                  <TableCell numeric>{formatNumber(order.walletUsedForDecount)}</TableCell>
                  {bonusDisplay && <TableCell numeric>{formatNumber(order.bonusDecountForReport)}</TableCell>}
                  <TableCell numeric>
                    {formatNumber(order.otherPayWayForDecount)}
                    <div className="text-caption text-text-secondary">{order.otherPayName}</div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      order.service + order.product + order.usedTicket + order.membership
                    ))}
                  </TableCell>
                  <TableCell numeric className="font-medium">{formatNumber(order.businessCash)}</TableCell>
                  <TableCell className="text-text-secondary">{order.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end px-2 pb-2">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            count={totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
    </div>
  )
}

OrderRecord.propTypes = {
  orders: PropTypes.array,
}

OrderRecord.defaultProps = {
  orders: [],
}

export default OrderRecord
