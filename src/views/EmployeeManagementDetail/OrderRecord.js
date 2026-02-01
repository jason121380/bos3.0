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
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import pagenationLabel from './../../helper/pagenationLabel'
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
  paymentLinePay: css({
    width: '50px',
    imageRendering: '-webkit-optimize-contrast',
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
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {page.offset + 1} / {Math.ceil(results.length / page.limit)}
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
                  {orders.map((data, index) => (
                    <TableRow key={data.id} data-testid={`order-row`}>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${data.id}`}
                          variant="outlined"
                          data-testid={`order-${index}`}
                        >
                          詳情
                        </Button>
                      </TableCell>
                      <TableCell>
                        #{data.orderNo}
                        <Typography variant="body2">
                          {format(new Date(data.date), 'MM/dd/yyyy')}/
                          {weekDisplay(format(new Date(data.date), 'eeee'))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {data.customerName}
                        <Typography variant="body2">
                          {data.customerCellphone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {data.designerName}
                        {data.designerNo ? `/${data.designerNo}` : ''}
                      </TableCell>
                      <TableCell>{data.isDesignate ? 'Y' : 'N'}</TableCell>
                      {raffleDisplay ? <TableCell>{data.raffleCount}</TableCell> : null}
                      <TableCell>
                        {Math.round(data.service)}
                        <Typography variant="body2">
                          {data.TPTName.service.length > 0 && renderTpName(data.TPTName.service)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round(data.product)}
                        <Typography variant="body2">
                          {data.TPTName.product.length > 0 && renderTpName(data.TPTName.product)}
                        </Typography>
                      </TableCell>
                      {membershipDisplay && (
                        <TableCell>
                          {Math.round(data.membership)}
                          <Typography variant="body2">
                            {data.TPTName.membership.length > 0 && renderTpName(data.TPTName.membership)}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>{Math.round(data.ticketSellIntoPerformance)}</TableCell>
                      <TableCell>{data.ticketSellNotIntoPerformance}</TableCell>
                      <TableCell>{data.walletUsedForDecount}</TableCell>
                      {bonusDisplay && <TableCell>{data.bonusDecountForReport}</TableCell>}
                      <TableCell>
                        {data.otherPayWayForDecount}
                        <Typography variant="body2">{data.otherPayName}</Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          data.service + data.product + data.usedTicket + data.membership
                        )}
                      </TableCell>
                      <TableCell>{data.businessCash}</TableCell>
                      <TableCell>{data.remark}</TableCell>
                    </TableRow>
                  )
                  )}
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
            count={page.count}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={page.offset}
            rowsPerPage={page.limit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
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
