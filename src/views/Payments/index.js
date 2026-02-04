/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(1),
  }),
}

function CustomerManagementList() {
  const payments = useFetchPayments()
  return (
    <Page css={styles.root} title="支付方式設定">
      <Container maxWidth={false}>
        <AdminPageHeader
          title="支付方式設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增支付方式',
            to: '/payment/create'
          }}
        />
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
