/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { Container, CircularProgress, Button, Grid } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { format } from 'date-fns'
import idx from 'idx'
import { useFetchGetHelperMonthlyReport } from 'hooks/useFetchGetHelperMonthlyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
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
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
  printBtn: css({
    backgroundColor: 'rgb(var(--accent))',
  }),
}

const HelperMontlyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const helperMonthlyData = useFetchGetHelperMonthlyReport(date)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !helperMonthlyData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const helperMonthlyReport = idx(helperMonthlyData, _ => _.data.helperMonthlyReport)
      const membershipPerformanceTotal = helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipPerformance, 0)
      const membershipRakeTotal = helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipRake, 0)
      setMembershipDisplay(
        (membershipPerformanceTotal !== 0 || membershipRakeTotal !== 0) ||
        isMemberShipCardActive
      )
    }
  }, [isMemberShipCardActiveData.loading, helperMonthlyData.loading])

  return (
    <Page css={styles.root} title="互助月報表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '互助月報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='互助月報表' />
        <Grid container style={{ alignItems: 'center', justifyContent: 'space-between' }} className="noprint">
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <Grid className="printGrid">
            <Button
              size="medium"
              variant="contained"
              color="primary"
              onClick={() => window.print()}
            >
              列印
            </Button>
          </Grid>
        </Grid>

        {!helperMonthlyData.loading ? (
          idx(
            helperMonthlyData,
            _ =>
              _.data.helperMonthlyReport !== null && (
                <Results
                  helperMonthlyReport={_.data.helperMonthlyReport}
                  membershipDisplay={membershipDisplay}
                />
              )
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default HelperMontlyReport
