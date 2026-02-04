/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetCustomerBonusDepositRecords from 'hooks/useFetchGetCustomerBonusDepositRecords'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/ProductCategories'

function CustomerBonusRecord() {
  const customerBonusDepositRecords = useFetchGetCustomerBonusDepositRecords()

  return (
    <Page css={styles.root} title="紅利點數紀錄">
      <Container maxWidth={false}>
        <AdminPageHeader
          title="紅利點數紀錄"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增紀錄',
            to: '/customer-bonus-record/create'
          }}
        />
        {!customerBonusDepositRecords.loading ?
          <Results
            recordData={idx(customerBonusDepositRecords, _ => _.data.customerBonusDepositRecords)}
            refetch={() => customerBonusDepositRecords.refetch()}
            className={styles.results}
          /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default CustomerBonusRecord