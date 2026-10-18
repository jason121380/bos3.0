import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import useFetchDesignersSalaryDetailReport from 'hooks/useFetchUserSalaryDetail'
import { useFetchGetUserSalaryDetailExceLazy } from 'hooks/useFetchGetUserSalaryDetailExcel'
import idx from 'idx'
import { format } from 'date-fns'
import { Skeleton } from 'ui/skeleton'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

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
        <AdminPageHeader
          title="薪資明細表"
          secondaryActions={[
            {
              label: '報表匯出',
              onClick: handleExportExcel,
              disabled: getUserSalaryDetailExceLazyData.loading,
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
        {!designersSalaryDetailReportData.loading ? (
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
