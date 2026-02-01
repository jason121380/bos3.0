/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Grid } from '@mui/material'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import PageTitle from 'components/PageTitle'
import useFetchProducts from 'hooks/useFetchProducts'
import idx from 'idx'
import { useState, useEffect } from 'react'
import produce from 'immer'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/Products'

function CustomerManagementList() {
  const [setting, setSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const [productCategories, setProductCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [productList, setProductList] = useState([])

  const products = useFetchProducts(setting)

  const productCategoriesData = useFetchProductCategories()

  const handlePageChange = ({ key, value }) => {
    setSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleClickCategorie = categorieId => {
    setSelectedCategorie([categorieId])
    setSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSetting({
      keyword: '',
      categoryIds: [],
    })
  }

  useEffect(() => {
    if (!productCategoriesData.loading && !products.loading) {
      const productList = idx(products, _ => _.data.products)
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)

      setProductList(productList)
      setProductCategories(productCategories)
    }
  }, [products.loading, products.data, productCategoriesData.loading, productCategoriesData.data])

  return (
    <Page css={styles.root} title="商品列表">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='商品列表' subTitle='Products' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/product/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        <SearchBar
          style={{ marginBottom: 16, marginTop: 0 }}
          onSearch={event =>
            handlePageChange({
              key: 'keyword',
              value: event,
            })
          }
        />
        <div className="divText">點選商品類別進行篩選</div>
        <div css={styles.categorieDiv}>
          {productCategories.map(productCategory => (
            <Button
              variant={
                selectedCategorie.indexOf(productCategory.id) !== -1 ? 'contained' : 'outlined'
              }
              color="primary"
              size="small"
              onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
              disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
              key={productCategory.id}
              style={{ margin: 3 }}
            >
              {productCategory.name}
            </Button>
          ))}
          <Button
            variant="contained"
            size="small"
            color="error"
            style={{ color: 'white' }}
            onClick={handleClearCategorie}
          >
            清除
          </Button>
        </div>
        {productList.length !== 0 ? (
          <Results
            products={productList}
            refetchProducts={products.refetch}
            onPageChange={handlePageChange}
          />
        ) : products.loading && <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default CustomerManagementList
