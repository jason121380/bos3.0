import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import ReferToggleButton from 'components/ReferToggleButton'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import useFetchMerchantImmediatePerformReport from 'hooks/useFetchMerchantImmediatePerformanceReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import PerformResultsV2 from './PerformResultsV2'

function DesignerPerformOverview() {
  const [performReference, setPerformReference] = useState('FAKE')
  const [attributeSwitchs, setAttributeSwitchs] = useState([])
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
    // 只看本身設定是否載入完成（原本還要求會員卡設定也已載入，但依賴只有本設定；會員卡設定較晚回來時切換鈕永遠不會隱藏）
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])
  // ---------------------------------------------------------------------------------------------------
  const merchantImmediatePerformReportData = useFetchMerchantImmediatePerformReport({
    input: date,
    displayReference: performReference,
  })

  useEffect(() => {
    if (!merchantImmediatePerformReportData.loading) {
      const merchantImmediatePerformReport = idx(
        merchantImmediatePerformReportData,
        _ => _.data.merchantImmediatePerformanceReport
      )
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      // 查詢失敗（data 為 undefined）時不顯示報表、清空匯出，不讓整頁拋錯
      setMerchantImmediatePerformReport(merchantImmediatePerformReport || null)
      if (!merchantImmediatePerformReport) {
        setExcelData([])
        return
      }
      const { users, wholeStore } = merchantImmediatePerformReport
      const { membershipPerformance, membershipOrderCount, membershipAveragePerformance } = wholeStore
      const memberActive = isMemberShipCardActive || membershipPerformance > 0 || membershipOrderCount > 0 || membershipAveragePerformance > 0
      const excelData = []
      const attributeSwitch = []
      setMembershipDisplay(memberActive)
      // 類別清單取第一位設計師的；店家沒有任何設計師資料時改用全店的（原本直接讀 users[0] 會整頁拋錯）
      const categories = (users[0] || wholeStore).categoryData
      categories.forEach(() => {
        attributeSwitch.push(false)
      })
      users.forEach(data => {
        data.categoryData.forEach((category, index) => {
          if (
            category.fakePerformance > 0 ||
            category.orderCount > 0 ||
            category.averagePerformance > 0
          ) {
            attributeSwitch[index] = true
          }
        })
      })

      users.forEach(element => {
        const obj = {}
        const {
          fakePerformance, orderCount, averagePerformance, productPerformance, productOrderCount,
          membershipPerformance, membershipOrderCount, membershipAveragePerformance,
          productAveragePerformance, orderMaleCount, orderFemaleCount, orderUnknownCount, userNo,
          userName, orderDesignateCount, orderNonDesignatecount, customerMaleCount, customerFemaleCount,
          customerUnknownCount, categoryData
        } = element
        if (
          fakePerformance > 0 || orderCount > 0 || averagePerformance > 0 ||
          productPerformance > 0 || productOrderCount > 0 || productAveragePerformance > 0 ||
          membershipPerformance > 0 || membershipOrderCount > 0 || membershipAveragePerformance > 0 ||
          orderMaleCount > 0 || orderFemaleCount > 0 || orderUnknownCount > 0
        ) {
          obj['編號'] = userNo
          obj['設計師'] = userName
          obj['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${Math.round(orderCount)} / ${Math.round(averagePerformance)}`
          obj['店販業績/人次/單均價'] = `${Math.round(productPerformance)} / ${Math.round(productOrderCount)} / ${Math.round(productAveragePerformance)}`
          if (memberActive) {
            obj['會員卡業績/人次/單均價'] = `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
          }
          obj['男/女/未知 (人次)'] = `${orderMaleCount} / ${orderFemaleCount} / ${orderUnknownCount}`
          obj['指定/不指定 (人次)'] = `${orderDesignateCount} / ${orderNonDesignatecount}`
          obj['男/女/未知 (不重複)'] = `${customerMaleCount} / ${customerFemaleCount} / ${customerUnknownCount}`

          categoryData.forEach(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
            if (attributeSwitch[index]) {
              obj[`${categoryName}` + '/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
            }
          })
          excelData.push(obj)
        }
      })
      const obj2 = {}
      const {
        categoryData, fakePerformance, orderCount, averagePerformance, productPerformance,
        productOrderCount, productAveragePerformance, orderMaleCount, orderFemaleCount,
        orderUnknownCount, orderDesignateCount, orderNonDesignatecount, customerMaleCount,
        customerFemaleCount, customerUnknownCount
      } = wholeStore

      obj2['設計師'] = '全店'
      obj2['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
      obj2['店販業績/人次/單均價'] = `${Math.round(productPerformance)} / ${productOrderCount} / ${Math.round(productAveragePerformance)}`
      if (memberActive) {
        obj2['會員卡業績/人次/單均價'] = `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
      }
      obj2['男/女/未知 (人次)'] = `${Math.round(orderMaleCount)} / ${orderFemaleCount} / ${Math.round(orderUnknownCount)}`
      obj2['指定/不指定 (人次)'] = `${Math.round(orderDesignateCount)} / ${orderNonDesignatecount}`
      obj2['男/女/未知 (不重複)'] = `${Math.round(customerMaleCount)} / ${customerFemaleCount} / ${Math.round(customerUnknownCount)}`

      categoryData.forEach(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
        if (attributeSwitch[index]) {
          obj2[`${categoryName}` + '/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
        }
      })
      excelData.push(obj2)
      setExcelData(excelData)
      setAttributeSwitchs(attributeSwitch)
    }
  }, [merchantImmediatePerformReportData.loading, isMemberShipCardActiveData.loading])

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }

  return (
    <Page className="ui-root" title="全店業績分析表">
      <div>
        <AdminPageHeader title='全店業績分析表' />
        <div className="flex flex-row flex-wrap items-center gap-5">
          <div>
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
              margin
            />
          </div>
          <div className="flex flex-grow flex-wrap items-center justify-between gap-x-5">
            {!isDisplayTogglePerformanceButton && <div style={{ marginTop: -22 }} >
              <div className="divText">業績依據：</div>
              <ReferToggleButton
                value={performReference}
                onChange={handleToggleButtonChange}
              />
            </div>}
            <div>
              <CSVLink
                data={excelData}
                filename="全店業績分析表.csv"
                style={{ display: 'inline' }}
              >
                <Button variant="secondary">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
            </div>
          </div>
        </div>
        {!merchantImmediatePerformReportData.loading ? (
          merchantImmediatePerformReport && (
            <PerformResultsV2
              results={merchantImmediatePerformReport}
              membershipDisplay={membershipDisplay}
              attributeSwitchs={attributeSwitchs}
            />
          )
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
