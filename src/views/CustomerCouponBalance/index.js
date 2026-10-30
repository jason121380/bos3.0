import React, { useState, useEffect, useCallback } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import useFetchCustomerCouponReport from 'hooks/useFetchCustomerCouponReport'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import TicketAutoComplete from 'components/TicketAutoComplete'
import { CSVLink } from "react-csv";
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked, { maskCustomerName, maskCellphone } from 'helper/exportCustomerMask'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const CustomerWalletBalance = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [reportTotal, setReportTotal] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [pageSetting, setPageSetting] = React.useState({
    customerId: [],
    couponId: [],
    preferDesignerId: null,
    latestDesignerId: null
  })
  const customerCouponBalanceData = useFetchCustomerCouponReport({
    input: pageSetting,
  })
  // 匯出檔遮罩客資比照帳單列表：只有設定查詢成功且為 false 才不遮罩（Jason 2026/10/22 同意）
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isCustomerDataMarked = isExportCustomerMasked(customerDataMarkedData)

  const handleCountTotalPrice = (report, key) => {
    if (report === null) return report
    return report.reduce((a, b) => a += b[key] * Math.round(b.singleCouponPrice) , 0)
  }

  useEffect(() => {
    if (!customerCouponBalanceData.loading) {
      const excelData = []
      const tempArray = []
      const tempArrayTotal = []
      const customerCouponBalance = idx(
        customerCouponBalanceData,
        _ => _.data.customerCouponBalanceReport
      ) || [] // 查詢失敗時以空陣列處理（原本 forEach 拋錯整頁錯誤；Jason 2026/10/22 fix all）
      customerCouponBalance.forEach(d => {
        tempArray.push(d)
      })
      customerCouponBalance.forEach(data => {
        data.data.forEach(d => {
          tempArrayTotal.push(d)
        })
      })
      setReportForDisplay(tempArray)
      setReportTotal(tempArrayTotal)
      tempArrayTotal.forEach(d => {
        excelData.push({
          顧客編號: d.customerNo,
          顧客姓名: isCustomerDataMarked ? maskCustomerName(d.customerName) : d.customerName,
          顧客手機: isCustomerDataMarked ? maskCellphone(d.customerCellPhone) : d.customerCellPhone,
          卡券編號: d.couponNo,
          卡券名稱: d.couponName,
          總金額: d.totalCount * Math.round(d.singleCouponPrice),
          總量: d.totalCount,
          已使用數量: d.usedCount,
          剩餘數量: d.remainingCount,
          剩餘金額: d.remainingCount * Math.round(d.singleCouponPrice),
          單張卡券原始金額: Math.round(d.singleCouponPrice),
          單張卡券扣手續費後金額: Math.round(d.singleCouponPriceDecreaseHandingFee),
          單張卡券之手續費: Math.abs(Math.round(d.singleCouponHandingFee)),
          其他付款方式名稱: d.otherPaymentName !== null ? d.otherPaymentName : '無',
          是否已先入業績: d.isIntoPerformanceWhileBuying === true ? '是' : '否',
        })
      })
      excelData.push({
        顧客編號: '合計',
        總金額: handleCountTotalPrice(tempArrayTotal, 'totalCount'),
        總量: tempArrayTotal.reduce((acc, curVal) => acc + curVal.totalCount, 0),
        已使用數量: tempArrayTotal.reduce((acc, curVal) => acc + curVal.usedCount, 0),
        剩餘數量: tempArrayTotal.reduce((acc, curVal) => acc + curVal.remainingCount, 0),
        剩餘金額: handleCountTotalPrice(tempArrayTotal, 'remainingCount'),
        單張卡券原始金額: Math.round(tempArrayTotal.reduce((acc, curVal) => acc + curVal.singleCouponPrice, 0)),
        單張卡券扣手續費後金額: Math.round(
          tempArrayTotal.reduce((acc, curVal) => acc + curVal.singleCouponPriceDecreaseHandingFee, 0)
        ),
        單張卡券之手續費: Math.abs(
          Math.round(
            tempArrayTotal.reduce((acc, curVal) => acc + curVal.singleCouponHandingFee, 0)
          )
        ),
      })
      setExcelData(excelData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerCouponBalanceData.loading, isCustomerDataMarked])

  let customerIdValue = ''
  if (pageSetting.customerId.length > 0) {
    pageSetting.customerId.forEach(id => {
      customerIdValue = id
    })
  }
  let couponIdValue = ''
  if (pageSetting.couponId.length > 0) {
    pageSetting.couponId.forEach(id => {
      couponIdValue = id
    })
  }
  return (
    <Page className="ui-root" title="顧客卡券餘額表">
      <PageHeader
        title="顧客卡券餘額表"
        actions={
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="顧客卡券餘額表.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        }
      />
      <Toolbar>
        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <CustomerAutoComplete
              label={'顧客編號/姓名'}
              value={customerIdValue}
              onChange={value =>
                setPageSetting({
                  ...pageSetting,
                  customerId: value.id !== '' ? [value.id] : [],
                })
              }
            />
          </div>
          <div>
            <TicketAutoComplete
              className="w-[200px]"
              label="卡券名稱/代號"
              value={couponIdValue}
              onChange={value =>
                setPageSetting({
                  ...pageSetting,
                  couponId: value.id !== '' ? [value.id] : [],
                })
              }
            />
          </div>
          <div>
            <EmployeeAutoComplete
              className="w-[200px]"
              label='偏好設計師'
              value={pageSetting.preferDesignerId}
              onChange={value => {
                setPageSetting({
                  ...pageSetting,
                  preferDesignerId: value.userId || null,
                })
              }}
            />
          </div>
          <div>
            <EmployeeAutoComplete
              className="w-[200px]"
              label='最近設計師'
              value={pageSetting.latestDesignerId}
              onChange={value => {
                setPageSetting({
                  ...pageSetting,
                  latestDesignerId: value.userId || null,
                })
              }}
            />
          </div>
        </div>
      </Toolbar>
      {customerCouponBalanceData.error ? (
          <QueryFailed onRetry={() => customerCouponBalanceData.refetch()} />
        ) : !customerCouponBalanceData.loading ? (
        <Results
          report={reportForDisplay}
          total={reportTotal}
          countTotalPrice={handleCountTotalPrice}
        />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default CustomerWalletBalance
