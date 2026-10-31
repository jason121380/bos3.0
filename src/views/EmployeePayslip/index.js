// 薪資條外框（.EmployeePayslipTableContainer，列印時以 initialize.scss 改為 display:block）改原生 div：
// 保留同一個 className，螢幕上維持原 Grid container 的 flex-wrap 滿寬排版，內層 Results 的 Grid item 不動
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
import { useFetchGetPayslipOptimization, useFetchGetIsPrintDateHiddenForPayslip } from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'

import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import Results from './Results'
import { ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import QueryFailed from 'components/QueryFailed'

export default function Payroll() {
  const [date, setDate] = useState({
    startDate: subMonths(new Date(), 1).getTime(),
  })
  const [showFilter, setShowFilter] = useState(false)
  const usersSalaryData = useFetchUserSalaryReport({ date: date.startDate })
  const [searchId, setSearchId] = useState()
  const employeePayslipPrintStyle = useFetchGetEmployeePayslipPrintStyle()
  const [getUserSalaryExcelLazy, getUserSalaryExcelLazyData] = useFetchGetUserSalaryExcelLazy()
  const isDisplayFakePerformance = useFetchGetIsDisplayFakePerformanceInSalaryReport()
  const EPWDDisplay = useFetchGetIsEPWDDisplay()
  const getIsPrintDetailDisplayOnSalaryReport = useFetchGetIsPrintDetailDisplayOnSalaryReport()
  const getPayslipOptimization = useFetchGetPayslipOptimization()
  const getIsPrintdetailHidden = useFetchGetIsPrintDateHiddenForPayslip()
  const detailDisplay = getIsPrintDetailDisplayOnSalaryReport.loading
    ? true
    : idx(getIsPrintDetailDisplayOnSalaryReport, _ => _.data.getIsPrintDetailDisplayOnSalaryReport)
  const payslipOptimization = getPayslipOptimization.loading
    ? false
    : idx(getPayslipOptimization, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPayslipOptimizationPrintModeOn)
  const isPrintdetailHidden = getIsPrintdetailHidden.loading
    ? false
    : idx(getIsPrintdetailHidden, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPrintDateHiddenForPayslip)

  useEffect(() => {
    if (!getUserSalaryExcelLazyData.loading && getUserSalaryExcelLazyData.data !== undefined) {
      const url = idx(getUserSalaryExcelLazyData, _ => _.data.userSalaryReportExcel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getUserSalaryExcelLazyData.loading])

  const handleExcel = () => {
    getUserSalaryExcelLazy({
      variables: {
        date: date.startDate,
        designerId: searchId,
      },
    })
  }
  return (
    <Page title="薪資條" className="EmployeePayslip">
      <div>
        <PageHeader
          title="薪資條"
          actions={
            <>
              <DateSelector
                date={date}
                attributes={['lastmonth', 'thismonth', 'startDate']}
                dateChange={value => setDate(value)}
                onlyStart
                inputFormat="yyyy/MM"
                pickerOption={{
                  views: ['month', 'year'],
                }}
              />
              <Button variant="secondary" onClick={handleExcel} disabled={getUserSalaryExcelLazyData.loading} className={'noprint'}>
                {'報表匯出'}
              </Button>
              <Button variant="secondary" onClick={() => window.print()} className={'noprint'}>
                {'列印'}
              </Button>
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
            </>
          }
        />

        {showFilter && (
          <Card className="mb-3 flex items-center gap-3 p-4">
            <span className="text-label text-text-secondary">篩選條件：</span>
            <DesignerSearch value={searchId} label="設計師編號/姓名" onChange={value => setSearchId(value.userId)} />
          </Card>
        )}

        {usersSalaryData.error ? (
          <QueryFailed onRetry={() => usersSalaryData.refetch()} />
        ) : !usersSalaryData.loading &&
          !isDisplayFakePerformance.loading &&
          !getIsPrintDetailDisplayOnSalaryReport.loading &&
          !EPWDDisplay.loading ? (
          idx(usersSalaryData, _ =>
            _.data.userSalaryReport.length > 0 ? (
              <div className={'EmployeePayslipTableContainer flex w-full flex-wrap'}>
                <Results
                  userSalaryReport={_.data.userSalaryReport}
                  date={date.startDate}
                  searchId={searchId}
                  EPWDDisplay={EPWDDisplay.data.getIsEPWDDisplay}
                  isDisplayFakePerformance={idx(isDisplayFakePerformance, _ => _.data.getIsDisplayFakePerformanceInSalaryReport)}
                  printStyle={idx(employeePayslipPrintStyle, _ => _.data.getEmployeePayslipPrintStyle)}
                  detailDisplay={!isPrintdetailHidden && !detailDisplay}
                  payslipOptimization={payslipOptimization}
                />
              </div>
            ) : (
              <Card>
                <EmptyState title="無資料" />
              </Card>
            )
          )
        ) : (
          <Skeleton className="h-96 w-full" />
        )}
      </div>
    </Page>
  )
}
