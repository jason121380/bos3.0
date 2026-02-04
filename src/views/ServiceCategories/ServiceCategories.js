/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(6),
    minHeight: '100vh',
  }),
  results: css({
    marginTop: theme.spacing(2),
  }),
}

function CustomerManagementList() {
  const serviceCategories = useFetchServiceCategories()
  return (
    <Page css={styles.root} title="服務分類設定">
      <Container maxWidth={false}>
        <AdminPageHeader
          title="服務分類設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增服務類別',
            to: '/service/category/create'
          }}
        />
        {!serviceCategories.loading ?
          <Results
            className={styles.results}
            categories={idx(serviceCategories, _ => _.data.serviceCategories) || []}
            refetchCategories={serviceCategories.refetch}
          /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}

      </Container>
    </Page>
  )
}

export default CustomerManagementList
