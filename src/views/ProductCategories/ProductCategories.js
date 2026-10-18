import Page from 'components/Page'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'
import { Skeleton } from 'ui/skeleton'

function ComodityCategories() {
  const productCategories = useFetchProductCategories()
  const categories = idx(productCategories, _ => _.data.productCategories)
  return (
    <Page className="ui-root" title="商品分類設定">
      <AdminPageHeader
        title="商品分類設定"
        primaryAction={{
          label: '新增分類',
          to: '/product/category/create'
        }}
      />
      {!productCategories.loading ?
        <Results
          refetchCategories={productCategories.refetch}
          categories={categories}
        /> : (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
    </Page>
  )
}

export default ComodityCategories
