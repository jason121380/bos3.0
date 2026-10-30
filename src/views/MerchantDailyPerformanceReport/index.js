import Page from 'components/Page'
import ReferToggleButton from 'components/ReferToggleButton'
import { endOfDay, startOfMonth, format } from 'date-fns'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import useFetchGetMerchantDailyPerformanceReport from 'hooks/useFetchGetMerchantDailyPerformanceReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import DateSelector from 'components/DateSelector'
import produce from 'immer'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

function DesignerPerformOverview() {
  const [dailyPerformanceData, setDailyPerformanceData] = useState(null)
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)
  const [attributeSwitchs, setAttributeSwitchs] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [inputData, setInputData] = useState({
    displayReference: 'FAKE',
    dateRange: {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
    },
  })
  const [excelData, setExcelData] = useState([])
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const merchantDailyPerformanceReportData = useFetchGetMerchantDailyPerformanceReport({
    input: inputData,
  })

  const handleSetInputData = (key, value) => {
    setInputData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading && !isMemberShipCardActiveData.loading) {
      const isDisplayTogglePerformanceButton = idx(isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
    // 兩支查詢都要等：會員卡查詢較晚回來時也要再跑一次（B2 清單 #4／#5）
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isDisplayTogglePerformanceButtonData.loading, isMemberShipCardActiveData.loading])

  useEffect(() => {
    if (!merchantDailyPerformanceReportData.loading) {
      const merchantDailyPerformanceReport = idx(merchantDailyPerformanceReportData, _ => _.data.merchantDailyPerformanceReport)
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const memberActive =
        (merchantDailyPerformanceReport || []).some(
          ({ performance }) =>
            performance.isMemberShipCardActive > 0 || performance.membershipPerformance > 0 || performance.membershipAveragePerformance > 0
        ) || isMemberShipCardActive

      setMembershipDisplay(memberActive)
      setDailyPerformanceData(merchantDailyPerformanceReport)

      const excelData = []
      const attributeSwitch = []

      const dailyRows = merchantDailyPerformanceReport || []
      dailyRows.forEach(({ performance }) => {
        performance.categoryData.forEach((category, index) => {
          if (attributeSwitch[index]) {
            return
          } else {
            attributeSwitch[index] = Boolean(category.fakePerformance > 0 || category.orderCount > 0 || category.averagePerformance > 0)
          }
        })
      })

      dailyRows.forEach(({ date, performance }) => {
        const {
          fakePerformance,
          orderCount,
          averagePerformance,
          productPerformance,
          productOrderCount,
          membershipPerformance,
          membershipOrderCount,
          membershipAveragePerformance,
          customerUnknownCount,
          productAveragePerformance,
          orderMaleCount,
          orderFemaleCount,
          orderUnknownCount,
          categoryData,
          orderDesignateCount,
          orderNonDesignatecount,
          customerMaleCount,
          customerFemaleCount,
        } = performance
        const obj = {}
        obj['日期'] = format(date, 'yyyy/MM/dd')
        obj['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${Math.round(orderCount)} / ${Math.round(averagePerformance)}`
        obj['店販業績/人次/單均價'] =
          `${Math.round(productPerformance)} / ${Math.round(productOrderCount)} / ${Math.round(productAveragePerformance)}`
        if (memberActive) {
          obj['會員卡業績/人次/單均價'] =
            `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
        }
        obj['男/女/未知 (人次)'] = `${orderMaleCount} / ${orderFemaleCount} / ${orderUnknownCount}`
        obj['指定/不指定 (人次)'] = `${orderDesignateCount} / ${orderNonDesignatecount}`
        obj['男/女/未知 (不重複)'] = ` ${customerMaleCount} / ${customerFemaleCount} / ${customerUnknownCount}`

        categoryData.forEach(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
          if (attributeSwitch[index]) {
            obj[`${categoryName}` + '/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
          }
        })
        excelData.push(obj)
      })
      setExcelData(excelData)
      setAttributeSwitchs(attributeSwitch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantDailyPerformanceReportData.loading, isMemberShipCardActiveData.loading])

  return (
    <Page title="每日業績分析表" className="ui-root">
      <PageHeader
        title="每日業績分析表"
        actions={
          <Button asChild variant="secondary">
            <CSVLink data={excelData} filename="每日業績分析表.csv">
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        }
      />

      <ReportToolbar
        date={
          <DateSelector
            date={inputData.dateRange}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => handleSetInputData('dateRange', value)}
          />
        }
        filters={
          !isDisplayTogglePerformanceButton && (
            <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:shrink-0">
              <div className="divText text-label text-text-secondary">業績依據</div>
              <ReferToggleButton value={inputData.displayReference} onChange={value => handleSetInputData('displayReference', value)} />
            </div>
          )
        }
      />
      {merchantDailyPerformanceReportData.error ? (
        <QueryFailed onRetry={() => merchantDailyPerformanceReportData.refetch()} />
      ) : !merchantDailyPerformanceReportData.loading && dailyPerformanceData !== null ? (
        <Results className="mt-2" results={dailyPerformanceData} membershipDisplay={membershipDisplay} attributeSwitchs={attributeSwitchs} />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default DesignerPerformOverview
