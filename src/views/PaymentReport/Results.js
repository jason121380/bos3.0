import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CSVLink } from "react-csv";
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { HeaderActionsPortal } from 'ui/page-header'

function Results({ report, paymentsName }) {
  const [totalArr, setTotalArr] = useState([])
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    const init = []
    const excelData = []
    if (report !== undefined) {
      for (let i = 0; i < paymentsName.length; i++) {
        init.push(0)
      }
      report.forEach(data => {
        const obj = {}
        obj['日期'] = format(data.date, 'yyyy/MM/dd')
        if (data.payTypeDetail.length !== 0) {
          paymentsName.forEach((payment, index) => {
            if (data.payTypeDetail.find(d => d.name === payment)) {
              init[index] += data.payTypeDetail.find(d => d.name === payment).price
              obj[payment] = data.payTypeDetail.find(d => d.name === payment).price
            }
          })
          excelData.push(obj)
        }
      })
      setTotalArr(init)
      const obj2 = {}
      obj2['日期'] = '合計'
      paymentsName.forEach((payment, index) => {
        obj2[payment] = init[index]
      })
      excelData.push(obj2)
      setExcelData(excelData)
    }
  }, [report])
  return (
    <Card>
      {/* 報表匯出：畫到頁首（STYLE §14），匯出資料不變 */}
      <HeaderActionsPortal>
        <Button asChild variant="secondary">
          <CSVLink
            data={excelData}
            filename="每日非現金明細.csv"
          >
            <Download strokeWidth={1.75} />
            報表匯出
          </CSVLink>
        </Button>
      </HeaderActionsPortal>
      <CardHeader className="items-center pb-4">
        <CardTitle>每日非現金明細</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table dense className="min-w-[650px]" aria-label="a dense table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>日期</TableHead>
              {paymentsName.map(payment => (
                <TableHead numeric key={payment}>{payment}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.map((data, index) => {
              if (data.payTypeDetail.length === 0) {
                return (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap tabular-nums">{format(data.date, 'yyyy/MM/dd')}</TableCell>
                    {paymentsName.map(payment => (
                      <TableCell key={payment}/>
                    ))}
                  </TableRow>
                )
              } else {
                return (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap tabular-nums">{format(data.date, 'yyyy/MM/dd')}</TableCell>
                    {paymentsName.map(payment => {
                      if (data.payTypeDetail.find(d => d.name === payment) !== undefined) {
                        return (
                          <TableCell numeric key={payment}>
                            {formatNumber(data.payTypeDetail.find(d => d.name === payment).price)}
                          </TableCell>
                        )
                      } else {
                        return <TableCell key={payment} />
                      }
                    })}
                  </TableRow>
                )
              }
            })}
            <TableRow className="bg-surface font-medium">
              <TableCell className="font-bold">合計</TableCell>
              {totalArr.map((sum, index) => (
                <TableCell numeric className="font-bold" key={`${index}`}>{formatNumber(sum)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
