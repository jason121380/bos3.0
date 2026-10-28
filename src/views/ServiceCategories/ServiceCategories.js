import Page from 'components/Page'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function CustomerManagementList() {
  const serviceCategories = useFetchServiceCategories()
  return (
    <Page className="ui-root min-h-screen" title="服務分類設定">
      <div>
        <PageHeader
          title="服務分類設定"
          actions={
            <>
              <Button asChild variant="primary">
                <RouterLink to={'/service/category/create'}>{'新增服務類別'}</RouterLink>
              </Button>
            </>
          }
        />
        {serviceCategories.error ? (
          <QueryFailed onRetry={() => serviceCategories.refetch()} />
        ) : !serviceCategories.loading ?
          <Results
            categories={idx(serviceCategories, _ => _.data.serviceCategories) || []}
            refetchCategories={serviceCategories.refetch}
          /> : <Skeleton className="h-[320px] w-full rounded-lg" aria-label="載入中" />}

      </div>
    </Page>
  )
}

export default CustomerManagementList
