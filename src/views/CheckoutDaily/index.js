import Page from 'components/Page'
import { endOfDay, subDays } from 'date-fns'
import useFetchDailyMoneyFlowReport from 'hooks/useFetchDailyMoneyFlowReport'
import useFetchWaitCloseOrderDate from 'hooks/useFetchWaitCloseOrderDate'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetisDailyCheckoutBlockedByDraftOrder from 'hooks/useFetchGetisDailyCheckoutBlockedByDraftOrder'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import pagenationLabel from './../../helper/pagenationLabel'
import DateSelector from 'components/DateSelector'
import { PageHeader, Toolbar } from 'ui/page-header'

import DailyMoneyFlowResults from './DailyMoneyFlowResults'
import WaitCloseOrderResults from './WaitCloseOrderResults'

function CheckoutDaily() {
  const getisDailyCheckoutBlockedByDraftOrder = useFetchGetisDailyCheckoutBlockedByDraftOrder()
  const [dailyCheckoutBlockedByDraftOrder, setDailyCheckoutBlockedByDraftOrder] = useState(false)
  const [pageSetting, setPageSetting] = useState({
    startDate: subDays(endOfDay(new Date()), 31).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const [resultsSetting, setResultsSetting] = useState({
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
      const membership = dailyMoneyFlowReport.data.dailyMoneyFlowReport.summary.membership !== 0
      setIsMemberShipCardActive(isMemberShipCardActive || membership)
    }
  }, [isMemberShipCardActiveData.loading, dailyMoneyFlowReport.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && !dailyMoneyFlowReport.loading) {
      const bonusActive = idx(
        customerBonusActive,
        _ => _.data.getIsCustomerBonusActive
      )
      const bonus = dailyMoneyFlowReport.data.dailyMoneyFlowReport.summary.bonusDecountForReport !== 0
      setBonusDisplay(bonusActive || bonus)
    }
  }, [customerBonusActive.loading, dailyMoneyFlowReport.loading])

  const handlePageChange = ({ page, key }) => {
    setResultsSetting(
      produce(draft => {
        draft[key].pageOffset = page
      })
    )
  }

  const handleRowsPerPageChange = ({ event, key }) => {
    setResultsSetting(
      produce(draft => {
        draft[key].pageLimit = idx(event, _ => _.target.value)
        draft[key].pageOffset = 0
      })
    )
  }

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
                onPageChange={(_event, newPage) =>
                  handlePageChange({ page: newPage, key: 'waitCloseOrderDate' })
                }
                onRowsPerPageChange={event =>
                  handleRowsPerPageChange({ event, key: 'waitCloseOrderDate' })
                }
                pagenationLabel={pagenationLabel}
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
                onPageChange={(_event, newPage) =>
                  handlePageChange({ page: newPage, key: 'dailyMoneyFlowReport' })
                }
                onRowsPerPageChange={event =>
                  handleRowsPerPageChange({ event, key: 'dailyMoneyFlowReport' })
                }
                waitCloseOrderDateLoading={waitCloseOrderDate.loading}
                pagenationLabel={pagenationLabel}
              />
            )
        )}
      </div>
    </Page>
  )
}

export default CheckoutDaily
