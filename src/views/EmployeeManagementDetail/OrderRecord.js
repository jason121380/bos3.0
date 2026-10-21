import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import pagenationLabel from './../../helper/pagenationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'

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

function OrderRecord({ results, page, onChangePage, onChangeRowsPerPage, membershipDisplay, bonusDisplay, ...rest }) {
  const [orders, setOrders] = useState([])
  const [raffleDisplay, setRaffleDisplay] = useState(false)
  const pageRef = useRef(null)

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
    const data = results.slice(
      page.limit * page.offset,
      (page.limit * page.offset) + page.limit
    )
    setOrders(data)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, page.limit, page.offset, pageRef.current])

  useEffect(() => {
    if (orders.length === 0) return
    const display = orders.some(({ raffleCount }) => raffleCount > 0)
    setRaffleDisplay(display)
  }, [orders])

  return (
    <div {...rest}>
      <p className="mb-2 text-label tabular-nums text-text-secondary">
        共 {results.length} 筆, {page.offset + 1} / {Math.ceil(results.length / page.limit)}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>帳單列表</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 pt-4">
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
              {orders.map((data, index) => (
                <TableRow key={data.id} data-testid={`order-row`}>
                  <TableCell>
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink
                        to={`/order/${data.id}`}
                        data-testid={`order-${index}`}
                      >
                        詳情
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium tabular-nums">#{data.orderNo}</div>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {format(new Date(data.date), 'yyyy/MM/dd')}/
                      {weekDisplay(format(new Date(data.date), 'eeee'))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {data.customerName}
                    <div className="text-caption tabular-nums text-text-secondary">
                      {data.customerCellphone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {data.designerName}
                    {data.designerNo ? `/${data.designerNo}` : ''}
                  </TableCell>
                  <TableCell>{data.isDesignate ? 'Y' : 'N'}</TableCell>
                  {raffleDisplay ? <TableCell numeric>{data.raffleCount}</TableCell> : null}
                  <TableCell numeric>
                    {formatNumber(Math.round(data.service))}
                    <div className="text-caption text-text-secondary">
                      {data.TPTName.service.length > 0 && renderTpName(data.TPTName.service)}
                    </div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(data.product))}
                    <div className="text-caption text-text-secondary">
                      {data.TPTName.product.length > 0 && renderTpName(data.TPTName.product)}
                    </div>
                  </TableCell>
                  {membershipDisplay && (
                    <TableCell numeric>
                      {formatNumber(Math.round(data.membership))}
                      <div className="text-caption text-text-secondary">
                        {data.TPTName.membership.length > 0 && renderTpName(data.TPTName.membership)}
                      </div>
                    </TableCell>
                  )}
                  <TableCell numeric>{formatNumber(Math.round(data.ticketSellIntoPerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(data.ticketSellNotIntoPerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(data.walletUsedForDecount)}</TableCell>
                  {bonusDisplay && <TableCell numeric>{formatNumber(data.bonusDecountForReport)}</TableCell>}
                  <TableCell numeric>
                    {formatNumber(data.otherPayWayForDecount)}
                    <div className="text-caption text-text-secondary">{data.otherPayName}</div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      data.service + data.product + data.usedTicket + data.membership
                    ))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(data.businessCash)}</TableCell>
                  <TableCell>{data.remark}</TableCell>
                </TableRow>
              )
              )}
            </TableBody>
          </Table>
          {/* pageRef 保留：pagenationLabel 只改寫 MUI 分頁文字，新分頁元件已是中文，查無元素時不動作 */}
          <div ref={pageRef}>
            <TablePagination
              count={page.count}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              page={page.offset}
              rowsPerPage={page.limit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </div>
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
