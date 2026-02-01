/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
  const serviceCategories = useFetchServiceCategories()
  return (
    <Page css={styles.root} title="服務分類設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='服務分類設定' subTitle='Service Category' />
          <Grid item>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/service/category/create"
              style={{ backgroundColor: '#3865AC' }}
            >
              新增服務類別
            </Button>
          </Grid>
        </Grid>
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
