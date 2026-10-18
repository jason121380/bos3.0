import { format } from 'date-fns'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ report, reportWithAmount, roundDecimal }) {
  return (
    <Table dense wrapperClassName="mt-2" className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>日期</TableHead>
          <TableHead>科目編號</TableHead>
          <TableHead>科目名稱</TableHead>
          <TableHead numeric>收入金額</TableHead>
          <TableHead numeric>支出金額</TableHead>
          <TableHead>備註</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportWithAmount.map(report => {
          return report.moneyFlow.map((d, index)=> {
            if (d.subjectName !== '小結') {
              return (
                <TableRow key={index}>
                  <TableCell className="tabular-nums">{format(d.date, 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="tabular-nums">{d.subjectNo}</TableCell>
                  <TableCell>{d.subjectName}</TableCell>
                  <TableCell numeric>
                    {formatNumber(d.revenue !== 0 ? roundDecimal(d.revenue) : '')}
                  </TableCell>
                  <TableCell numeric>
                    {formatNumber(d.expenditure !== 0 ? roundDecimal(d.expenditure) : '')}
                  </TableCell>
                  <TableCell>{d.remark}</TableCell>
                </TableRow>
              )
            } else {
              return (
                <TableRow
                  className="moneyFlowCatReportSubtotal bg-surface-hover font-medium"
                  key={index}
                >
                  <TableCell />
                  <TableCell />
                  <TableCell>{d.subjectName}</TableCell>
                  <TableCell numeric>{formatNumber(d.amount > 0 ? d.amount : '')}</TableCell>
                  <TableCell numeric>{formatNumber(d.amount > 0 ? '' : Math.abs(d.amount))}</TableCell>
                  <TableCell />
                </TableRow>
              )
            }
          })
        })}
        <TableRow className="font-bold">
          <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
          <TableCell />
          <TableCell />
          <TableCell numeric>{formatNumber(roundDecimal(report.revenueSummary))}</TableCell>
          <TableCell numeric>{formatNumber(roundDecimal(report.expenditureSummary))}</TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  )
}


export default Results
