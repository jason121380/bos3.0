import Page from 'components/Page'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import useFetchGetMembershipSellReport from 'hooks/useFetchGetMembershipSellReport'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked, { maskCustomerName } from 'helper/exportCustomerMask'
import AdminPageHeader from 'components/AdminPageHeader'
import { ReportToolbar } from 'ui/page-header'
import { startOfDay, endOfDay, format } from 'date-fns'
import { CSVLink } from "react-csv";
import roundDecimal from './../../helper/roundDecimal.js'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

export default function MembershipSellReport() {
  const [excelData, setExcelData] = useState([])
  const [inputData, setInputData] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    customerId: '',
    membershipId: '',
  })
  const [reportData, setReportData] = useState([])
  // 匯出客資一律經 exportCustomerMask：只有遮罩設定查詢成功且為 false 才匯出完整顧客姓名（Jason 2026/10/22 長期授權修正）
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isCustomerDataMasked = isExportCustomerMasked(customerDataMarkedData)
  const getMembershipSellReport = useFetchGetMembershipSellReport({
    input: {
      dateRange: {
        startDate: inputData.startDate,
        endDate: inputData.endDate,
      },
      designerId: inputData.employeeId === '' ? null : inputData.employeeId,
      customerId: inputData.customerId === '' ? null : inputData.customerId,
      membershipId: inputData.membershipId === '' ? null : inputData.membershipId,
    }
  })

  const handleCountTotal = key => {
    const total = reportData.reduce((a, b) => a + b[key], 0)
    return roundDecimal(total)
  }

  useEffect(() => {
    if (!getMembershipSellReport.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有資料，不讓整頁拋錯
      const data = idx(getMembershipSellReport, _ => _.data.membershipSellReport) || []
      setReportData(data)
    }
  }, [getMembershipSellReport])

  useEffect(() => {
    const data = []
    reportData.forEach(d => {
      data.push({
        帳單日期: format(d.orderDate, 'yyyy/MM/dd'),
        帳單編號: `#${d.orderNo}`,
        設計師姓名: d.designerName,
        顧客姓名: isCustomerDataMasked ? maskCustomerName(d.customerName) : d.customerName,
        會員卡名稱: d.membershipName,
        實際售價: d.sellPrice,
        數量: d.count,
        小計: d.summary,
        手續費: roundDecimal(d.handlingFee),
        '販賣業績(實)': roundDecimal(d.truth),
        抽成: roundDecimal(d.rake),
        備註: d.remark,
        到期日: d.expiryDate ? format(d.expiryDate, 'yyyy/MM/dd') : '永久會籍'
      })
    })
    data.push({
      帳單日期: '',
      帳單編號: '',
      設計師姓名: ' ',
      顧客姓名: '',
      會員卡名稱: '合計',
      實際售價: handleCountTotal('sellPrice'),
      數量: handleCountTotal('count'),
      小計: handleCountTotal('summary'),
      手續費: handleCountTotal('handlingFee'),
      '販賣業績(實)': handleCountTotal('truth'),
      抽成: handleCountTotal('rake'),
      備註: '',
      到期日: '',
    })
    setExcelData(data)
  }, [reportData, isCustomerDataMasked])

  return (
    <Page className="ui-root" title="會員卡銷售報表">
      <div>
        <AdminPageHeader title='會員卡銷售報表'>
          <Button asChild variant="secondary">
            <CSVLink data={excelData} filename="會員卡銷售報表.csv">
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        </AdminPageHeader>
        {/* 日期留在篩選列；其餘條件收進「篩選」（STYLE §14）。MerchantSearchBar 拆兩個實例共用同一份 values（同帳單列表），收合區的那個不讀網址日期 */}
        <ReportToolbar
          date={
            <MerchantSearchBar
              values={inputData}
              onFilter={values => setInputData(values)}
              outside
              visible={['datePicker']}
              lastInLeaderBoard={true}
            />
          }
          filters={
            <MerchantSearchBar
              values={inputData}
              onFilter={values => setInputData(values)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer', 'membershipcard']}
              lastInLeaderBoard={true}
            />
          }
        />
        {!getMembershipSellReport.loading ? (
          <Results
            reportData={reportData}
            format={format}
            roundDecimal={roundDecimal}
            handleCountTotal={handleCountTotal}
          />
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}
