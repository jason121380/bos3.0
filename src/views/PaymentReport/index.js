import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import { startOfMonth } from 'date-fns'
import useFetchMerchantOtherPayWayDetailReport from 'hooks/useFetchMerchantOtherPayWayDetailReport'
import DateSelector from 'components/DateSelector'
import { HeaderActionsSlot, PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const PaymentReport = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [paymentsName, setPaymentsName] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })

  const merchantOtherPayWayDetailReportData = useFetchMerchantOtherPayWayDetailReport({
    input: date,
  })
  useEffect(() => {
    if (!merchantOtherPayWayDetailReportData.loading) {
      const report = idx(
        merchantOtherPayWayDetailReportData,
        _ => _.data.merchantOtherPayWayDetailReport.merchantOtherPayWayDetailReport
      )
      const paymentsName = idx(
        merchantOtherPayWayDetailReportData,
        _ => _.data.merchantOtherPayWayDetailReport.usedPayType
      )
      // 查詢失敗（data 為 undefined）時當成沒有資料，不讓整頁拋錯（Jason 2026/10/22）
      setPaymentsName(paymentsName || [])
      setReportForDisplay(report || [])
    }
  }, [merchantOtherPayWayDetailReportData.loading])

  return (
    <Page className="ui-root" title="每日非現金明細">
      <PageHeader title="每日非現金明細" actions={<HeaderActionsSlot />} />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
        />
      </Toolbar>
      {!merchantOtherPayWayDetailReportData.loading &&
        reportForDisplay !== null ? (
        <Results report={reportForDisplay} paymentsName={paymentsName} />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default PaymentReport
