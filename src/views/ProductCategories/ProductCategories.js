/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3)
  }),
  results: css({
    marginTop: theme.spacing(2),
  }),
}

function ComodityCategories() {
  const productCategories = useFetchProductCategories()
  const categories = idx(productCategories, _ => _.data.productCategories)
  return (
    <Page css={styles.root} title="商品分類設定">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title="商品分類設定"
          primaryAction={{
            label: '新增分類',
            to: '/product/category/create'
          }}
        />
        {!productCategories.loading ?
          <Results
            className={styles.results}
            refetchCategories={productCategories.refetch}
            categories={categories}
          /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default ComodityCategories
