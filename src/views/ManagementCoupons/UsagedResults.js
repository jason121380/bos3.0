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
import idx from 'idx'
import format from 'date-fns/format'
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
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-action': {
      marginTop: 0
    }
  })
}

export default function UsagedResults({
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
  const [csvData, setCsvData] = useState([])
  const totalPrice = () => {
    const price = results.reduce((acc, cur) => acc + roundDecimal(cur.price), 0)
    return roundDecimal(price)
  }

  useEffect(() => {
    const csvData = []
    results.forEach(data => {
      csvData.push({
        '使用卡券之帳單編號/時間': `#${data.usageOrder.no}_${format(data.usageOrder.date, 'yyyy/MM/dd')}`,
        '購買卡券之帳單編號/時間': `#${data.order.no}_${format(data.order.date, 'yyyy/MM/dd')}`,
        '客戶': `${data.order.customer.name} ${data.order.customer.cellphone}`,
        '設計師': `${data.order.designer.name} ${data.order.designer.designerNo}`,
        '卡券代號': `${data.no}`,
        '卡券使用': `${data.service.name}`,
        '卡券使用金額': `${roundDecimal(data.price)}`
      })
    });
    csvData.push({
      '使用卡券之帳單編號/時間': '',
      '購買卡券之帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券使用': '合計',
      '卡券使用金額': totalPrice()
    })
    setCsvData(csvData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, pageRef.current])

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {page.offset + 1} /{Math.ceil(results.length / page.limit)}
      </Typography>
      <Card>
        <CardHeader css={styles.cardHeader} action={
          <CSVLink data={csvData} filename="卡券使用紀錄.csv" >
            <Button variant="contained" color="primary" size="small">
              報表匯出
            </Button>
          </CSVLink>
        } title="卡券使用紀錄" />
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
                          {idx(result, _ => format(_.usageOrder.date, 'yyyy/MM/dd'))}
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
                          {idx(result, _ => format(_.order.date, 'yyyy/MM/dd'))}
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
                          _ => _.usageOrder.designer.name + ' ' + _.usageOrder.designer.designerNo
                        )}
                      </TableCell>
                      <TableCell>{idx(result, _ => _.no)}</TableCell>
                      <TableCell>{idx(result, _ => _.service.name)}</TableCell>
                      <TableCell>{roundDecimal(idx(result, _ => _.price))}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} />
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{totalPrice()}</TableCell>
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
