import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import useFetchProducts from 'hooks/useFetchProducts'
import idx from 'idx'
import { useState, useEffect } from 'react'
import produce from 'immer'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { Link as RouterLink } from 'react-router-dom'
import AdminPageHeader from 'components/AdminPageHeader'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import Results from './Results'
import QueryFailed from 'components/QueryFailed'

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
        // 換關鍵字：回到第一頁（停在後面的頁數可能沒有資料）
        if (key === 'keyword') draft.pageOffset = 0
      })
    )
  }

  const handleClickCategorie = categorieId => {
    setSelectedCategorie([categorieId])
    setSetting(pre => {
      return {
        ...pre,
        pageOffset: 0,
        categoryIds: [categorieId],
      }
    })
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    // 保留每頁筆數、回到第一頁（原本整個換掉，每頁筆數與頁數都被拿掉）
    setSetting(pre => ({
      ...pre,
      pageOffset: 0,
      keyword: '',
      categoryIds: [],
    }))
  }

  useEffect(() => {
    if (!productCategoriesData.loading && !products.loading) {
      // 查詢失敗時 data 為 undefined：當作沒有資料，不讓整頁拋錯
      const productList = idx(products, _ => _.data.products) || []
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories) || []

      setProductList(productList)
      setProductCategories(productCategories)
    }
  }, [products.loading, products.data, productCategoriesData.loading, productCategoriesData.data])

  return (
    <Page className="ui-root" title="商品列表">
      <AdminPageHeader
        title="商品列表"
        showFilter={showFilter}
        onFilterClick={() => setShowFilter(!showFilter)}
        primaryAction={{
          label: '新增商品',
          to: '/product/create'
        }}
      />

      {/* 以 hidden 收合（取代 MUI Collapse），SearchBar 保持掛載，輸入內容與舊版一樣不會因收合而清空 */}
      <div hidden={!showFilter}>
        <Card className="mb-6 flex flex-col gap-4 p-5">
          <SearchBar
            onSearch={event =>
              handlePageChange({
                key: 'keyword',
                value: event,
              })
            }
          />
          <div className="flex flex-col gap-2">
            <span className="text-label text-text-secondary">
              按商品類別篩選
            </span>
            <div className="flex flex-wrap gap-2">
              {productCategories.map(productCategory => (
                <Button
                  key={productCategory.id}
                  size="sm"
                  variant="secondary"
                  aria-pressed={selectedCategorie.indexOf(productCategory.id) !== -1}
                  className={selectedCategorie.indexOf(productCategory.id) !== -1 ? 'bg-accent/8 text-accent disabled:opacity-100' : undefined}
                  onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                  disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                >
                  {productCategory.name}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="text-danger hover:bg-danger/8"
                onClick={handleClearCategorie}
              >
                清除篩選
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {products.error ? (
          <QueryFailed onRetry={() => products.refetch()} />
        ) : productList.length !== 0 ? (
        <Results
          products={productList}
          refetchProducts={products.refetch}
          onPageChange={handlePageChange}
        />
      ) : products.loading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[72px] w-full rounded-lg" />
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )
      }
    </Page>
  )
}

export default CustomerManagementList
