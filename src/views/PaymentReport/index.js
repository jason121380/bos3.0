/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import { startOfMonth } from 'date-fns'
import useFetchMerchantOtherPayWayDetailReport from 'hooks/useFetchMerchantOtherPayWayDetailReport'
import PageTitle from 'components/PageTitle'
import DateSelector from 'components/DateSelector'
import { theme } from '../../theme'
import { css } from '@emotion/react'

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
  exportBtn: css({
    float: 'right',
  }),
  formGroup: css({
    width: '10rem',
    marginLeft: theme.spacing(3),
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
  }),
}

const PaymentReport = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [paymentsName, setPaymentsName] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })

  const merchantOtherPayWayDetailReportData = useFetchMerchantOtherPayWayDetailReport({
    input: date,
  })
  useEffect(() => {
    if (!merchantOtherPayWayDetailReportData.loading) {
      const report = idx(
        merchantOtherPayWayDetailReportData,
        _ => _.data.merchantOtherPayWayDetailReport.merchantOtherPayWayDetailReport
      )
      const paymentsName = idx(
        merchantOtherPayWayDetailReportData,
        _ => _.data.merchantOtherPayWayDetailReport.usedPayType
      )
      setPaymentsName(paymentsName)
      setReportForDisplay(report)
    }
  }, [merchantOtherPayWayDetailReportData.loading])

  return (
    <Page css={styles.root} title="每日非現金明細">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='每日非現金明細' subTitle='Payment Report' />
        <DateSelector
          date={date}
          attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
          margin
        />
        {!merchantOtherPayWayDetailReportData.loading &&
          reportForDisplay !== null ? (
          <Results report={reportForDisplay} paymentsName={paymentsName} />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default PaymentReport
