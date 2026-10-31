import { useState, useEffect } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import { ReportToolbar, PageHeader } from 'ui/page-header'
import DateSelector from 'components/DateSelector'
import useFetchGetBusinessAnalysisReport from 'hooks/useFetchGetBusinessAnalysisReport'
import { startOfMonth, format } from 'date-fns'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import { CSVLink } from 'react-csv'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const PaymentReport = () => {
  const [excelData, setExcelData] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })

  const businessAnalysisReportData = useFetchGetBusinessAnalysisReport({
    input: {
      startDate: date.startDate,
      endDate: date.endDate,
      pageLimit: 100,
      pageOffset: 0,
    },
  })
  const isServiceTicketMergedData = useFetchIsPriceDisplayOnDailyReportSetting()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()

  const [isServiceTicketMerged, setIsServiceTicketMerged] = useState(false)
  const [displayReportWithMembership, setDisplayReportWithMembership] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [bonusDisplay, setBonusDisplay] = useState(false)

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !customerBonusActive.loading && !businessAnalysisReportData.loading) {
      // 任一查詢失敗時以空資料計算，不整頁錯誤（Jason 2026/10/22）
      const memberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const bonusActive = idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive)
      const membershipTotal = idx(businessAnalysisReportData, _ => _.data.businessAnalysisReport.summary.membership) || 0
      const bonusTotal = idx(businessAnalysisReportData, _ => _.data.businessAnalysisReport.summary.bonusDecountForReport)
      setIsMemberShipCardActive(Boolean(memberShipCardActive || membershipTotal !== 0))
      setBonusDisplay(Boolean(bonusActive || (bonusTotal != null && bonusTotal !== 0)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading, customerBonusActive.loading, businessAnalysisReportData.loading])

  useEffect(() => {
    if (!businessAnalysisReportData.loading) {
      const report = idx(businessAnalysisReportData, _ => _.data.businessAnalysisReport)
      if (report != null) {
        const data = report.data.map(d => ({
          營業日期: format(d.date, 'yyyy/MM/dd'),
          現金結存: Math.round(d.cashBalance),
          服務消費: Math.round(d.service),
          店販消費: Math.round(d.product),
          會員卡消費: Math.round(d.membership),
          '卡券使用(入業績)': Math.round(d.usedTicket),
          '卡券販賣(入業績)': Math.round(d.ticketSellIntoPerformance),
          業績收入: Math.round(d.performanceIncome),
          '卡券販賣(不入業績)': Math.round(d.ticketSellNotIntoPerformance),
          '入金儲值(不入業績)': Math.round(d.walletDeposit),
          '卡券使用(-)': Math.round(d.usedTicketForDecount),
          '第三方卡券(-)': Math.round(d.thirdPartTicketForDecount),
          '其他付款方式(-)': Math.round(d.otherPayWayForDecount),
          '入金使用(-)': Math.round(d.walletUsedForDecount),
          '點數折抵金額(-)': Math.round(d.bonusDecountForReport),
          營業現金應收: Math.round(d.businessCash),
          現金收支收入: Math.round(d.cashRevenue),
          '現金收支支出(-)': Math.round(d.cashExpenditure),
          員工借支: Math.round(d.expenditure),
        }))
        const total = {
          營業日期: '總計',
          現金結存: Math.round(report.summary.cashBalance),
          服務消費: Math.round(report.summary.service),
          店販消費: Math.round(report.summary.product),
          會員卡消費: Math.round(report.summary.membership),
          '卡券使用(入業績)': Math.round(report.summary.usedTicket),
          '卡券販賣(入業績)': Math.round(report.summary.ticketSellIntoPerformance),
          業績收入: Math.round(report.summary.performanceIncome),
          '卡券販賣(不入業績)': Math.round(report.summary.ticketSellNotIntoPerformance),
          '入金儲值(不入業績)': Math.round(report.summary.walletDeposit),
          '卡券使用(-)': Math.round(report.summary.usedTicketForDecount),
          '第三方卡券(-)': Math.round(report.summary.thirdPartTicketForDecount),
          '其他付款方式(-)': Math.round(report.summary.otherPayWayForDecount),
          '入金使用(-)': Math.round(report.summary.walletUsedForDecount),
          '點數折抵金額(-)': Math.round(report.summary.bonusDecountForReport),
          營業現金應收: Math.round(report.summary.businessCash),
          現金收支收入: Math.round(report.summary.cashRevenue),
          '現金收支支出(-)': Math.round(report.summary.cashExpenditure),
          員工借支: Math.round(report.summary.expenditure),
        }
        let excelData = [...data, total]
        if (!isMemberShipCardActive) {
          excelData = excelData.map(({ 會員卡消費, ...rest }) => rest)
        }
        if (!bonusDisplay) {
          excelData = excelData.map(({ '點數折抵金額(-)': value, ...rest }) => rest)
        }
        setExcelData(excelData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [businessAnalysisReportData.loading, isMemberShipCardActive, bonusDisplay])

  useEffect(() => {
    if (!isServiceTicketMergedData.loading) {
      const isServiceTicketMerged = idx(isServiceTicketMergedData, _ => _.data.getPriceDisplayOnDailyReportDefault.isServiceTicketMerged)
      setIsServiceTicketMerged(isServiceTicketMerged)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isServiceTicketMergedData.loading])

  return (
    <Page title="營業統計分析表" className="BusinessAnalysisReport ui-root">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'none', justifyContent: 'space-between' }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '營業統計分析表'}
          </div>
          <div className="merchantNamePrint">{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>
        </div>
        <PageHeader
          title="營業統計分析表"
          actions={
            <>
              <CSVLink data={excelData} filename="營業統計分析表.csv" style={{ display: 'inline' }}>
                <Button variant="secondary">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer strokeWidth={1.75} />
                列印
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
        {businessAnalysisReportData.error ? (
          <QueryFailed onRetry={() => businessAnalysisReportData.refetch()} />
        ) : !businessAnalysisReportData.loading && !isMemberShipCardActive.loading ? (
          // 報表查詢失敗時不顯示表格（errorLink 已提示），不整頁錯誤（Jason 2026/10/22）
          idx(businessAnalysisReportData, _ => _.data.businessAnalysisReport.data) && (
            <Results
              isServiceTicketMerged={isServiceTicketMerged}
              data={idx(businessAnalysisReportData, _ => _.data.businessAnalysisReport)}
              displayReportWithMembership={displayReportWithMembership}
              isMemberShipCardActive={isMemberShipCardActive}
              bonusDisplay={bonusDisplay}
            />
          )
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default PaymentReport
