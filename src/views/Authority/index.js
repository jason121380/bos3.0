import Page from 'components/Page'
import idx from 'idx'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function Authority() {
  const merchantAuthData = useFetchMerchantAuthorities()
  return (
    <Page className="ui-root" title="角色權限管理">
      <PageHeader
        title="角色權限管理"
        actions={
          <>
            <Button asChild variant="primary">
              <RouterLink to={'/role/create'}>{'新增角色'}</RouterLink>
            </Button>
          </>
        }
      />
      {merchantAuthData.error ? (
          <QueryFailed onRetry={() => merchantAuthData.refetch()} />
        ) : !merchantAuthData.loading ?
        idx(merchantAuthData, _ => (
          <Results
            merchantAuth={_.data.getMerchantAuthorities}
            merchantAuthDataRefetch={merchantAuthData.refetch}
          />
        )) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
    </Page>
  )
}

export default Authority
