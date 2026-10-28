import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import useFetchCustomerWalletBalance from 'hooks/useFetchCustomerWalletReport'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import { CSVLink } from "react-csv";
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked, { maskCustomerName } from 'helper/exportCustomerMask'

import Results from './Results'

const CustomerWalletBalance = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [designerValue, setDesignerValue] = useState([])
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 50,
    pageOffset: 0,
    designerId: designerValue,
    customerId: [],
  })
  const customerWalletBalanceData = useFetchCustomerWalletBalance({
    input: pageSetting,
  })
  // 匯出檔遮罩客資比照顧客卡券餘額表：只有「報表匯出客資遮碼」查詢成功且為 false 才不遮罩。
  // 畫面表格維持完整姓名（Jason 2026/10/24：參數設定開關要接到這份匯出）。
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isCustomerDataMarked = isExportCustomerMasked(customerDataMarkedData)
  useEffect(() => {
    if (!customerWalletBalanceData.loading) {
      const excelData = []
      const report = idx(
        customerWalletBalanceData,
        _ => _.data.customerWalletReport.customerWalletReport
      ) || [] // 查詢失敗時以空陣列處理（原本 reduce 拋錯整頁錯誤；Jason 2026/10/22 fix all）
      const sum = report.reduce((accu, curVal) => accu + curVal.leftWallet, 0)
      setReportForDisplay(report)
      report.forEach(data => {
        excelData.push({
          客戶編號: data.customerNo,
          客戶姓名: isCustomerDataMarked ? maskCustomerName(data.customerName) : data.customerName,
          所屬設計師: data.preferDesignerName,
          儲值餘額: data.leftWallet,
        })
      })
      excelData.push({
        客戶編號: '合計',
        儲值餘額: sum,
      })
      setExcelData(excelData)
    }
  }, [customerWalletBalanceData.loading, isCustomerDataMarked])
  let customerIdValue = ''
  if (pageSetting.customerId.length > 0) {
    pageSetting.customerId.forEach(id => {
      customerIdValue = id
    })
  }
  const handleDesignerChange = value => {
    const tmp = value.userId !== undefined || value.id !== '' ? [value.userId] : []
    setDesignerValue(value.userId !== undefined ? value.userId : [])
    setPageSetting({
      ...pageSetting,
      designerId: tmp,
    })
  }
  return (
    <Page className="ui-root" title="顧客入金餘額表">
      <PageHeader
        title="顧客入金餘額表"
        actions={
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="顧客入金餘額表.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        }
      />
      <Toolbar>
        <div className="flex flex-wrap gap-2.5">
          <EmployeeAutoComplete
            label={'設計師編號/姓名'}
            value={designerValue}
            onChange={value => handleDesignerChange(value)}
            className="w-[240px]"
          />
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
      </Toolbar>
      {!customerWalletBalanceData.loading && reportForDisplay !== null ? (
        <Results report={reportForDisplay} />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default CustomerWalletBalance
