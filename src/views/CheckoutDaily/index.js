import Page from 'components/Page'
import { endOfDay, subDays } from 'date-fns'
import useFetchDailyMoneyFlowReport from 'hooks/useFetchDailyMoneyFlowReport'
import useFetchWaitCloseOrderDate from 'hooks/useFetchWaitCloseOrderDate'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetisDailyCheckoutBlockedByDraftOrder from 'hooks/useFetchGetisDailyCheckoutBlockedByDraftOrder'
import idx from 'idx'
import { useState, useEffect } from 'react'
import DateSelector from 'components/DateSelector'
import { PageHeader, Toolbar } from 'ui/page-header'

import DailyMoneyFlowResults from './DailyMoneyFlowResults'
import WaitCloseOrderResults from './WaitCloseOrderResults'
import QueryFailed from 'components/QueryFailed'

function CheckoutDaily() {
  const getisDailyCheckoutBlockedByDraftOrder = useFetchGetisDailyCheckoutBlockedByDraftOrder()
  const [dailyCheckoutBlockedByDraftOrder, setDailyCheckoutBlockedByDraftOrder] = useState(false)
  const [pageSetting, setPageSetting] = useState({
    startDate: subDays(endOfDay(new Date()), 31).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const [resultsSetting] = useState({
    dailyMoneyFlowReport: {
      pageLimit: 1000,
      pageOffset: 0,
    },
    waitCloseOrderDate: {
      pageLimit: 1000,
      pageOffset: 0,
    },
  })
  const dailyMoneyFlowReport = useFetchDailyMoneyFlowReport({
    ...pageSetting,
    ...resultsSetting.dailyMoneyFlowReport,
  })
  const waitCloseOrderDate = useFetchWaitCloseOrderDate({
    ...pageSetting,
    ...resultsSetting.waitCloseOrderDate,
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()

  useEffect(() => {
    if (!getisDailyCheckoutBlockedByDraftOrder.loading) {
      const data = idx(getisDailyCheckoutBlockedByDraftOrder, _ => _.data.getIsDailyCheckoutBlockedByDraftOrder)
      setDailyCheckoutBlockedByDraftOrder(data)
    }
  }, [getisDailyCheckoutBlockedByDraftOrder.loading])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !dailyMoneyFlowReport.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      // 查詢失敗時不整頁錯誤（日結紀錄區塊本身不顯示），Jason 2026/10/22
      const membership = (idx(dailyMoneyFlowReport, _ => _.data.dailyMoneyFlowReport.summary.membership) || 0) !== 0
      setIsMemberShipCardActive(isMemberShipCardActive || membership)
    }
  }, [isMemberShipCardActiveData.loading, dailyMoneyFlowReport.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && !dailyMoneyFlowReport.loading) {
      const bonusActive = idx(
        customerBonusActive,
        _ => _.data.getIsCustomerBonusActive
      )
      const bonus = (idx(dailyMoneyFlowReport, _ => _.data.dailyMoneyFlowReport.summary.bonusDecountForReport) || 0) !== 0
      setBonusDisplay(bonusActive || bonus)
    }
  }, [customerBonusActive.loading, dailyMoneyFlowReport.loading])

  return (
    <Page className="ui-root" title="每日結帳">
      <PageHeader title="每日結帳" />
      <Toolbar>
        <DateSelector
          date={pageSetting}
          attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setPageSetting(value)}
        />
      </Toolbar>
      <div className="flex flex-col gap-6">
        {(waitCloseOrderDate.error || dailyMoneyFlowReport.error) && (
          <QueryFailed
            onRetry={() => {
              if (waitCloseOrderDate.error) waitCloseOrderDate.refetch()
              if (dailyMoneyFlowReport.error) dailyMoneyFlowReport.refetch()
            }}
          />
        )}
        {idx(
          waitCloseOrderDate,
          _ =>
            _.data.waitCloseOrderDate.data && (
              <WaitCloseOrderResults
                waitCloseOrderResults={_.data.waitCloseOrderDate.data}
                refetch={_.refetch}
                refetchDailyMoneyFlowReport={dailyMoneyFlowReport.refetch}
                pageSetting={_.data.waitCloseOrderDate}
                checkoutStatus={dailyCheckoutBlockedByDraftOrder}
                loading={waitCloseOrderDate.loading || getisDailyCheckoutBlockedByDraftOrder.loading}
              />
            )
        )}

        {idx(
          dailyMoneyFlowReport,
          _ =>
            _.data.dailyMoneyFlowReport.data && (
              <DailyMoneyFlowResults
                dailyMoneyFlowResult={_.data.dailyMoneyFlowReport}
                pageSetting={pageSetting}
                isMemberShipCardActive={isMemberShipCardActive}
                bonusDisplay={bonusDisplay}
                waitCloseOrderDateLoading={waitCloseOrderDate.loading}
                onRestored={() => {
                  waitCloseOrderDate.refetch()
                  dailyMoneyFlowReport.refetch()
                }}
              />
            )
        )}
      </div>
    </Page>
  )
}

export default CheckoutDaily
