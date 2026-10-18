import Page from 'components/Page'
import idx from 'idx'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
import { Skeleton } from 'ui/skeleton'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

function ThirdPartyCoupons() {
  const thirdPartyCoupons = useFetchThirdPartyCoupons()

  return (
    <Page className="ui-root" title="第三方卡券設定">
      <AdminPageHeader
        title="第三方卡券設定"
        primaryAction={{
          label: '新增第三方卡券',
          to: '/thirdPartyCoupon/create'
        }}
      />
      {!thirdPartyCoupons.loading ?
        <Results
          thirdPartyCouponList={idx(thirdPartyCoupons, _ => _.data.getThirdPartTicket)}
          thirdPartyCouponsRefetch={thirdPartyCoupons.refetch}
        />
        : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
    </Page>
  )
}

export default ThirdPartyCoupons
