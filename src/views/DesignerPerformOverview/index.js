import Page from 'components/Page'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import ReferToggleButton from 'components/ReferToggleButton'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import useFetchMerchantImmediatePerformReport from 'hooks/useFetchMerchantImmediatePerformanceReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import DateSelector from 'components/DateSelector'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'

import PerformResultsV2 from './PerformResultsV2'

function DesignerPerformOverview() {
  const [performReference, setPerformReference] = useState('FAKE')
  const [attributeSwitches, setAttributeSwitches] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [excelData, setExcelData] = useState([])
  const [merchantImmediatePerformReport, setMerchantImmediatePerformReport] = useState(null)

  // 隱藏虛實業績切換按鈕 --------------------------------------------------------------------------------
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)

  // 會員卡功能是否開啟
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading && !isMemberShipCardActiveData.loading) {
      const isDisplayTogglePerformanceButton = idx(isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
    // 兩支查詢都要等：會員卡查詢較晚回來時也要再跑一次（B2 清單 #4／#5）
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isDisplayTogglePerformanceButtonData.loading, isMemberShipCardActiveData.loading])
  // ---------------------------------------------------------------------------------------------------
  const merchantImmediatePerformReportData = useFetchMerchantImmediatePerformReport({
    input: date,
    displayReference: performReference,
  })

  useEffect(() => {
    if (merchantImmediatePerformReportData.loading || merchantImmediatePerformReportData.error) return
    if (!merchantImmediatePerformReportData.loading) {
      const merchantImmediatePerformReport = idx(merchantImmediatePerformReportData, _ => _.data.merchantImmediatePerformanceReport)
      if (!merchantImmediatePerformReport) return
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      setMerchantImmediatePerformReport(merchantImmediatePerformReport)
      const { users, wholeStore } = merchantImmediatePerformReport
      const { membershipPerformance, membershipOrderCount, membershipAveragePerformance } = wholeStore
      const memberActive = isMemberShipCardActive || membershipPerformance > 0 || (membershipOrderCount > 0) | (membershipAveragePerformance > 0)
      const excelData = []
      const attributeSwitch = []
      setMembershipDisplay(memberActive)
      users[0].categoryData.forEach(() => {
        attributeSwitch.push(false)
      })
      users.forEach(data => {
        data.categoryData.forEach((category, index) => {
          if (category.fakePerformance > 0 || category.orderCount > 0 || category.averagePerformance > 0) {
            attributeSwitch[index] = true
          }
        })
      })

      if (users != null && wholeStore != null) {
        users.forEach(element => {
          const obj = {}
          const {
            fakePerformance,
            orderCount,
            averagePerformance,
            productPerformance,
            productOrderCount,
            membershipPerformance,
            membershipOrderCount,
            membershipAveragePerformance,
            productAveragePerformance,
            orderMaleCount,
            orderFemaleCount,
            orderUnknownCount,
            userNo,
            userName,
            orderDesignateCount,
            orderNonDesignatecount,
            customerMaleCount,
            customerFemaleCount,
            customerUnknownCount,
            categoryData,
          } = element
          if (
            fakePerformance > 0 ||
            orderCount > 0 ||
            averagePerformance > 0 ||
            productPerformance > 0 ||
            productOrderCount > 0 ||
            productAveragePerformance > 0 ||
            membershipPerformance > 0 ||
            membershipOrderCount > 0 ||
            membershipAveragePerformance > 0 ||
            orderMaleCount > 0 ||
            orderFemaleCount > 0 ||
            orderUnknownCount > 0
          ) {
            obj['編號'] = userNo
            obj['設計師'] = userName
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
                obj[`${categoryName}/人次/單均價`] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
              }
            })
            excelData.push(obj)
          }
        })
        const obj2 = {}
        const {
          categoryData,
          fakePerformance,
          orderCount,
          averagePerformance,
          productPerformance,
          productOrderCount,
          productAveragePerformance,
          orderMaleCount,
          orderFemaleCount,
          membershipPerformance,
          membershipOrderCount,
          membershipAveragePerformance,
          orderUnknownCount,
          orderDesignateCount,
          orderNonDesignatecount,
          customerMaleCount,
          customerFemaleCount,
          customerUnknownCount,
        } = wholeStore

        obj2['設計師'] = '全店'
        obj2['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
        obj2['店販業績/人次/單均價'] = `${Math.round(productPerformance)} / ${productOrderCount} / ${Math.round(productAveragePerformance)}`
        if (memberActive) {
          obj2['會員卡業績/人次/單均價'] =
            `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
        }
        obj2['男/女/未知 (人次)'] = `${Math.round(orderMaleCount)} / ${orderFemaleCount} / ${Math.round(orderUnknownCount)}`
        obj2['指定/不指定 (人次)'] = `${Math.round(orderDesignateCount)} / ${orderNonDesignatecount}`
        obj2['男/女/未知 (不重複)'] = `${Math.round(customerMaleCount)} / ${customerFemaleCount} / ${Math.round(customerUnknownCount)}`

        categoryData.forEach(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
          if (attributeSwitch[index]) {
            obj2[`${categoryName}/人次/單均價`] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
          }
        })
        excelData.push(obj2)
      }
      setExcelData(excelData)
      setAttributeSwitches(attributeSwitch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantImmediatePerformReportData.loading, isMemberShipCardActiveData.loading])

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }

  return (
    <Page className="ui-root" title="全店業績分析表">
      <div>
        {/* 頁首只放「報表匯出」（STYLE §14） */}
        <PageHeader
          title="全店業績分析表"
          actions={
            <CSVLink data={excelData} filename="全店業績分析表.csv" style={{ display: 'inline' }}>
              <Button variant="secondary">
                <Download strokeWidth={1.75} />
                報表匯出
              </Button>
            </CSVLink>
          }
        />
        {/* 日期留在篩選列；「業績依據」收進「篩選」，店家設定隱藏切換鈕時沒有可用條件、不顯示篩選鈕（STYLE §14） */}
        <ReportToolbar
          date={
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
            />
          }
          filters={
            !isDisplayTogglePerformanceButton ? (
              <div className="flex flex-col gap-1.5">
                <div className="divText text-label text-text-secondary">業績依據：</div>
                <ReferToggleButton value={performReference} onChange={handleToggleButtonChange} />
              </div>
            ) : undefined
          }
        />
        {merchantImmediatePerformReportData.error ? (
          <QueryFailed onRetry={() => merchantImmediatePerformReportData.refetch()} />
        ) : !merchantImmediatePerformReportData.loading && merchantImmediatePerformReport !== null ? (
          <PerformResultsV2 results={merchantImmediatePerformReport} membershipDisplay={membershipDisplay} attributeSwitches={attributeSwitches} />
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

export default DesignerPerformOverview
