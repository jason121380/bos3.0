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
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import { useState, useRef, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
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

export default function UsagedResults({
  className,
  orders,
  employees,
  onChangePage,
  onChangeRowsPerPage,
  page,
  results,
  pagenationLabel,
  roundDecimal,
  ...rest
}) {
  const pageRef = useRef(null)
  const [selectedOrders] = useState([])

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, results])

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {page.offset + 1} /{Math.ceil(results.length / page.limit)}
      </Typography>
      <Card>
        <CardHeader title="卡券使用紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>使用卡券之帳單編號/時間</TableCell>
                    <TableCell>購買卡券之帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>卡券代號</TableCell>
                    <TableCell>卡券使用</TableCell>
                    <TableCell>卡券使用金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow hover key={`${result.id}-${index}`}>
                      <TableCell>
                        {idx(result, _ => _.usageOrder.no)}
                        <Typography>
                          {idx(result, _ => format(_.usageOrder.date, 'MM/dd/yyyy'))}
                        </Typography>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${result.usageOrder.id}`}
                          variant="outlined"
                        >
                          訂單詳細
                        </Button>
                      </TableCell>
                      <TableCell>
                        {idx(result, _ => _.order.no)}
                        <Typography>
                          {idx(result, _ => format(_.order.date, 'MM/dd/yyyy'))}
                        </Typography>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${result.order.id}`}
                          variant="outlined"
                        >
                          訂單詳細
                        </Button>
                      </TableCell>
                      <TableCell>
                        {idx(result, _ => _.order.customer.name + ' ' + _.order.customer.cellphone)}
                      </TableCell>
                      <TableCell>
                        {idx(
                          result,
                          _ => _.order.designer.name + ' ' + _.order.designer.designerNo
                        )}
                      </TableCell>
                      <TableCell>{idx(result, _ => _.no)}</TableCell>
                      <TableCell>{idx(result, _ => _.service.name)}</TableCell>
                      <TableCell>{roundDecimal(idx(result, _ => _.price))}</TableCell>
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
            count={page.count}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={page.offset}
            rowsPerPage={page.limit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar selected={selectedOrders} />
    </div>
  )
}
