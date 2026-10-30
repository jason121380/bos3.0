import { Button } from 'ui/button'
import { Download } from 'lucide-react'
import Page from 'components/Page'
import { endOfMonth, startOfMonth, differenceInDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState } from 'react'
import { PageHeader } from 'ui/page-header'
import produce from 'immer'
import useFetchGetCustomerConsumptionLeaderboard from 'hooks/useFetchGetCustomerConsumptionLeaderboard'
import useFetchGetCustomerConsumptionLeaderboardExcel from 'hooks/useFetchGetCustomerConsumptionLeaderboardExcel'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import BackendExportNotice from 'components/BackendExportNotice'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import { isCustomerExportMaskSettingOff } from 'helper/exportCustomerMask'

import Filter from './Filter'
import Results from './Results'

function CustomerConsumptionLeaderboard() {
  const [getCustomerConsumption, customerConsumptionData] = useFetchGetCustomerConsumptionLeaderboard()
  const customerDataMarked = useFetchCustomerDataMarked()
  const exportMaskOff = isCustomerExportMaskSettingOff(customerDataMarked)
  const [getCustomerConsumptionExcel, customerConsumptionDataExcel] = useFetchGetCustomerConsumptionLeaderboardExcel()
  const [reportData, setReportData] = useState([])
  const [inputData, setInputData] = useState({
    "orderType": 'ALL',
    "designerIds": [],
    "dateRange": {
      "startDate": startOfMonth(new Date()).getTime(),
      "endDate": endOfMonth(new Date()).getTime(),
    },
    "consumptionTypes": []
  })

  useEffect(() => {
    handleSearch()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearch）；只在 [inputData.dateRange] 變動時呼叫，補上會每次 render 重跑
  }, [inputData.dateRange])

  useEffect(() => {
    if (!customerConsumptionData.loading && customerConsumptionData.data) {
      const data = customerConsumptionData.data.customerConsumptionLeaderboard
      setReportData(data)
    }
  }, [customerConsumptionData])

  useEffect(() => {
    if (!customerConsumptionDataExcel.loading && customerConsumptionDataExcel.data) {
      const url = customerConsumptionDataExcel.data.customerConsumptionLeaderboardExcel
      const link = document.createElement('a')
			link.href = url
			link.click()
    }
  }, [customerConsumptionDataExcel])

  const rangeLimit = ({ startDate, endDate }) => {
    return differenceInDays(endDate, startDate) > 365
  }

  const handleSearch = () => {
    if (rangeLimit(inputData.dateRange)) {
      openSnackbar({
        message: '時間篩選區間不可超過一年',
        variant: 'error'
      })
    } else {
      getCustomerConsumption({
        variables: {
          input: inputData
        },
      })
    }
  }

  const handleGetExcelData = () => {
    if (exportMaskOff) return
    if (rangeLimit(inputData.dateRange)) {
      openSnackbar({
        message: '時間篩選區間不可超過一年',
        variant: 'error'
      })
    } else {
      getCustomerConsumptionExcel({
        variables: {
          input: inputData
        },
      })
    }
  }

  const handleDataChange = (value, key) => {
    setInputData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  return (
    <Page className="ui-root" title="顧客消費排行榜">
      <div>
        <PageHeader title='顧客消費排行榜'>
          <Button
            variant='secondary'
            disabled={customerConsumptionDataExcel.loading || exportMaskOff}
            onClick={handleGetExcelData}
          ><Download strokeWidth={1.75} />報表匯出</Button>
        </PageHeader>
        <BackendExportNotice settingOff={exportMaskOff} />
        <Filter
          rangeLimit={rangeLimit}
          dataChange={handleDataChange}
          inputData={inputData}
          handleSearch={handleSearch}
          loading={customerConsumptionData.loading}
        />
        {customerConsumptionData.error ? (
          <QueryFailed onRetry={handleSearch} />
        ) : (!customerConsumptionData.loading && customerConsumptionData.data) ? (
          <Results reportData={reportData} />
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

export default CustomerConsumptionLeaderboard
