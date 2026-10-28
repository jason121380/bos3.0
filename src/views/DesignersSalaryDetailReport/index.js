import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import useFetchDesignersSalaryDetailReport from 'hooks/useFetchUserSalaryDetail'
import { useFetchGetUserSalaryDetailExceLazy } from 'hooks/useFetchGetUserSalaryDetailExcel'
import idx from 'idx'
import { format } from 'date-fns'
import { Skeleton } from 'ui/skeleton'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Toolbar, PageHeader } from 'ui/page-header'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const DesignersSalaryDetailReport = () => {
  const [date, setDate] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime(),
  })
  const designersSalaryDetailReportData = useFetchDesignersSalaryDetailReport({
    date: date.startDate,
  })
  const { getUserSalaryDetailExceLazy, getUserSalaryDetailExceLazyData } = useFetchGetUserSalaryDetailExceLazy()
  useEffect(() => {
    if (!getUserSalaryDetailExceLazyData.loading && getUserSalaryDetailExceLazyData.data !== undefined) {
      const url = idx(getUserSalaryDetailExceLazyData, _ => _.data.getUserSalaryDetailExcel)
      window.open(url)
    }
  }, [getUserSalaryDetailExceLazyData.loading])

  const handleExportExcel = () => {
    getUserSalaryDetailExceLazy({
      variables: {
        date: date.startDate,
      }
    })
  }

  return (
    <Page className='DesignersSalaryDetailReport' title="薪資明細表">
      <div>
        <PageHeader
          title="薪資明細表"
          actions={
            <>
              <Button
                variant="secondary"
                className="noprint"
                onClick={handleExportExcel}
                disabled={getUserSalaryDetailExceLazyData.loading}
              >
                <Download strokeWidth={1.75} />
                報表匯出
              </Button>
              <Button
                variant="secondary"
                className="noprint"
                onClick={() => window.print()}
              >
                <Printer strokeWidth={1.75} />
                列印
              </Button>
            </>
          }
        />
        <Toolbar>
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
        </Toolbar>
        {designersSalaryDetailReportData.error ? (
          <QueryFailed onRetry={() => designersSalaryDetailReportData.refetch()} />
        ) : !designersSalaryDetailReportData.loading ? (
          idx(designersSalaryDetailReportData, _ => (
            <Results
              salaryDetailReport={_.data.getUserSalaryDetail}
              merchantSalaryIncreaseItems={_.data.getUserSalaryDetail.usingSalaryIncreaseItem}
              merchantSalaryDecreaseItems={_.data.getUserSalaryDetail.usingSalaryDecreaseItem}
              designersSalaryDetailReportDataLoading={designersSalaryDetailReportData.loading}
            />
          ))
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint flex flex-col gap-6" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[240px] w-full rounded-lg" />
            <Skeleton className="h-[160px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default DesignersSalaryDetailReport
