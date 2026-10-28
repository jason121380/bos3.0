import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import { startOfMonth, format } from 'date-fns'
import useFetchMoneyFlowTransferReport from 'hooks/useFetchMoneyFlowTransferReport'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import { ReportToolbar, PageHeader } from 'ui/page-header'

import Results from './Results'

const MoneyFlowTransferReport = () => {
  const [excelData, setExcelData] = useState([])
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const moneyFlowTransferReport = useFetchMoneyFlowTransferReport({
    input: date,
  })

  useEffect(() => {
    if (moneyFlowTransferReport.loading || moneyFlowTransferReport.error) return
    if (!moneyFlowTransferReport.loading) {
      const data = idx(moneyFlowTransferReport, _ => _.data.moneyFlowTransferReport)
      if (!data) return
      setReportForDisplay(data)

      const excelData = []
      data.forEach(data => {
        excelData.push({
          日期: format(data.date, 'yyyy/MM/dd'),
          營業現金應收: data.businessCash,
          現金收支收入: data.cashRevenue,
          現金收支支出: data.cashExpenditure,
          匯款: data.bankTransfer,
          當日現金結存: data.cashBalance,
          累計現金結存: data.totalCashBalance,
        })
      })
      excelData.push({
        日期: '合計',
        營業現金應收: data.reduce((total, item) => (total = total + item.businessCash), 0),
        現金收支收入: data.reduce((total, item) => (total = total + item.cashRevenue), 0),
        現金收支支出: data.reduce((total, item) => (total = total + item.cashExpenditure), 0),
        匯款: '',
        當日現金結存: data.reduce((total, item) => (total = total + item.cashBalance), 0),
        累計現金結存: 'N/A',
      })
      setExcelData(excelData)
    }
  }, [moneyFlowTransferReport.loading])

  return (
    <Page className="ui-root" title="收支匯款表">
      <div>
        <PageHeader
          title='收支匯款表'
          actions={
            <>
              <CSVLink
                data={excelData}
                filename="收支匯款表.csv"
                style={{ display: 'inline' }}
              >
                <Button variant="secondary">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
            </>
          }
        />
        <ReportToolbar
          date={
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
            />
          }
        />
        {moneyFlowTransferReport.error ? (
          <QueryFailed onRetry={() => moneyFlowTransferReport.refetch()} />
        ) : !moneyFlowTransferReport.loading && reportForDisplay && excelData ? (
          <Results reportForDisplay={reportForDisplay} />
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

export default MoneyFlowTransferReport
