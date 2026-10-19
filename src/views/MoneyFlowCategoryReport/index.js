import { useState, useEffect } from 'react'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import { startOfMonth, format } from 'date-fns'
import useFetchMoneyFlowCategoryReport from 'hooks/useFetchMoneyFlowCategoryReport'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import roundDecimal from './../../helper/roundDecimal.js'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import { Toolbar } from 'ui/page-header'

import Results from './Results'

const MoneyFlowCategoryReport = () => {
  const [reportForDisplay, setReportForDisplay] = useState([])
  const [excelData, setExcelData] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const [reportWithAmount, setReportWithAmount] = useState(null)

  const moneyFlowCategoryReportData = useFetchMoneyFlowCategoryReport({
    input: date,
  })

  useEffect(() => {
    if (!moneyFlowCategoryReportData.loading) {
      const report = idx(
        moneyFlowCategoryReportData,
        _ => _.data.moneyFlowCategoryReport.moneyFlowCategoryReport
      )

      report.forEach((data, index) => {
        report[index].moneyFlow.push({
          date: 0,
          expenditure: 0,
          remark: '',
          revenue: 0,
          subjectName: '小結',
          subjectNo: '',
          amount:
            report[index].revenueSummary > 0
              ? report[index].revenueSummary
              : -Math.abs(report[index].expenditureSummary),
        })
      })
      setReportWithAmount(report)
    }
  }, [moneyFlowCategoryReportData.loading])
  useEffect(() => {
    if (!moneyFlowCategoryReportData.loading) {
      const excelData = []
      const report = idx(moneyFlowCategoryReportData, _ => _.data.moneyFlowCategoryReport)

      setReportForDisplay(report)
      report.moneyFlowCategoryReport.forEach(data => {
        data.moneyFlow.forEach(d => {
          if (d.subjectName !== '小結') {
            excelData.push({
              日期: format(d.date, 'yyyy/MM/dd'),
              科目編號: d.subjectNo,
              科目名稱: d.subjectName,
              收入金額: d.revenue !== 0 ? d.revenue : '',
              支出金額: d.expenditure !== 0 ? d.expenditure : '',
              備註: d.remark,
            })
          }
          if (d.subjectName === '小結') {
            excelData.push({
              日期: '',
              科目編號: d.subjectNo,
              科目名稱: d.subjectName,
              收入金額: d.amount > 0 ? d.amount : '',
              支出金額: d.amount > 0 ? '' : Math.abs(d.amount),
              備註: d.remark,
            })
          }
        })
      })
      excelData.push({
        日期: '合計',
        收入金額: roundDecimal(report.revenueSummary),
        支出金額: roundDecimal(report.expenditureSummary),
      })

      setExcelData(excelData)
    }
  }, [moneyFlowCategoryReportData.loading])

  return (
    <Page className="ui-root" title="收支分類明細表">
      <div>
        <AdminPageHeader title='收支分類明細表'>
          <CSVLink
            data={excelData}
            filename="收支分類明細表.csv"
            style={{ display: 'inline' }}
          >
            <Button variant="secondary">
              <Download strokeWidth={1.75} />
              報表匯出
            </Button>
          </CSVLink>
        </AdminPageHeader>
        <Toolbar>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        </Toolbar>
        {!moneyFlowCategoryReportData.loading &&
          reportForDisplay !== null &&
          reportWithAmount !== null ? (
          <Results report={reportForDisplay} reportWithAmount={reportWithAmount} roundDecimal={roundDecimal} />
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="mt-2" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default MoneyFlowCategoryReport
