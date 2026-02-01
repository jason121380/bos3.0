/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import { endOfMonth, startOfMonth, differenceInDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState } from 'react'
import PageTitle from 'components/PageTitle'
import produce from 'immer'
import useFetchGetCustomerConsumptionLeaderboard from 'hooks/useFetchGetCustomerConsumptionLeaderboard'
import useFetchGetCustomerConsumptionLeaderboardExcel from 'hooks/useFetchGetCustomerConsumptionLeaderboardExcel'
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

function CustomerConsumptionLeaderboard() {
  const [getCustomerConsumption, customerConsumptionData] = useFetchGetCustomerConsumptionLeaderboard()
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
    <Page title="顧客消費排行榜">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='顧客消費排行榜' subTitle='customer consumption leaderboard' />
        <Filter
          rangeLimit={rangeLimit}
          dataChange={handleDataChange}
          inputData={inputData}
          handleSearch={handleSearch}
          loading={customerConsumptionData.loading}
          getExcel={handleGetExcelData}
          excelLoading={customerConsumptionDataExcel.loading}
        />
        {(!customerConsumptionData.loading && customerConsumptionData.data) ? (
          <Results reportData={reportData} />
        ) : (
          <div css={styles.circular}><CircularProgress /></div>
        )}
      </Container>
    </Page>
  )
}

export default CustomerConsumptionLeaderboard
