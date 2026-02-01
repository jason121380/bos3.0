/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

function CustomerManagementList() {
  const payments = useFetchPayments()
  return (
    <Page css={styles.root} title="支付方式設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='支付方式設定' subTitle='Payments' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/payment/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!payments.loading ?
          <Results
            className={styles.results}
            paymentList={idx(payments, _ => _.data.merchantPayWays)}
          />
          : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}

      </Container>
    </Page>
  )
}

export default CustomerManagementList
