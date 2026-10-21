import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useEffect, useState, Fragment } from 'react'
import { CSVLink } from "react-csv";
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({
  customers, results, summary, pointSummary, beenAssistedDesigner, ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const [summary2, setSummary2] = useState(0)
  const [pointSummary2, setPointSummary2] = useState(0)

  useEffect(() => {
    if (beenAssistedDesigner !== undefined && results !== undefined) {
      const summary2 = results
        .filter(data => data.designer.id === beenAssistedDesigner)
        .map(order => order.helperFee)
        .reduce((accu, curVal) => (accu += curVal), 0)
      const pointSummary2 = results
        .filter(data => data.designer.id === beenAssistedDesigner)
        .map(order => order.helperPoint)
        .reduce((accu, curVal) => (accu += curVal), 0)
      setSummary2(summary2)
      setPointSummary2(pointSummary2)
    }
    if (results.length > 0) {
      const excelData = []
      if (beenAssistedDesigner === undefined) {
        results.forEach(order => {
          excelData.push({
            日期: format(new Date(order.date), 'yyyy/MM/dd'),
            帳單編號: `#${order.orderNo}`,
            ' 服務項目(互助項目)': `${order.service.name}(${order.helperType})`,
            設計師: order.designer.name,
            互助人: order.helper.name,
            '互助換算金額(方式)': `${order.helperFee}(${order.helperMoneyGivenWay})`,
            點數: order.helperPoint,
            互助扣項方式: order.helperDeductionType === 'onSales'
              ? '依業績'
              : order.helperDeductionType === 'onSalary'
                ? '依薪水'
                : '無扣項',
          })
        })
        excelData.push({
          日期: '合計',
          '互助換算金額(方式)': summary,
          點數: pointSummary,
        })
      } else if (beenAssistedDesigner != null) {
        results
          .filter(data => data.designer.id === beenAssistedDesigner)
          .forEach(order => {
            excelData.push({
              日期: format(new Date(order.date), 'yyyy/MM/dd'),
              帳單編號: `#${order.orderNo}`,
              ' 服務項目(互助項目)': `${order.service.name}(${order.helperType})`,
              設計師: order.designer.name,
              互助人: order.helper.name,
              '互助換算金額(方式)': `${order.helperFee}(${order.helperMoneyGivenWay})`,
              點數: order.helperPoint,
              互助扣項方式: order.helperDeductionType === 'onSales'
                ? '依業績'
                : order.helperDeductionType === 'onSalary'
                  ? '依薪水'
                  : '無扣項',
            })
          })
        excelData.push({
          日期: '合計',
          '互助換算金額(方式)': summary2,
          點數: pointSummary2,
        })
      }
      setExcelData(excelData)
    }
  }, [results, beenAssistedDesigner, summary2, pointSummary2])

  const pointFloatDisplay = point => {
    if (point.toString().length <= 3) {
      return point
    } else {
      return point.toString().substring(0, 4)
    }
  }

  return (
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="互助點數明細.csv" >
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>互助紀錄</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              {results.length} 筆資料
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
              <Table dense className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>日期</TableHead>
                    <TableHead>帳單編號</TableHead>
                    <TableHead>服務項目(互助項目)</TableHead>
                    <TableHead>設計師</TableHead>
                    <TableHead>互助人</TableHead>
                    <TableHead numeric>互助換算金額(方式)</TableHead>
                    <TableHead numeric>點數</TableHead>
                    <TableHead>互助扣項方式</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results !== undefined && beenAssistedDesigner === undefined
                    ? results.map((order, index) => (
                      <TableRow key={`decrease-result-${index}`}>
                        <TableCell className="tabular-nums">{format(new Date(order.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell className="tabular-nums">#{order.orderNo}</TableCell>
                        <TableCell>
                          {order.service.name}({order.helperType})
                        </TableCell>
                        <TableCell>{order.designer.name}</TableCell>
                        <TableCell>{order.helper.name}</TableCell>
                        <TableCell numeric>
                          {formatNumber(order.helperFee)}({order.helperMoneyGivenWay})
                        </TableCell>
                        <TableCell numeric>{formatNumber(pointFloatDisplay(order.helperPoint))}</TableCell>
                        <TableCell>
                          {order.helperDeductionType === 'onSales'
                            ? '依業績'
                            : order.helperDeductionType === 'onSalary'
                              ? '依薪水'
                              : '無扣項'}
                        </TableCell>
                      </TableRow>
                    ))
                    : results
                      .filter(data => data.designer.id === beenAssistedDesigner)
                      .map((order, index) => (
                        <TableRow key={`decrease-result-${index}`}>
                          <TableCell className="tabular-nums">{format(new Date(order.date), 'yyyy/MM/dd')}</TableCell>
                          <TableCell className="tabular-nums">#{order.orderNo}</TableCell>
                          <TableCell>
                            {order.service.name}({order.helperType})
                          </TableCell>
                          <TableCell>{order.designer.name}</TableCell>
                          <TableCell>{order.helper.name}</TableCell>
                          <TableCell numeric>
                            {formatNumber(order.helperFee)}({order.helperMoneyGivenWay})
                          </TableCell>
                          <TableCell numeric>{formatNumber(pointFloatDisplay(order.helperPoint))}</TableCell>
                          <TableCell>
                            {order.helperDeductionType === 'onSales'
                              ? '依業績'
                              : order.helperDeductionType === 'onSalary'
                                ? '依薪水'
                                : '無扣項'}
                          </TableCell>
                        </TableRow>
                      ))}
                  <TableRow className="font-bold">
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    {beenAssistedDesigner !== undefined ? (
                      <Fragment>
                        <TableCell numeric>{formatNumber(summary2)}</TableCell>
                        <TableCell numeric>{formatNumber(pointFloatDisplay(pointSummary2))}</TableCell>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <TableCell numeric>{formatNumber(summary)}</TableCell>
                        <TableCell numeric>{formatNumber(pointFloatDisplay(pointSummary))}</TableCell>
                      </Fragment>
                    )}
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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
