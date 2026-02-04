/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Collapse, Typography } from '@mui/material'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import useFetchProducts from 'hooks/useFetchProducts'
import idx from 'idx'
import { useState, useEffect } from 'react'
import produce from 'immer'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const localStyles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3)
  }),
  filterPanel: css({
    marginBottom: '12px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #f0f0f0',
  }),
  categorieDiv: css({
    marginTop: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '4px 16px !important',
    fontSize: '13px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
  }),
}

function CustomerManagementList() {
  const [setting, setSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const [showFilter, setShowFilter] = useState(false)
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
    <Page css={localStyles.root} title="商品列表">
      <Container maxWidth={false} css={localStyles.container}>
        <AdminPageHeader
          title="商品列表"
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新增商品',
            to: '/product/create'
          }}
        />

        <Collapse in={showFilter}>
          <div css={localStyles.filterPanel}>
            <SearchBar
              style={{ marginBottom: 16, marginTop: 0 }}
              onSearch={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
            />
            <div style={{ marginTop: '16px' }}>
              <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block', fontWeight: 'bold' }}>
                按商品類別篩選
              </Typography>
              <div css={localStyles.categorieDiv}>
                {productCategories.map(productCategory => (
                  <Button
                    key={productCategory.id}
                    variant={selectedCategorie.indexOf(productCategory.id) !== -1 ? 'contained' : 'outlined'}
                    color="primary"
                    size="small"
                    css={localStyles.pillButton}
                    onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                    disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                  >
                    {productCategory.name}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  css={localStyles.pillButton}
                  style={{ color: 'white' }}
                  onClick={handleClearCategorie}
                >
                  清除篩選
                </Button>
              </div>
            </div>
          </div>
        </Collapse>
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
