/** @jsxImportSource @emotion/react */
import {
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
import idx from 'idx'
import format from 'date-fns/format'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
}

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
    <div {...rest} css={styles.root}>
      <Card>
        <CardHeader title="消費記錄" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>訂單編號</TableCell>
                    <TableCell>消費時間</TableCell>
                    <TableCell>消費項目</TableCell>
                    <TableCell>金額</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>付款方式</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((data, index) => (
                    <TableRow hover key={`${data.id}-${index}`}>
                      <TableCell>{data.no}</TableCell>
                      <TableCell>{format(data.date, 'yyyy/M/d')}</TableCell>
                      <TableCell>
                        <Typography noWrap>{data.previewItem.join('、')}</Typography>
                      </TableCell>
                      <TableCell>
                        $
                        {data.productOrders.reduce(
                          (total, item) => (total = total + item.price),
                          0
                        ) +
                          data.serviceOrders.reduce(
                            (total, item) => (total = total + item.price),
                            0
                          ) +
                          data.ticketOrders.reduce(
                            (total, item) => (total = total + item.price),
                            0
                          ) +
                          data.useTicketOrders.reduce(
                            (total, item) => (total = total + item.price),
                            0
                          )}
                      </TableCell>
                      <TableCell>{idx(data, _ => _.designer.name)}</TableCell>
                      <TableCell>{data.payType.join('、')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={pageOffset}
            rowsPerPage={pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
    </div>
  )
}
export default Consumption
