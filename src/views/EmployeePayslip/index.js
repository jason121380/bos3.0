// 薪資條外框（.EmployeePayslipTableContainer，列印時以 initialize.scss 改為 display:block）改原生 div：
// 保留同一個 className，螢幕上維持原 Grid container 的 flex-wrap 滿寬排版，內層 Results 的 Grid item 不動
import AdminPageHeader from 'components/AdminPageHeader'
import Page from 'components/Page'
import idx from 'idx'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { subMonths } from 'date-fns'
import useFetchUserSalaryReport from 'hooks/useFetchUserSalaryReport'
import DesignerSearch from 'components/DesignerBeenAssistedAutoComplete'
import DateSelector from 'components/DateSelector'
import { useFetchGetUserSalaryExcelLazy } from 'hooks/useFetchGetUserSalaryExcel'
import useFetchGetIsDisplayFakePerformanceInSalaryReport from 'hooks/useFetchGetIsDisplayFakePerformanceInSalaryReport'
import useFetchGetEmployeePayslipPrintStyle from 'hooks/useFetchGetEmployeePayslipPrintStyle'
import useFetchGetIsEPWDDisplay from 'hooks/useFetchGetIsEPWDDisplay'
import useFetchGetIsPrintDetailDisplayOnSalaryReport from 'hooks/useFetchGetIsPrintDetailDisplayOnSalaryReport'
import {
  useFetchGetPayslipOptimization, useFetchGetIsPrintDateHiddenForPayslip
} from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'

import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import Results from './Results'

export default function Payroll() {
  const [date, setDate] = useState({
    startDate: subMonths(new Date(), 1).getTime(),
  })
  const [showFilter, setShowFilter] = useState(false)
  const usersDalaryData = useFetchUserSalaryReport({ date: date.startDate })
  const [searchId, setSearchId] = useState()
  const employeePayslipPrintStyle = useFetchGetEmployeePayslipPrintStyle()
  const [getUserSalaryExcelLazy, getUserSalaryExcelLazyData] = useFetchGetUserSalaryExcelLazy()
  const isDisplayFakePerformance = useFetchGetIsDisplayFakePerformanceInSalaryReport()
  const EPWDDisplay = useFetchGetIsEPWDDisplay()
  const getIsPrintDetailDisplayOnSalaryReport = useFetchGetIsPrintDetailDisplayOnSalaryReport()
  const getPayslipOptimization = useFetchGetPayslipOptimization()
  const getIsPrintdetailHidden = useFetchGetIsPrintDateHiddenForPayslip()
  const detailDisplay = getIsPrintDetailDisplayOnSalaryReport.loading ? true : idx(getIsPrintDetailDisplayOnSalaryReport, _ => _.data.getIsPrintDetailDisplayOnSalaryReport)
  const payslipOptimization = getPayslipOptimization.loading ? false : idx(getPayslipOptimization, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPayslipOptimizationPrintModeOn)
  const isPrintdetailHidden = getIsPrintdetailHidden.loading ? false : idx(getIsPrintdetailHidden, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPrintDateHiddenForPayslip)

  useEffect(() => {
    if (!getUserSalaryExcelLazyData.loading && getUserSalaryExcelLazyData.data !== undefined) {
      const url = idx(getUserSalaryExcelLazyData, _ => _.data.userSalaryReportExcel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [getUserSalaryExcelLazyData.loading])

  const handleExcel = () => {
    getUserSalaryExcelLazy({
      variables: {
        date: date.startDate,
        designerId: searchId,
      }
    })
  }
  return (
    <Page title="薪資條" className='EmployeePayslip'>
      <div>
        <AdminPageHeader
          title="薪資條"
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          secondaryActions={[
            {
              label: '報表匯出',
              onClick: handleExcel,
              disabled: getUserSalaryExcelLazyData.loading,
              className: "noprint"
            },
            {
              label: '列印',
              onClick: () => window.print(),
              className: "noprint"
            }
          ]}
        >
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
          />
        </AdminPageHeader>

        {showFilter && (
          <Card className="mb-3 flex items-center gap-3 p-4">
            <span className="text-label text-text-secondary">篩選條件：</span>
            <DesignerSearch
              value={searchId}
              label="設計師編號/姓名"
              onChange={value => setSearchId(value.userId)}
            />
          </Card>
        )}

        {(!usersDalaryData.loading && !isDisplayFakePerformance.loading && !getIsPrintDetailDisplayOnSalaryReport.loading && !EPWDDisplay.loading) ?
          idx(
            usersDalaryData,
            _ =>
              _.data.userSalaryReport.length > 0 ? (
                <div className={'EmployeePayslipTableContainer flex w-full flex-wrap'}>
                  <Results
                    userSalaryReport={_.data.userSalaryReport}
                    date={date.startDate}
                    searchId={searchId}
                    EPWDDisplay={EPWDDisplay.data.getIsEPWDDisplay}
                    isDisplayFakePerformance={idx(
                      isDisplayFakePerformance,
                      _ => _.data.getIsDisplayFakePerformanceInSalaryReport
                    )}
                    printStyle={idx(
                      employeePayslipPrintStyle,
                      _ => _.data.getEmployeePayslipPrintStyle
                    )}
                    detailDisplay={!isPrintdetailHidden && !detailDisplay}
                    payslipOptimization={payslipOptimization}
                  />
                </div>
              ) : <Card><EmptyState title="無資料" /></Card>
          ) :
          <Skeleton className="h-96 w-full" />
        }
      </div>
    </Page>
  )
}
