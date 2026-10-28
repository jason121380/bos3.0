import Page from 'components/Page'
import idx from 'idx'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

import Results from './Results'
import { Skeleton } from 'ui/skeleton'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function ComodityCategories() {
  // 拿到會員卡全部類別
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )
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
        {!useFetchGetMembershipCategories({ paranoid: true, }).loading ?
          <Results categories={categories} /> :
          <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
        }
      </div>
    </Page>
  )
}

export default ComodityCategories
