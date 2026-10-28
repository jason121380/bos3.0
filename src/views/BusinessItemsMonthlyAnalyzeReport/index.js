import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import DateSelector from 'components/DateSelector'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import useFetchGetBusinessItemsMonthlyReport from 'hooks/useFetchGetBusinessItemsMonthlyReport'
import useFetchGetBusinessItemsMonthlyReportExcel from 'hooks/useFetchGetBusinessItemsMonthlyReportExcel'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

export default function Employees() {
  const [reportData, setReportData] = useState({
    businessItemsReportData: [{ serviceCategoriesPerformance: [] }],
    businessItemsReportDataTotal: { serviceCategoriesPerformance: [] },
    businessItemsReportDataDesignation: { serviceCategoriesPerformance: [] },
    businessItemsReportDataNonDesignation: { serviceCategoriesPerformance: [] },
    businessItemsReportDataDesignationProportion: { serviceCategoriesPerformance: [] },
    businessItemsReportDataPerformanceProportion: { serviceCategoriesPerformance: [] }
  })
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })

  const businessItemsMonthlyReport = useFetchGetBusinessItemsMonthlyReport({
    startDate: date.startDate,
    endDate: date.endDate
  })
  const [getBusinessItemsMonthlyReport, businessItemsMonthlyReportData] = useFetchGetBusinessItemsMonthlyReportExcel()

  useEffect(() => {
    if (!businessItemsMonthlyReport.loading) {
      const data = idx(businessItemsMonthlyReport, _ => _.data.businessItemsMonthlyReport)
      setReportData(data)
    }
  }, [businessItemsMonthlyReport.loading])

  useEffect(() => {
    if (!businessItemsMonthlyReportData.loading && businessItemsMonthlyReportData.data) {
      const url = idx(businessItemsMonthlyReportData, _ => _.data.businessItemsMonthlyReportExcel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [businessItemsMonthlyReportData.loading])

  return (
    <Page className="ui-root" title="營業項目月分析表">
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
            '  - ' +
            format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
            '   ' +
            '營業項目月分析表'}
        </div>
        <div className="merchantNamePrint">
          {'列印時間： ' +
            format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
        </div>
      </div>
      <PageHeader
        title="營業項目月分析表"
        actions={
          <>
            <Button
              className="noprint"
              variant="secondary"
              disabled={businessItemsMonthlyReportData.loading}
              onClick={() => {
                getBusinessItemsMonthlyReport({
                  variables: {
                    input: {
                      startDate: date.startDate,
                      endDate: date.endDate
                    }
                  }
                })
              }}
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </Button>
            <Button
              className="noprint"
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer strokeWidth={1.75} />
              列印
            </Button>
          </>
        }
      />
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        }
      />
      {businessItemsMonthlyReport.error ? (
          <QueryFailed onRetry={() => businessItemsMonthlyReport.refetch()} />
        ) : !businessItemsMonthlyReport.loading ?
        <Results
          reportData={reportData}
          className="mt-2"
        /> : <Skeleton className="h-96" aria-busy="true" />
      }
    </Page>
  )
}
