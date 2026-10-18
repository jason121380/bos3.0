import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

function CustomerManagementList() {
  const serviceCategories = useFetchServiceCategories()
  return (
    <Page className="ui-root min-h-screen" title="服務分類設定">
      <div>
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
            categories={idx(serviceCategories, _ => _.data.serviceCategories) || []}
            refetchCategories={serviceCategories.refetch}
          /> : <Skeleton className="h-[320px] w-full rounded-lg" aria-label="載入中" />}

      </div>
    </Page>
  )
}

export default CustomerManagementList
