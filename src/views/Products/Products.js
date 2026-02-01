/** @jsxImportSource @emotion/react */
import { Card, Container, Button, CircularProgress, Grid, IconButton, Collapse, Link } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import PageTitle from 'components/PageTitle'
import useFetchProducts from 'hooks/useFetchProducts'
import idx from 'idx'
import { useState, useEffect } from 'react'
import produce from 'immer'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'
import styles from './styles/Products'

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
    <Page css={styles.root} title="商品列表">
      <Container maxWidth={false}>
        <Card
          css={css({
            display: 'flex',
            padding: '12px 24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#E8F0FE',
            borderRadius: '12px',
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: '12px',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PageTitle title='商品列表' style={{ color: '#1A73E8' }} />
            <Link component={RouterLink} to="/product/create" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                css={css({
                  borderRadius: '20px !important',
                  padding: '6px 20px !important',
                  fontSize: '14px !important',
                  boxShadow: 'none !important',
                  fontWeight: 'bold !important',
                  backgroundColor: '#FFFFFF !important',
                  color: '#666 !important',
                  '&:hover': {
                    backgroundColor: '#f8f8f8 !important',
                  }
                })}
              >
                新增
              </Button>
            </Link>
            <IconButton
              onClick={() => setShowFilter(!showFilter)}
              css={css({
                backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                color: showFilter ? '#1A73E8 !important' : '#666 !important',
                marginLeft: '4px !important',
                '&:hover': {
                  backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                }
              })}
            >
              <FilterListIcon />
            </IconButton>
          </div>
        </Card>

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
            <SearchBar
              style={{ marginBottom: 16, marginTop: 0 }}
              onSearch={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
            />
            <div style={{ marginTop: '12px' }}>
              <div className="divText" style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>點選商品類別進行篩選</div>
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
