/** @jsxImportSource @emotion/react */
import { Button } from 'ui/button'
import { Download } from 'lucide-react'
import Page from 'components/Page'
import { endOfMonth, startOfMonth, differenceInDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState } from 'react'
import produce from 'immer'
import useFetchGetCustomerWalletLeaderboard from 'hooks/useFetchGetCustomerWalletLeaderboard'
import useFetchGetCustomerWalletLeaderboardExcel from 'hooks/useFetchGetCustomerWalletLeaderboardExcel'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Filter from './Filter'
import Results from './Results'

const styles = {
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  circular: css({
    textAlign: 'center',
    marginTop: '100px',
  })
}

function CustomerWalletLeaderboard() {
  const [getCustomerWallet, customerWalletData] = useFetchGetCustomerWalletLeaderboard()
  const [getCustomerWalletExcel, customerWalletDateExcel] = useFetchGetCustomerWalletLeaderboardExcel()
  const [reportData, setReportData] = useState([])
  const [inputData, setInputData] = useState({
    "orderType": 'DEPOSIT',
    "designerIds": [],
    "dateRange": {
      "startDate": startOfMonth(new Date()).getTime(),
      "endDate": endOfMonth(new Date()).getTime(),
    },
  })

  useEffect(() => {
    handleSearch()
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
        variant: 'error'
      })
    } else {
      getCustomerWallet({
        variables: {
          input: inputData
        },
      })
    }
  }

  const handleGetExcelData = () => {
    if (rangeLimit(inputData.dateRange)) {
      openSnackbar({
        message: '時間篩選區間不可超過一年',
        variant: 'error'
      })
    } else {
      getCustomerWalletExcel({
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
    <Page title="顧客入金排行榜" className="ui-root">
      <PageHeader
        title="顧客入金排行榜"
        actions={
          <Button
            variant='secondary'
            disabled={customerWalletDateExcel.loading}
            onClick={handleGetExcelData}
          ><Download strokeWidth={1.75} />報表匯出</Button>
        }
      />
      <Filter
        rangeLimit={rangeLimit}
        dataChange={handleDataChange}
        inputData={inputData}
        handleSearch={handleSearch}
        loading={customerWalletData.loading}
      />
      {(!customerWalletData.loading && customerWalletData.data) ? (
        <Results reportData={reportData} />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default CustomerWalletLeaderboard
