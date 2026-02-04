import {
  Card, Table, TableBody, TableCell, TableHead, CardActions,
  TableRow, TableContainer, TablePagination, Typography, CardHeader, CardContent
} from '@mui/material'
import { Fragment, useRef, useEffect } from 'react'
import pagenationLabel from '../../helper/pagenationLabel'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(1),
  }),
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 900,
    '& td': {
      whiteSpace: 'nowrap !important'
    },
  }),
  tableHead: css({
    backgroundColor: '#FFFFFF',
    '& .MuiTableCell-head': {
      color: '#212121',
      fontWeight: 'bold',
      borderBottom: '1px solid #f0f0f0',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
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
    color: '#1A73E8',
    fontWeight: '500',
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
    <div css={styles.root}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                發券明細清單
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {pageSetting.totalCount} 筆資料
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          {recordData.length ? (
            <Fragment>
              <TableContainer>
                <Table size="small">
                  <TableHead css={styles.tableHead}>
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
                      <TableRow key={d.number} css={styles.tableRow}>
                        <TableCell>{d.number}</TableCell>
                        <TableCell style={{ fontWeight: '500' }}>{d.eventName}</TableCell>
                        <TableCell>{d.ruleName}</TableCell>
                        <TableCell>{format(d.orderDate, 'yyyy/MM/dd')}</TableCell>
                        <TableCell>
                          <a
                            target='_blank'
                            href={`/order/${d.orderId}`}
                            css={styles.orderNoLink}
                            rel="noreferrer"
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
                  ref={pageRef1}
                  labelRowsPerPage='每頁顯示數量'
                  component="div"
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
                  count={pageSetting.totalCount}
                  page={pageSetting.pageOffset}
                  rowsPerPage={pageSetting.pageLimit}
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
              </CardActions>
            </Fragment>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Typography color="textSecondary">無發券明細資料</Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export default Results
