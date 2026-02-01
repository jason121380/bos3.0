/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    '& .MuiTypography-root': {
      whiteSpace: 'nowrap'
    },
    '& td': {
      whiteSpace: 'nowrap !important'
    }
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
}

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
  }, [profileOrders.loading, page, rowsPerPage, pageRef.current])

  useEffect(() => {
    if (orders.length === 0) return
    const display = orders.some(({ raffleCount }) => raffleCount > 0)
    setRaffleDisplay(display)
  }, [orders])

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {totalCount} 筆, {page + 1} / {Math.ceil(totalCount / rowsPerPage)}
      </Typography>
      <Card>
        <CardHeader title="訂單列表" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>
                    <TableCell>帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>指定/不指定</TableCell>
                    {raffleDisplay ? <TableCell>活動券</TableCell> : null}
                    <TableCell>服務消費</TableCell>
                    <TableCell>店販消費</TableCell>
                    {membershipDisplay && <TableCell>會員卡消費</TableCell>}
                    <TableCell>卡券使用</TableCell>
                    <TableCell>卡券銷售(預收款)</TableCell>
                    <TableCell>扣入金</TableCell>
                    {bonusDisplay && <TableCell>點數折抵金額</TableCell>}
                    <TableCell>其他付款方式</TableCell>
                    <TableCell>業績合計(含販賣)</TableCell>
                    <TableCell>現金應收</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
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
                      <TableCell>
                        #{order.orderNo}
                        <Typography variant="body2">
                          {format(new Date(order.date), 'MM/dd/yyyy')}/
                          {weekDisplay(format(new Date(order.date), 'eeee'))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.customerName}
                        <Typography variant="body2">{order.customerCellphone}</Typography>
                      </TableCell>
                      <TableCell>
                        {order.designerName}
                        {order.designerNo ? `/${order.designerNo}` : ''}
                      </TableCell>
                      <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                      {raffleDisplay ? <TableCell>{order.raffleCount}</TableCell> : null}
                      <TableCell>
                        {Math.round(order.service)}
                        <Typography variant="body2">
                          {order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round(order.product)}
                        <Typography variant="body2">
                          {order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}
                        </Typography>
                      </TableCell>
                      {membershipDisplay && (
                        <TableCell>
                          {Math.round(order.membership)}
                          <Typography variant="body2">
                            {order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>{Math.round(order.ticketSellIntoPerformance)}</TableCell>
                      <TableCell>
                        {order.ticketSellNotIntoPerformance}
                      </TableCell>
                      <TableCell>{order.walletUsedForDecount}</TableCell>
                      {bonusDisplay && <TableCell>{order.bonusDecountForReport}</TableCell>}
                      <TableCell>
                        {order.otherPayWayForDecount}
                        <Typography variant="body2">{order.otherPayName}</Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          order.service + order.product + order.usedTicket + order.membership
                        )}
                      </TableCell>
                      <TableCell>{order.businessCash}</TableCell>
                      <TableCell>{order.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[1, 5, 10, 25, 50, 1000]}
          />
        </CardActions>
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
