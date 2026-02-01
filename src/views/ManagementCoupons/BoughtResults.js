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
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
    padding: '0px !important',
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1) + '!important',
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-action': {
      marginTop: 0
    }
  }),
  fontWeight: css({
    '& td': {
      fontWeight: 'bold'
    }
  })
}

export default function BoughtResults({
  className,
  results,
  page,
  onChangePage,
  onChangeRowsPerPage,
  pagenationLabel,
  roundDecimal,
  ...rest
}) {
  const { pageOffset, pageLimit } = page
  const [csvData, setCsvData] = useState([])
  const [reportData, setReportData] = useState([])
  const pageRef = useRef(null)

  const handleCountTotal = key => {
    if (key === 'price') {
      return roundDecimal(reportData.reduce((acc, cur) => acc + roundDecimal(cur.price), 0))
    } else {
      return reportData.reduce((acc, cur) => acc + cur[key], 0)
    }
  }

  useEffect(() => {
    setReportData(results.slice(pageOffset * pageLimit, (pageOffset * pageLimit) + pageLimit))
  }, [results, page])

  useEffect(() => {
    const csvData = []
    reportData.forEach(data => {
      csvData.push({
        '帳單編號/時間': `#${data.orderNo}_${format(data.orderDate, 'yyyy/MM/dd')}`,
        '客戶': `${data.customerName} ${data.customerPhone}`,
        '設計師': `${data.designerName} ${data.designerNo}`,
        '卡券代號': `${data.ticketNo}`,
        '卡券販賣': `${data.ticketName}`,
        '卡券販賣金額': `${roundDecimal(data.price)}`,
        '總張數': `${data.totalCount}`,
        '剩餘張數': `${data.leftCount}`
      })
    });
    csvData.push({
      '帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券販賣': '合計',
      '卡券販賣金額': `${handleCountTotal('price')}`,
      '總張數': `${handleCountTotal('totalCount')}`,
      '剩餘張數': `${handleCountTotal('leftCount')}`
    })
    setCsvData(csvData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [reportData, pageRef.current])


  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {pageOffset + 1} /{Math.ceil(results.length / pageLimit)}
      </Typography>
      <Card>
        <CardHeader css={styles.cardHeader} action={
          <CSVLink data={csvData} filename="卡券販賣紀錄.csv" >
            <Button variant="contained" color="primary" size="small">
              報表匯出
            </Button>
          </CSVLink>
        } title="卡券販賣紀錄" />
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
                    <TableCell>卡券代號</TableCell>
                    <TableCell>卡券販賣</TableCell>
                    <TableCell>卡券販賣金額</TableCell>
                    <TableCell>總張數</TableCell>
                    <TableCell>剩餘張數</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((data, index) => (
                    <TableRow hover key={`${data.id}-${index}`}>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${data.orderId}`}
                          variant="outlined"
                        >
                          訂單詳情
                        </Button>
                      </TableCell>
                      <TableCell>
                        {data.orderNo}
                        <Typography>
                          {format(data.orderDate, 'yyyy/MM/dd')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {data.customerName + ' ' + data.customerPhone}
                      </TableCell>
                      <TableCell>
                        {data.designerName + ' ' + data.designerNo}
                      </TableCell>
                      <TableCell>{data.ticketNo}</TableCell>
                      <TableCell>{data.ticketName}</TableCell>
                      <TableCell>{roundDecimal(data.price)}</TableCell>
                      <TableCell>{data.totalCount}</TableCell>
                      <TableCell>{data.leftCount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow css={styles.fontWeight}>
                    <TableCell colSpan={5} />
                    <TableCell>合計</TableCell>
                    <TableCell>{handleCountTotal('price')}</TableCell>
                    <TableCell>{handleCountTotal('totalCount')}</TableCell>
                    <TableCell>{handleCountTotal('leftCount')}</TableCell>
                  </TableRow>
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
            count={results.length}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={pageOffset}
            rowsPerPage={pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
    </div>
  )
}
