/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import { endOfMonth, startOfMonth, differenceInDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import produce from 'immer'
import useFetchGetCustomerWalletLeaderboard from 'hooks/useFetchGetCustomerWalletLeaderboard'
import useFetchGetCustomerWalletLeaderboardExcel from 'hooks/useFetchGetCustomerWalletLeaderboardExcel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
    <Page title="顧客入金排行榜">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='顧客入金排行榜' />
        <Filter
          rangeLimit={rangeLimit}
          dataChange={handleDataChange}
          inputData={inputData}
          handleSearch={handleSearch}
          loading={customerWalletData.loading}
          getExcel={handleGetExcelData}
          excelLoading={customerWalletDateExcel.loading}
        />
        {(!customerWalletData.loading && customerWalletData.data) ? (
          <Results reportData={reportData} />
        ) : (
          <div css={styles.circular}><CircularProgress /></div>
        )}
      </Container>
    </Page>
  )
}

export default CustomerWalletLeaderboard
