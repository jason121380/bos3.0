import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { startOfMonth, addDays, format, differenceInDays } from 'date-fns'
import useFetchMoneyFlowDailyReport from 'hooks/useFetchMoneyFlowDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import Results from './Results'
import { CSVLink } from 'react-csv'
import DateSelector from 'components/DateSelector'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar, PageHeader } from 'ui/page-header'
import QueryFailed from 'components/QueryFailed'

export default function Employees() {
  const [displayDate, setDisplayDate] = useState([])
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [excelData, secExcelData] = useState([])

  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const moneyFlowDailyReportData = useFetchMoneyFlowDailyReport({
    startDate: date.startDate,
    endDate: date.endDate,
  })

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return '(一)'
      case 'Tuesday':
        return '(二)'
      case 'Wednesday':
        return '(三)'
      case 'Thursday':
        return '(四)'
      case 'Friday':
        return '(五)'
      case 'Saturday':
        return '(六)'
      case 'Sunday':
        return '(日)'
      default:
        break
    }
  }
  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    const displayDate = []
    const dayCount = Math.abs(differenceInDays(date.startDate, date.endDate))
    let add = 0
    for (let i = 0; i <= dayCount; i++) {
      displayDate.push(
        `${format(addDays(new Date(date.startDate), add).getTime(), 'MM/dd')}${weekDisplay(
          format(addDays(new Date(date.startDate), add).getTime(), 'eeee')
        )}`
      )
      add++
    }
    setDisplayDate(displayDate)
  }, [date])

  return (
    <Page className="ui-root" title="每日收支明細">
      <div>
        <PageHeader
          title="每日收支明細(已日結)"
          actions={
            <>
              <Button asChild variant="secondary" className="shrink-0">
                <CSVLink data={excelData} filename="高階收支登錄.csv">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </CSVLink>
              </Button>
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
        {moneyFlowDailyReportData.error ? (
          <QueryFailed onRetry={() => moneyFlowDailyReportData.refetch()} />
        ) : !moneyFlowDailyReportData.loading && !isMemberShipCardActiveData.loading ? (
          idx(moneyFlowDailyReportData, _ => (
            <Results
              moneyFlowDailyReport={_.data.moneyFlowDailyReport}
              displayDate={displayDate}
              secExcelData={secExcelData}
              isMemberShipCardActive={isMemberShipCardActive}
            />
          ))
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}
