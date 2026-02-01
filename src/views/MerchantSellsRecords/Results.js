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
  Button,
} from '@mui/material'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { CSVLink } from "react-csv";
import pagenationLabel from './../../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 900,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
}

function Results({
  customers,
  results,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  ...rest
}) {
  const pageRef = useRef(null)
  const [excelData, setExcelData] = useState([])
  const [sortedData, setSortedData] = useState([])
  useEffect(() => {
    const excelData = []
    const sortedData = results.data.sort((a, b) => a.order.date - b.order.date)
    setSortedData(sortedData)
    results.data.forEach(data => {
      excelData.push({
        日期: format(new Date(data.order.date), 'yyyy/MM/dd'),
        帳單編號: `#${data.order.no}`,
        設計師姓名代號: data.seller.designerNo !== ''
          ? data.seller.name + ' / ' + data.seller.designerNo
          : data.seller.name,
        顧客姓名代號: data.order.customer.no
          ? data.order.customer.name + ' / ' + data.order.customer.no
          : data.order.customer.name,
        商品名稱代號: `${data.product.name}/${data.product.no}`,
        實際售價: Math.round(data.price),
        數量: data.count,
        小計: data.count * Math.round(data.price),
        手續費: Math.round(data.handlingFee),
        '販賣業績(實)': Math.round(data.price2),
        '抽成(方式)': `${Math.round(data.commission)}(${data.rakeType === 'fixed' ? '固定金額' : data.rakeType === 'byCost' ? '毛利' : '售價'
          })`,
      })
    })
    excelData.push({
      日期: '合計',
      帳單編號: "",
      設計師姓名代號: "",
      顧客姓名代號: "",
      商品名稱代號: "",
      實際售價: "",
      數量: Math.round(
        results.data.reduce((total, item) => (total = total + item.count), 0)
      ),
      小計: Math.round(
        results.data.reduce(
          (total, item) => (total = total + item.price * item.count),
          0
        )
      ),
      手續費: Math.round(
        results.data.reduce((total, item) => (total = total + item.handlingFee), 0)
      ),
      '販賣業績(實)': Math.round(
        results.data.reduce((total, item) => (total = total + item.price2), 0)
      ),
      '抽成(方式)': Math.round(
        results.data.reduce((total, item) => (total = total + item.commission), 0)
      ),
    })
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, pageRef.current])

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        {results.totalCount} 筆資料, {results.pageOffset + 1}/
        {Math.ceil(results.totalCount / results.pageLimit)}
      </Typography>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="店販抽成明細.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="抽成明細"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>日期</TableCell>
                    <TableCell>帳單編號</TableCell>
                    <TableCell>設計師姓名代號</TableCell>
                    <TableCell>顧客姓名代號</TableCell>
                    <TableCell>商品名稱代號</TableCell>
                    <TableCell>實際售價</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>小計</TableCell>
                    <TableCell>手續費</TableCell>
                    <TableCell>販賣業績(實)</TableCell>
                    <TableCell>抽成(方式)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map(data => (
                    <TableRow hover key={`productOrders-${data.id}`}>
                      <TableCell>{format(new Date(data.order.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>#{data.order.no}</TableCell>
                      <TableCell>
                        {data.seller.designerNo !== ''
                          ? data.seller.name + ' / ' + data.seller.designerNo
                          : data.seller.name}
                      </TableCell>
                      <TableCell>
                        {data.order.customer.no
                          ? data.order.customer.name + ' / ' + data.order.customer.no
                          : data.order.customer.name}
                      </TableCell>
                      <TableCell>
                        {data.product.no === null
                          ? data.product.name
                          : data.product.name + ' / ' + data.product.no}
                      </TableCell>
                      <TableCell>{Math.round(data.price)}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{data.count * Math.round(data.price)}</TableCell>
                      <TableCell>{Math.round(data.handlingFee)}</TableCell>
                      <TableCell>{Math.round(data.price2)}</TableCell>
                      <TableCell>
                        {Math.round(data.commission)}(
                        {data.rakeType === 'fixed'
                          ? '固定金額'
                          : data.rakeType === 'byCost'
                            ? '毛利'
                            : '售價'}
                        )
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow hover>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.count), 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        results.data.reduce(
                          (total, item) => (total = total + item.price * item.count),
                          0
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.handlingFee), 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.price2), 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.commission), 0)
                      )}
                    </TableCell>
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
            count={results.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={results.pageOffset}
            rowsPerPage={results.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
    </div>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
