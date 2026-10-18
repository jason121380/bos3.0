/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import useFetchGetBusinessItemsMonthlyReport from 'hooks/useFetchGetBusinessItemsMonthlyReport'
import useFetchGetBusinessItemsMonthlyReportExcel from 'hooks/useFetchGetBusinessItemsMonthlyReportExcel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(1),
  }),
  printBtn: css({
    backgroundColor: 'rgb(var(--accent))',
  }),
}

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
    <Page css={styles.root} title="營業項目月分析表">
      <Container maxWidth={false} css={styles.container}>
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
        <AdminPageHeader title='營業項目月分析表' />
        <Grid container style={{ alignItems: 'center', justifyContent: 'space-between' }} className="noprint">
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <Grid item style={{ gap: 10, display: 'flex' }}>
            <Button
              className="noprint"
              size="medium"
              variant="contained"
              color="primary"
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
              報表匯出
            </Button>
            <Button
              className="noprint"
              size="medium"
              variant="contained"
              color="primary"
              onClick={() => window.print()}
            >
              列印
            </Button>
          </Grid>
        </Grid>
        {!businessItemsMonthlyReport.loading ?
          <Results
            reportData={reportData}
            className={styles.results}
          /> : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}
