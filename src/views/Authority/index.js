import Page from 'components/Page'
import idx from 'idx'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { Skeleton } from 'ui/skeleton'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'
import QueryFailed from 'components/QueryFailed'

function Authority() {
  const merchantAuthData = useFetchMerchantAuthorities()
  return (
    <Page className="ui-root" title="角色權限管理">
      <AdminPageHeader
        title="角色權限管理"
        primaryAction={{
          label: '新增角色',
          to: '/role/create'
        }}
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
