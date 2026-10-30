import { Button } from 'ui/button'
import { Download } from 'lucide-react'
import Page from 'components/Page'
import { endOfMonth, startOfMonth, differenceInDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState } from 'react'
import produce from 'immer'
import useFetchGetCustomerWalletLeaderboard from 'hooks/useFetchGetCustomerWalletLeaderboard'
import useFetchGetCustomerWalletLeaderboardExcel from 'hooks/useFetchGetCustomerWalletLeaderboardExcel'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import BackendExportNotice from 'components/BackendExportNotice'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import { isCustomerExportMaskSettingOff } from 'helper/exportCustomerMask'

import Filter from './Filter'
import Results from './Results'

function CustomerWalletLeaderboard() {
  const [getCustomerWallet, customerWalletData] = useFetchGetCustomerWalletLeaderboard()
  const customerDataMarked = useFetchCustomerDataMarked()
  const exportMaskOff = isCustomerExportMaskSettingOff(customerDataMarked)
  const [getCustomerWalletExcel, customerWalletDateExcel] = useFetchGetCustomerWalletLeaderboardExcel()
  const [reportData, setReportData] = useState([])
  const [inputData, setInputData] = useState({
    'orderType': 'DEPOSIT',
    'designerIds': [],
    'dateRange': {
      'startDate': startOfMonth(new Date()).getTime(),
      'endDate': endOfMonth(new Date()).getTime(),
    },
  })

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearch）；只在 [inputData.dateRange] 變動時呼叫，補上會每次 render 重跑
  }, [inputData.dateRange])

  useEffect(() => {
    if (!customerWalletData.loading && customerWalletData.data) {
      const data = customerWalletData.data.customerWalletLeaderboard
      setReportData(data)
    }
  }, [customerWalletData])

  useEffect(() => {
    if (!customerWalletDateExcel.loading && customerWalletDateExcel.data) {
      const url = customerWalletDateExcel.data.customerWalletLeaderboardExcel
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [customerWalletDateExcel])

  const rangeLimit = ({ startDate, endDate }) => {
    return differenceInDays(endDate, startDate) > 365
  }

  const handleSearch = () => {
    if (rangeLimit(inputData.dateRange)) {
      openSnackbar({
        message: '時間篩選區間不可超過一年',
        variant: 'error',
      })
    } else {
      getCustomerWallet({
        variables: {
          input: inputData,
        },
      })
    }
  }

  const handleGetExcelData = () => {
    if (exportMaskOff) return
    if (rangeLimit(inputData.dateRange)) {
      openSnackbar({
        message: '時間篩選區間不可超過一年',
        variant: 'error',
      })
    } else {
      getCustomerWalletExcel({
        variables: {
          input: inputData,
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
    <Page title="顧客入金排行榜" className="ui-root">
      <PageHeader
        title="顧客入金排行榜"
        actions={
          <Button variant="secondary" disabled={customerWalletDateExcel.loading || exportMaskOff} onClick={handleGetExcelData}>
            <Download strokeWidth={1.75} />
            報表匯出
          </Button>
        }
      />
      <BackendExportNotice settingOff={exportMaskOff} />
      <Filter
        rangeLimit={rangeLimit}
        dataChange={handleDataChange}
        inputData={inputData}
        handleSearch={handleSearch}
        loading={customerWalletData.loading}
      />
      {customerWalletData.error ? (
        <QueryFailed onRetry={handleSearch} />
      ) : !customerWalletData.loading && customerWalletData.data ? (
        <Results reportData={reportData} />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default CustomerWalletLeaderboard
