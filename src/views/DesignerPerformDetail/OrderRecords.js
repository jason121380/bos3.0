import GenericMoreButton from 'components/GenericMoreButton'
import { format } from 'date-fns'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ orders, ...rest }) {
  return (
    <div {...rest}>
      <p className="pb-2 text-label tabular-nums text-text-secondary">
        共 {orders.length} 筆
      </p>
      <Card>
        <CardHeader action={<GenericMoreButton />} className="items-center pb-4">
          <CardTitle>訂單紀錄</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1400px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>帳單編號/時間</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>指定/不指定</TableHead>
                <TableHead>訂單狀態</TableHead>
                <TableHead numeric>服務消費(虛虛)</TableHead>
                <TableHead numeric>店販消費(虛虛)</TableHead>
                <TableHead numeric>卡券銷售</TableHead>
                <TableHead numeric>卡券使用</TableHead>
                <TableHead numeric>扣入金</TableHead>
                <TableHead numeric>其他付款方式</TableHead>
                <TableHead numeric>業績合計(含販賣)</TableHead>
                <TableHead numeric>現金應收</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium tabular-nums">{order.no}</div>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {format(new Date(order.date), 'MM/dd/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {idx(order, _ => _.customer.name)}
                    <div className="text-caption tabular-nums text-text-secondary">
                      {idx(order, _ => _.customer.cellphone)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {idx(order, _ => _.designer.name)} /{' '}
                    {idx(order, _ => _.designer.designerNo)}
                  </TableCell>
                  <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      order.serviceFakeTotal -
                      order.serviceOtherPayFee -
                      order.serviceThirdPartyPayFee
                    ))}
                    <div className="text-caption text-text-secondary">
                      {order.serviceOrders
                        .map(d => (d.thirdPartyPayName ? '含 ' + d.thirdPartyPayName : null))
                        .filter(d => d)
                        .join(',')}
                    </div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(order.productFakeTotal -
                      order.productOtherPayFee -
                      order.productThirdPartyPayFee)}
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      order.ticketFakeTotal -
                      order.ticketOtherPayFee -
                      order.ticketThirdPartyPayFee
                    ))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(order.useTicketTotal)}</TableCell>
                  <TableCell numeric>{formatNumber(order.walletPay)}</TableCell>
                  <TableCell numeric>
                    {formatNumber(order.amountByOtherPay)}
                    <div className="text-caption text-text-secondary">{order.payType2}</div>
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      order.serviceFakeTotal -
                      order.serviceOtherPayFee -
                      order.serviceThirdPartyPayFee +
                      order.productFakeTotal -
                      order.productOtherPayFee -
                      order.productThirdPartyPayFee
                    ))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(order.cashTotal)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink to={`/order/${order.id}`}>
                        詳情
                      </RouterLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
