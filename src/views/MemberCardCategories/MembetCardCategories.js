import Page from 'components/Page'
import idx from 'idx'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Skeleton } from 'ui/skeleton'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function ComodityCategories() {
  // 拿到會員卡全部類別
  const membershipCategories = useFetchGetMembershipCategories({
    paranoid: true,
  })
  const categories = idx(membershipCategories, _ => _.data.membershipCategories)
  return (
    <Page className="ui-root" title="會員卡分類設定">
      <div>
        <PageHeader
          title="會員卡分類設定"
          actions={
            <>
              <Button asChild variant="primary">
                <RouterLink to={'/member-card-category/create'}>{'新增'}</RouterLink>
              </Button>
            </>
          }
        />
        {membershipCategories.error ? (
          <QueryFailed onRetry={() => membershipCategories.refetch()} />
        ) : !membershipCategories.loading ?
          <Results categories={categories} onChanged={() => membershipCategories.refetch()} /> :
          <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
        }
      </div>
    </Page>
  )
}

export default ComodityCategories
