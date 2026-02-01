/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import GenericMoreButton from 'components/GenericMoreButton'
import { format } from 'date-fns'
import idx from 'idx'
import PropTypes from 'prop-types'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1400,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  paymentLinePay: css({
    width: '50px',
    imageRendering: '-webkit-optimize-contrast',
  }),
}

function Results({ orders, ...rest }) {
  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {orders.length} 筆
      </Typography>
      <Card>
        <CardHeader action={<GenericMoreButton />} title="訂單紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>指定/不指定</TableCell>
                    <TableCell>訂單狀態</TableCell>
                    <TableCell>服務消費(虛虛)</TableCell>
                    <TableCell>店販消費(虛虛)</TableCell>
                    <TableCell>卡券銷售</TableCell>
                    <TableCell>卡券使用</TableCell>
                    <TableCell>扣入金</TableCell>
                    <TableCell>其他付款方式</TableCell>
                    <TableCell>業績合計(含販賣)</TableCell>
                    <TableCell>現金應收</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order.no}
                        <Typography variant="body2">
                          {format(new Date(order.date), 'MM/dd/yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {idx(order, _ => _.customer.name)}
                        <Typography variant="body2">
                          {idx(order, _ => _.customer.cellphone)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {idx(order, _ => _.designer.name)} /{' '}
                        {idx(order, _ => _.designer.designerNo)}
                      </TableCell>
                      <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {Math.round(
                          order.serviceFakeTotal -
                          order.serviceOtherPayFee -
                          order.serviceThirdPartyPayFee
                        )}
                        <Typography variant="body2">
                          {order.serviceOrders
                            .map(d => (d.thirdPartyPayName ? '含 ' + d.thirdPartyPayName : null))
                            .filter(d => d)
                            .join(',')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.productFakeTotal -
                          order.productOtherPayFee -
                          order.productThirdPartyPayFee}
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          order.ticketFakeTotal -
                          order.ticketOtherPayFee -
                          order.ticketThirdPartyPayFee
                        )}
                      </TableCell>
                      <TableCell>{order.useTicketTotal}</TableCell>
                      <TableCell>{order.walletPay}</TableCell>
                      <TableCell>
                        {order.amountByOtherPay}
                        <Typography variant="body2">{order.payType2}</Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          order.serviceFakeTotal -
                          order.serviceOtherPayFee -
                          order.serviceThirdPartyPayFee +
                          order.productFakeTotal -
                          order.productOtherPayFee -
                          order.productThirdPartyPayFee
                        )}
                      </TableCell>
                      <TableCell>{order.cashTotal}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${order.id}`}
                          variant="outlined"
                        >
                          詳情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
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
