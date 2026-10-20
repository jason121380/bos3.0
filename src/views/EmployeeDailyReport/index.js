import { Grid } from 'ui/grid-compat'
import { useState, useEffect } from 'react'
// Grid 只保留在報表外框（className="EmployeeDailyReport"）：列印樣式以此為根排版，且內含列印用卡片
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchDesignerReport from 'hooks/useFetchDesignerDailyReport'
import { format } from 'date-fns'
import idx from 'idx'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import useFetchGetIsZeroValueHiddenOnDailyReport from 'hooks/useFetchGetIsZeroValueHiddenOnDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsOptimizationPrintModeOn from 'hooks/useFetchGetIsOptimizationPrintModeOn'
import DateSelector from 'components/DateSelector'
import _ from 'lodash'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const EmployeeDailyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [priceDisplayOnReport, setPriceDisplayOnReport] = useState(false)
  const [isHelperPointPriceDisplay, setIsHelperPointPriceDisplay] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [printData, setPrintData] = useState([])
  const [printMode, setPrintMode] = useState(false)

  const designerReportData = useFetchDesignerReport({ date: date.endDate })
  const isPriceDisplayOnDailyReportData = useFetchIsPriceDisplayOnDailyReportSetting()
  const isZeroValueHiddenOnDailyReportData = useFetchGetIsZeroValueHiddenOnDailyReport()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const optimizationPrintMode = useFetchGetIsOptimizationPrintModeOn()
  const isHiddenZero = idx(
    isZeroValueHiddenOnDailyReportData,
    _ => _.data.getIsZeroValueHiddenOnDailyReport
  )

  useEffect(() => {
    if (!optimizationPrintMode.loading) {
      const data = idx(optimizationPrintMode, _ => _.data.getIsOptimizationPrintModeOn)
      setPrintMode(data)
    }
  }, [optimizationPrintMode.loading])

  useEffect(() => {
    if (!designerReportData.loading) {
      const data = idx(designerReportData, _ => _.data.designerDailyReport)
      let group = []
      const report = []
      data.forEach((d, index) => {
        group.push((d))
        if (group.length === 4) {
          report.push(group)
          group = []
        } else if (index === (data.length - 1)) {
          report.push(group)
          group = []
        }
      })
      setPrintData(report)
    }
  }, [designerReportData.loading])


  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    if (!isPriceDisplayOnDailyReportData.loading) {
      const isPriceDisplayOnDailyReport = idx(
        isPriceDisplayOnDailyReportData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isPriceDisplayOnDailyReport
      )
      const isHelperPointPriceDisplay = idx(
        isPriceDisplayOnDailyReportData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setPriceDisplayOnReport(isPriceDisplayOnDailyReport)
      setIsHelperPointPriceDisplay(isHelperPointPriceDisplay)
    }
  }, [isPriceDisplayOnDailyReportData.loading])
  return (
    <Page className="ui-root" title="設計師日報表">
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
            '   ' +
            '設計師日報表'}
        </div>
        <div className="merchantNamePrint">
          {'列印時間： ' +
            format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
        </div>
      </div>
      <AdminPageHeader title='設計師日報表'>
        <Button
          className="noprint shrink-0"
          variant="secondary"
          onClick={() => window.print()}
        >
          <Printer strokeWidth={1.75} />
          列印
        </Button>
      </AdminPageHeader>
      <Toolbar className="min-w-0 flex-wrap">
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <DateSelector
            date={date}
            attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
            onlyStart
            dateChange={value => setDate(value)}
          />
        </div>
      </Toolbar>

      {!designerReportData.loading && !isPriceDisplayOnDailyReportData.loading ? (
        idx(designerReportData, _ =>
          _.data.designerDailyReport.length > 0 ? (
            <Grid container spacing={3} className='EmployeeDailyReport'>
              <Results
                designerDailyReport={_.data.designerDailyReport}
                printData={printData}
                titleDate={date.endDate}
                priceDisplayOnReport={priceDisplayOnReport}
                isHelperPointPriceDisplay={isHelperPointPriceDisplay}
                isHiddenZero={isHiddenZero}
                isMemberShipCardActive={isMemberShipCardActive}
                printMode={printMode}
              />
            </Grid>
          ) : (
            <Card>
              <EmptyState title="無資料" />
            </Card>
          )
        )
      ) : (
        // 載入中：與舊版 CircularProgress 相同時機顯示
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[480px] w-full rounded-lg" />
          <Skeleton className="h-[480px] w-full rounded-lg" />
          <Skeleton className="h-[480px] w-full rounded-lg" />
        </div>
      )}
    </Page>
  )
}

export default EmployeeDailyReport
