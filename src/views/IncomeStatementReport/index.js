/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import DateSelector from 'components/DateSelector'
import { endOfMonth, format } from 'date-fns'
import idx from 'idx'
import React from 'react'
import useFetchMerchantIncomeStatementV2OuterStore from 'hooks/useFetchMerchantIncomeStatementV2ForOuterStore'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  result: css({
    marginTop: theme.spacing(1),
  }),
}

export default function IncomeStatementReport() {
  const [date, setDate] = React.useState({
    startDate: new Date().getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })
  const merchantIncomeStatementDataV2OuterStore = useFetchMerchantIncomeStatementV2OuterStore({
    date: date.startDate,
  })

  return (
    <Page title="損益表" css={styles.root} className='IncomeStatementReport'>
      <Container maxWidth={false}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
              '   ' +
              '損益表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <PageTitle title='損益表' subTitle='Income Statement Report' />
        <Grid container alignItems='center' justifyContent='space-between' className="noprint">
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
            margin
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
          />
          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={() => window.print()}
            style={{ backgroundColor: '#3865AC' }}
          >
            列印
          </Button>
        </Grid>
        {merchantIncomeStatementDataV2OuterStore.loading ? (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        ) : (
          idx(merchantIncomeStatementDataV2OuterStore, _ => (
            <React.Fragment>
              <Results
                className={styles.result}
                incomeStatement={_.data.merchantIncomeStatementV2ForOuterStore}
              />
            </React.Fragment>
          ))
        )}
      </Container>
    </Page>
  )
}
