import { useState, useEffect, useMemo } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import useFetchMerchantReportV3 from 'hooks/useFetchMerchantDailyReportV3'
import useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetNonCashDisplay } from 'hooks/useFetchGetParameterReportSetting'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const MerchantBusinessIntervalReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const merchantDashboardData = useFetchMerchantDashboard({
    input: {
      startDate: date.startDate,
      endDate: date.startDate,
    },
  })
  const [isServiceTicketMerged, setIsServiceTicketMerged] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)

  const merchantDailyReportDataV3 = useFetchMerchantReportV3({ input: date })
  const isServiceTicketMergedData = useFetchIsPriceDisplayOnDailyReportSetting()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const nonCashDisplayData = useFetchGetNonCashDisplay()
  const merchantDashboard = idx(merchantDashboardData, _ => _.data.merchantDashboard) || {}
  const nonCashDisplay = idx(nonCashDisplayData, _ => _.data.getParameterReportSetting.nonCashDisplay) || false

  const mergeResultData = useMemo(() => {
    const data = merchantDashboardData.data?.merchantDashboard
    // 支付方式查詢失敗（data 為 undefined）時當成沒有明細，不讓整頁拋錯（Jason 2026/10/22）
    if (merchantDashboardData.loading || !data) {
      return [];
    }
    const { otherPayway, thirdPartTicket } = data
    const set = new Set()
    const setArr = []
    const finalData = []
    const arr = [
      { key: "otherPayway", name: 'paywayName' },
      { key: "thirdPartTicket", name: 'ticketName' },
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
          usedPriceWithNoCash: other?.usedPriceWithNoCash ?? 0
        },
        thirdParty: {
          usedPrice: third?.usedPrice ?? 0,
          usedPriceWithNoCash: third?.usedPriceWithNoCash ?? 0
        }
      })
    })

    return finalData
  }, [merchantDashboardData.loading, merchantDashboardData.data?.merchantDashboard])

  useEffect(() => {
    if (!merchantDailyReportDataV3.loading) {
      const membership = idx(merchantDailyReportDataV3, _ => _.data.merchantDailyReportV2.currentDay.membership)
      // 如果會員卡的數字不是0就要顯示
      if (membership !== 0) {
        setMembershipDisplay(true)
      } else {
        setMembershipDisplay(false)
      }
    }
  }, [merchantDailyReportDataV3.loading])

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
    if (!isServiceTicketMergedData.loading) {
      const isServiceTicketMerged = idx(
        isServiceTicketMergedData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isServiceTicketMerged
      )
      setIsServiceTicketMerged(isServiceTicketMerged)
    }
  }, [isServiceTicketMergedData.loading])
  return (
    <Page className="ui-root" title="店家區間累計表">
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
            '  - ' +
            format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
            '   ' +
            '店家區間累計表'}
        </div>
        <div className="merchantNamePrint">
          {'列印時間： ' +
            format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
        </div>
      </div>
      <PageHeader
        title="店家區間累計表"
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        }
      />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={[
            'thismonth', 'lastmonth', 'dbyesterday',
            'yesterday', 'today', 'startDate', 'endDate'
          ]}
          dateChange={value => setDate(value)}
        />
      </Toolbar>

      {!merchantDailyReportDataV3.loading && !isServiceTicketMergedData.loading && !merchantDashboardData.loading ? (
        idx(
          merchantDailyReportDataV3,
          _ =>
            _.data.merchantDailyReportV2 !== null && (
              <Results
                merchantDailyReport={_.data.merchantDailyReportV2}
                isServiceTicketMerged={isServiceTicketMerged}
                membershipDisplay={membershipDisplay}
                isMemberShipCardActive={isMemberShipCardActive}
                results={merchantDashboard}
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

export default MerchantBusinessIntervalReport
