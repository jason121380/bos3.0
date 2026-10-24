import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { CSVLink } from "react-csv";
import { maskCustomerName } from 'helper/exportCustomerMask'
import { startOfDay } from 'date-fns'
import pagenationLabel from './../../helper/pagenationLabel'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'

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
                ? maskCustomerName(result.customerName) + ' / ' + result.customerNo
                : maskCustomerName(result.customerName),
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
  if (results.data != null && sortWay === 'DESIGNER') {
    results.data.forEach(data => {
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
  if (results.data != null && sortWay === 'PRODUCTNO') {
    results.data.forEach(data => {
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
  if (results.data != null && sortWay === 'DATE') {
    results.data.forEach(data => {
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
    <div {...rest} className={className}>
      <p className="pb-2 text-caption tabular-nums text-text-secondary">
        {results.totalCount} 筆資料, {results.pageOffset + 1}/
        {Math.ceil(results.totalCount / results.pageLimit)}
      </p>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="店販抽成明細.csv" >
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <CardTitle>店販分類抽成明細</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table dense className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>日期</TableHead>
                <TableHead>帳單編號</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>顧客姓名代號</TableHead>
                <TableHead>商品名稱代號</TableHead>
                <TableHead numeric>實際售價</TableHead>
                <TableHead numeric>數量</TableHead>
                <TableHead numeric>小計</TableHead>
                <TableHead numeric>手續費</TableHead>
                <TableHead numeric>販賣業績(實)</TableHead>
                <TableHead numeric>抽成(方式)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayResults.map((display, i) =>
                display.result.map((data, index) => {
                  if (data.designerName !== '小計') {
                    return (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap tabular-nums">{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell className="tabular-nums">#{data.no}</TableCell>
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
                        <TableCell numeric>{formatNumber(Math.round(data.price))}</TableCell>
                        <TableCell numeric>{formatNumber(data.count)}</TableCell>
                        <TableCell numeric>{formatNumber(data.count * Math.round(data.price))}</TableCell>
                        <TableCell numeric>{formatNumber(Math.round(data.handlingFee))}</TableCell>
                        <TableCell numeric>{formatNumber(Math.round(data.price2))}</TableCell>
                        <TableCell numeric className="whitespace-nowrap">
                          {formatNumber(Math.round(data.commission))}(
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
                        className="moneyFlowCatReportSubtotal bg-surface font-medium"
                        key={index}
                      >
                        <TableCell colSpan={3} />
                        <TableCell className="font-bold">小計</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell numeric className="font-bold">{formatNumber(data.totalCountPrice)}</TableCell>
                        <TableCell numeric className="font-bold">{formatNumber(Math.round(data.totalHandlingFee))}</TableCell>
                        <TableCell numeric className="font-bold">{formatNumber(Math.round(data.totalPrice2))}</TableCell>
                        <TableCell numeric className="font-bold">{formatNumber(Math.round(data.totalCommission))}</TableCell>
                      </TableRow>
                    )
                  }
                })
              )}
              <TableRow>
                <TableCell className="font-bold">合計</TableCell>
                <TableCell colSpan={5}></TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(Math.round(
                    results.data.reduce((total, item) => (total = total + item.count), 0)
                  ))}
                </TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(Math.round(
                    results.data.reduce(
                      (total, item) => (total = total + item.price * item.count),
                      0
                    )
                  ))}
                </TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(Math.round(
                    results.data.reduce((total, item) => (total = total + item.handlingFee), 0)
                  ))}
                </TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(Math.round(
                    results.data.reduce((total, item) => (total = total + item.price2), 0)
                  ))}
                </TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(Math.round(
                    results.data.reduce((total, item) => (total = total + item.commission), 0)
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {/* pageRef 原供 pagenationLabel 改寫 MUI 分頁文字；ui 分頁本身即為中文，保留 ref 於外框 */}
          <div ref={pageRef}>
            <TablePagination
              count={results.totalCount}
              onPageChange={handleOnChangePage}
              onRowsPerPageChange={handleOnChangeRowsPerPage}
              page={results.pageOffset}
              rowsPerPage={results.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
