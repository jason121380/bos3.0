/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/ProductCategories'

function ComodityCategories() {
  const productCategories = useFetchProductCategories()
  const categories = idx(productCategories, _ => _.data.productCategories)
  return (
    <Page css={styles.root} title="商品分類設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='商品分類設定' subTitle='Product Category' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/product/category/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!productCategories.loading ?
          <Results
            className={styles.results}
            refetchCategories={productCategories.refetch}
            categories={categories}
          />: <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default ComodityCategories
