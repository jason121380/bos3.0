import { useState, useEffect, useMemo } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import useFetchMerchantReportV3 from 'hooks/useFetchMerchantDailyReportV3'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import { startOfMonth, format } from 'date-fns'
import useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetNonCashDisplay } from 'hooks/useFetchGetParameterReportSetting'
import DateSelector from 'components/DateSelector'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const MerchantDailyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })

  const [curentDayData, setCurentDayData] = useState(null)
  const [isServiceTicketMerged, setIsServiceTicketMerged] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)

  const merchantDailyReportDataV3 = useFetchMerchantReportV3({
    input: {
      startDate: startOfMonth(date.startDate).getTime(),
      endDate: date.startDate,
    },
  })
  const isServiceTicketMergedData = useFetchIsPriceDisplayOnDailyReportSetting()
  const merchantDailyReportCurrentDayData = useFetchMerchantReportV3({
    input: {
      startDate: date.startDate,
      endDate: date.startDate,
    },
  })
  const merchantDashboardData = useFetchMerchantDashboard({
    input: {
      startDate: date.startDate,
      endDate: date.startDate,
    },
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const nonCashDisplayData = useFetchGetNonCashDisplay()
  const merchantDashboard = idx(merchantDashboardData, _ => _.data.merchantDashboard) || {}
  const nonCashDisplay = idx(nonCashDisplayData, _ => _.data.getParameterReportSetting.nonCashDisplay) || false

  const mergeResultData = useMemo(() => {
    // 查詢失敗（data 為 undefined）時與載入中一樣回空陣列，不在 render 階段拋錯
    if (merchantDashboardData.loading || !merchantDashboardData.data?.merchantDashboard) {
      return []
    }
    const data = merchantDashboardData.data.merchantDashboard
    const { otherPayway, thirdPartTicket } = data
    const set = new Set()
    const setArr = []
    const finalData = []
    const arr = [
      { key: 'otherPayway', name: 'paywayName' },
      { key: 'thirdPartTicket', name: 'ticketName' },
    ]

    arr.forEach(({ key, name }) => {
      data[key].forEach(d => {
        set.add(d[name])
      })
    })

    for (const key of set) {
      setArr.push(key)
    }

    setArr.forEach(name => {
      const other = otherPayway.find(d => d.paywayName === name)
      const third = thirdPartTicket.find(d => d.ticketName === name)

      finalData.push({
        name,
        otherPayment: {
          usedPrice: other?.usedPrice ?? 0,
          usedPriceWithNoCash: other?.usedPriceWithNoCash ?? 0,
        },
        thirdParty: {
          usedPrice: third?.usedPrice ?? 0,
          usedPriceWithNoCash: third?.usedPriceWithNoCash ?? 0,
        },
      })
    })

    return finalData
  }, [merchantDashboardData.loading, merchantDashboardData.data?.merchantDashboard])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading])
  useEffect(() => {
    if (!merchantDailyReportCurrentDayData.loading && !merchantDailyReportDataV3.loading) {
      const merchantDailyReportCurrentDay = idx(merchantDailyReportCurrentDayData, _ => _.data.merchantDailyReportV2)
      const merchantDailyReportData = idx(merchantDailyReportDataV3, _ => _.data.merchantDailyReportV2)
      setCurentDayData(merchantDailyReportCurrentDay)

      // 如果會員卡的數字不是0就要顯示
      // 查詢失敗時兩份資料都是 undefined，不在這裡拋錯（畫面另有 QueryFailed）
      const a = Boolean(merchantDailyReportCurrentDay) && merchantDailyReportCurrentDay.currentDay.membership !== 0
      const b = Boolean(merchantDailyReportData) && merchantDailyReportData.currentDay.membership !== 0
      setMembershipDisplay(a || b)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantDailyReportCurrentDayData.loading, merchantDailyReportDataV3.loading])
  useEffect(() => {
    if (!isServiceTicketMergedData.loading) {
      const isServiceTicketMerged = idx(isServiceTicketMergedData, _ => _.data.getPriceDisplayOnDailyReportDefault.isServiceTicketMerged)
      setIsServiceTicketMerged(isServiceTicketMerged)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isServiceTicketMergedData.loading])
  return (
    <Page className="ui-root" title="店家日報表">
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'none', justifyContent: 'space-between' }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
            '   ' +
            '店家日報表'}
        </div>
        <div className="merchantNamePrint">{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>
      </div>
      <PageHeader
        title="店家日報表"
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        }
      />
      <ReportToolbar
        date={
          <DateSelector date={date} attributes={['dbyesterday', 'yesterday', 'today', 'startDate']} onlyStart dateChange={value => setDate(value)} />
        }
      />

      {merchantDailyReportDataV3.error ? (
        <QueryFailed onRetry={() => merchantDailyReportDataV3.refetch()} />
      ) : !merchantDailyReportDataV3.loading &&
        !isServiceTicketMergedData.loading &&
        !merchantDailyReportCurrentDayData.loading &&
        !merchantDashboardData.loading &&
        curentDayData !== null ? (
        idx(
          merchantDailyReportDataV3,
          _ =>
            _.data.merchantDailyReportV2 !== null && (
              <Results
                merchantDailyReport={_.data.merchantDailyReportV2}
                isServiceTicketMerged={isServiceTicketMerged}
                curentDayData={curentDayData}
                displayDate={date}
                results={merchantDashboard}
                membershipDisplay={membershipDisplay}
                isMemberShipCardActive={isMemberShipCardActive}
                mergeData={mergeResultData}
                nonCashDisplay={nonCashDisplay}
              />
            )
        )
      ) : (
        <div className="flex flex-col gap-6" aria-busy="true">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      )}
    </Page>
  )
}

export default MerchantDailyReport
