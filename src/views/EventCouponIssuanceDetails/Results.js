/** @jsxImportSource @emotion/react */
import {
  Card, Table, TableBody, TableCell, TableHead, CardActions,
  TableRow, TableContainer, TablePagination, Typography
} from '@mui/material'
import { Fragment, useRef, useEffect } from 'react'
import pagenationLabel from '../../helper/pagenationLabel'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: 24,
    '& .MuiTableCell-root': {
      whiteSpace: 'nowrap !important'
    }
  }),
  cursor: css({
    cursor: 'pointer',
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  orderNoLink: css({
    textDecorationLine: 'underline',
    color: 'black',
  }),
}

function Results({ recordData, pageSetting, onPageChange, onRowsPerPageChange }) {
  const pageRef1 = useRef(null)
  const pageRef2 = useRef(null)

  useEffect(() => {
    if (pageRef1.current) {
      pagenationLabel(pageRef1.current)
    }
    if (pageRef2.current) {
      pagenationLabel(pageRef2.current)
    }
  }, [pageRef1.current, pageRef2.current, pageSetting])

  return (
    <Fragment>
      {recordData.length ?
        <Card css={styles.root}>
          <CardActions css={styles.actions}>
            <TablePagination
              ref={pageRef1}
              labelRowsPerPage='每頁顯示數量'
              component="div"
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              count={pageSetting.totalCount}
              page={pageSetting.pageOffset}
              rowsPerPage={pageSetting.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </CardActions>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>流水號</TableCell>
                  <TableCell>活動名稱</TableCell>
                  <TableCell>規則名稱</TableCell>
                  <TableCell>訂單日期</TableCell>
                  <TableCell>訂單編號</TableCell>
                  <TableCell>顧客姓名</TableCell>
                  <TableCell>顧客手機</TableCell>
                  <TableCell>使用手機端</TableCell>
                  <TableCell>寄送簡訊</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordData.map(d => (
                  <TableRow key={d.number} hover>
                    <TableCell>{d.number}</TableCell>
                    <TableCell>{d.eventName}</TableCell>
                    <TableCell>{d.ruleName}</TableCell>
                    <TableCell>{format(d.orderDate, 'yyyy/M/d')}</TableCell>
                    <TableCell>
                      <a
                        target='_blank'
                        href={`/order/${d.orderId}`}
                        css={styles.orderNoLink}
                      >{d.orderNo === null ? '' : `#${d.orderNo}`}</a>
                    </TableCell>
                    <TableCell>{d.customerName}</TableCell>
                    <TableCell>{d.customerCellphone}</TableCell>
                    <TableCell>{d.isCustomerSideUsing ? '是' : '否'}</TableCell>
                    <TableCell>{d.isSMSSended ? '是' : '否'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CardActions css={styles.actions}>
            <TablePagination
              ref={pageRef2}
              labelRowsPerPage='每頁顯示數量'
              component="div"
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              count={pageSetting.totalCount}
              page={pageSetting.pageOffset}
              rowsPerPage={pageSetting.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </CardActions>
        </Card>
        :
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: 100 }}>無資料</Typography>
      }
    </Fragment>
  )
}
export default Results
