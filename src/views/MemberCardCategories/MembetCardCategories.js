import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

import Results from './Results'
import { Skeleton } from 'ui/skeleton'

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
        <AdminPageHeader
          title="會員卡分類設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增',
            to: '/member-card-category/create'
          }}
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
