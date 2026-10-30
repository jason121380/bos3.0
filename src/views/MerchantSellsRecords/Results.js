import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { CSVLink } from "react-csv";
import { maskCustomerName } from 'helper/exportCustomerMask'
import paginationLabel from './../../helper/paginationLabel'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'

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
    // 先複製再排序（查詢結果唯讀）；匯出資料沿用排序後的順序（原本靠原地排序讓 results.data 也變成排序後的順序）
    const sortedData = [...results.data].sort((a, b) => a.order.date - b.order.date)
    setSortedData(sortedData)
    sortedData.forEach(data => {
      excelData.push({
        日期: format(new Date(data.order.date), 'yyyy/MM/dd'),
        帳單編號: `#${data.order.no}`,
        設計師姓名代號: data.seller.designerNo !== ''
          ? data.seller.name + ' / ' + data.seller.designerNo
          : data.seller.name,
        顧客姓名代號: data.order.customer.no
          ? maskCustomerName(data.order.customer.name) + ' / ' + data.order.customer.no
          : maskCustomerName(data.order.customer.name),
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
      paginationLabel(pageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pageRef.current 放進依賴，讓分頁元件掛上 DOM 後的下一次 render 補上中文分頁標籤
  }, [results, pageRef.current])

  return (
    <div {...rest}>
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
          <CardTitle>抽成明細</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table dense className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>日期</TableHead>
                <TableHead>帳單編號</TableHead>
                <TableHead>設計師姓名代號</TableHead>
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
              {sortedData.map(data => (
                <TableRow key={`productOrders-${data.id}`}>
                  <TableCell className="whitespace-nowrap tabular-nums">{format(new Date(data.order.date), 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="tabular-nums">#{data.order.no}</TableCell>
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
              ))}
              <TableRow className="bg-surface font-medium">
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
          {/* pageRef 原供 paginationLabel 改寫 MUI 分頁文字；ui 分頁本身即為中文，保留 ref 於外框 */}
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
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
