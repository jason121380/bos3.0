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
import { startOfDay } from 'date-fns'
import pagenationLabel from './../../helper/pagenationLabel'
import { theme } from '../../theme'
import { css } from '@emotion/react'

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
  className,
  customers,
  results,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  sortWay,
  ...rest
}) {
  const pageRef = useRef(null)
  const [excelData, setExcelData] = useState([])
  const displayResults = []

  useEffect(() => {
    const excelData = []
    if (results.data.length > 0) {
      displayResults.forEach(data => {
        data.result.forEach(result => {
          if (result.designerName !== '小計') {
            excelData.push({
              日期: format(new Date(result.date), 'yyyy/MM/dd'),
              帳單編號: `#${result.no}`,
              姓名: result.designerName,
              '顧客姓名/代號': result.customerNo
                ? result.customerName + ' / ' + result.customerNo
                : result.customerName,
              商品名稱代號: `${result.productName}/${result.productNo}`,
              實際售價: Math.round(result.price),
              數量: result.count,
              小計: result.count * Math.round(result.price),
              手續費: Math.round(result.handlingFee),
              '販賣業績(實)': result.price2,
              '抽成(方式)': `${Math.round(result.commission)}(${result.rakeType === 'fixed'
                  ? '固定金額'
                  : result.rakeType === 'byCost'
                    ? '毛利'
                    : '售價'
                })`,
            })
          } else {
            excelData.push({
              '顧客姓名/代號': '小計',
              小計: result.totalCountPrice,
              手續費: result.totalHandlingFee,
              '販賣業績(實)': result.totalPrice2,
              '抽成(方式)': result.totalCommission,
            })
          }
        })
      })
    }
    const totalCount = Math.round(
      results.data.reduce((total, item) => (total = total + item.count), 0)
    )
    const totalPrice = Math.round(
      results.data.reduce(
        (total, item) => (total = total + item.price * item.count), 0)
    )
    const totalHandlingFee = Math.round(
      results.data.reduce((total, item) => (total = total + item.handlingFee), 0)
    )
    const totalPrice2 = Math.round(
      results.data.reduce((total, item) => (total = total + item.price2), 0)
    )
    const totalCommission = Math.round(
      results.data.reduce((total, item) => (total = total + item.commission), 0)
    )
    excelData.push({
      日期: '合計',
      數量: totalCount,
      小計: totalPrice,
      手續費: totalHandlingFee,
      '販賣業績(實)': totalPrice2,
      '抽成(方式)': totalCommission
    })
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, sortWay, pageRef.current])
  const temp = []
  if (results.data != undefined && sortWay === 'DESIGNER') {
    results.data.map(data => {
      if (!temp.includes(data.seller.id)) {
        temp.push(data.seller.id)
      }
    })
    for (let i = 0; i < temp.length; ++i) {
      const designerResults = []
      let totalCountPrice = 0
      let totalHandlingFee = 0
      let totalCommission = 0
      let totalPrice2 = 0
      const filterDesigner = results.data.filter(data => data.seller.id === temp[i])
      filterDesigner.forEach(data => {
        designerResults.push({
          date: data.order.date,
          no: data.order.no,
          designerName: data.seller.name,
          designerNo: data.seller.designerNo,
          designerId: data.seller.id,
          customerNo: data.order.customer.no,
          customerName: data.order.customer.name,
          productName: data.product.name,
          productNo: data.product.no,
          price: data.price,
          count: data.count,
          handlingFee: data.handlingFee,
          commission: data.commission,
          rakeType: data.rakeType,
          price2: data.price2,
        })

        totalCountPrice += data.count * data.price
        totalHandlingFee += data.handlingFee
        totalCommission += data.commission
        totalPrice2 += data.price2
      })
      designerResults.push({
        designerName: '小計',
        totalCountPrice: totalCountPrice,
        totalHandlingFee: totalHandlingFee,
        totalCommission: totalCommission,
        totalPrice2: totalPrice2,
      })
      displayResults.push({
        result: designerResults,
      })
    }
  }
  if (results.data != undefined && sortWay === 'PRODUCTNO') {
    results.data.map(data => {
      if (!temp.includes(data.product.id)) {
        temp.push(data.product.id)
      }
    })
    for (let i = 0; i < temp.length; ++i) {
      const productResults = []
      let totalCountPrice = 0
      let totalHandlingFee = 0
      let totalCommission = 0
      let totalPrice2 = 0
      const filterDesigner = results.data.filter(data => data.product.id === temp[i])
      filterDesigner.forEach(data => {
        productResults.push({
          date: data.order.date,
          no: data.order.no,
          designerName: data.seller.name,
          designerNo: data.seller.designerNo,
          designerId: data.seller.id,
          customerNo: data.order.customer.no,
          customerName: data.order.customer.name,
          productName: data.product.name,
          productNo: data.product.no,
          price: data.price,
          count: data.count,
          handlingFee: data.handlingFee,
          commission: data.commission,
          rakeType: data.rakeType,
          price2: data.price2,
        })

        totalCountPrice += data.count * data.price
        totalHandlingFee += data.handlingFee
        totalCommission += data.commission
        totalPrice2 += data.price2
      })
      productResults.push({
        designerName: '小計',
        totalCountPrice: totalCountPrice,
        totalHandlingFee: totalHandlingFee,
        totalCommission: totalCommission,
        totalPrice2: totalPrice2,
      })
      displayResults.push({
        result: productResults,
      })
    }
  }
  if (results.data != undefined && sortWay === 'DATE') {
    results.data.map(data => {
      const orderDate = startOfDay(data.order.date).getTime()
      if (!temp.includes(orderDate)) {
        temp.push(orderDate)
      }
    })

    for (let i = 0; i < temp.length; ++i) {
      const dateResults = []
      let totalCountPrice = 0
      let totalHandlingFee = 0
      let totalCommission = 0
      let totalPrice2 = 0
      const filterDate = results.data.filter(data => {
        const orderDate = startOfDay(data.order.date).getTime()
        return orderDate === temp[i]
      })
      filterDate.forEach(data => {
        dateResults.push({
          date: data.order.date,
          no: data.order.no,
          designerName: data.seller.name,
          designerNo: data.seller.designerNo,
          designerId: data.seller.id,
          customerNo: data.order.customer.no,
          customerName: data.order.customer.name,
          productName: data.product.name,
          productNo: data.product.no,
          price: data.price,
          count: data.count,
          handlingFee: data.handlingFee,
          commission: data.commission,
          rakeType: data.rakeType,
          price2: data.price2,
        })

        totalCountPrice += data.count * data.price
        totalHandlingFee += data.handlingFee
        totalCommission += data.commission
        totalPrice2 += data.price2
      })
      dateResults.push({
        designerName: '小計',
        totalCountPrice: totalCountPrice,
        totalHandlingFee: totalHandlingFee,
        totalCommission: totalCommission,
        totalPrice2: totalPrice2,
      })
      displayResults.push({
        result: dateResults,
      })
    }
  }
  return (
    <div {...rest} css={css([styles.root, className])}>
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
          title="店販分類抽成明細"
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
                    <TableCell>姓名</TableCell>
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
                  {displayResults.map((display, i) =>
                    display.result.map((data, index) => {
                      if (data.designerName !== '小計') {
                        return (
                          <TableRow hover key={index}>
                            <TableCell>{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                            <TableCell>#{data.no}</TableCell>
                            <TableCell>
                              {data.designerNo !== ''
                                ? data.designerName + ' / ' + data.designerNo
                                : data.designerName}
                            </TableCell>
                            <TableCell>
                              {data.customerNo
                                ? data.customerName + ' / ' + data.customerNo
                                : data.customerName}
                            </TableCell>
                            <TableCell>
                              {data.productNo === null
                                ? data.productName
                                : data.productName + ' / ' + data.productNo}
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
                        )
                      } else {
                        return (
                          <TableRow
                            className="moneyFlowCatReportSubtotal"
                            style={{ backgroundColor: 'lightgray' }}
                            key={index}
                          >
                            <TableCell colSpan={3} />
                            <TableCell style={{ fontWeight: 'bold' }}>小計</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell style={{ fontWeight: 'bold' }}>{data.totalCountPrice}</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>{Math.round(data.totalHandlingFee)}</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>{Math.round(data.totalPrice2)}</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>{Math.round(data.totalCommission)}</TableCell>
                          </TableRow>
                        )
                      }
                    })
                  )}
                  <TableRow hover>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.count), 0)
                      )}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {Math.round(
                        results.data.reduce(
                          (total, item) => (total = total + item.price * item.count),
                          0
                        )
                      )}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.handlingFee), 0)
                      )}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {Math.round(
                        results.data.reduce((total, item) => (total = total + item.price2), 0)
                      )}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
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
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
