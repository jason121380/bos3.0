import Page from 'components/Page'
import idx from 'idx'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function ThirdPartyCoupons() {
  const thirdPartyCoupons = useFetchThirdPartyCoupons()

  return (
    <Page className="ui-root" title="第三方卡券設定">
      <PageHeader
        title="第三方卡券設定"
        actions={
          <>
            <Button asChild variant="primary">
              <RouterLink to={'/thirdPartyCoupon/create'}>{'新增第三方卡券'}</RouterLink>
            </Button>
          </>
        }
      />
      {thirdPartyCoupons.error ? (
        <QueryFailed onRetry={() => thirdPartyCoupons.refetch()} />
      ) : !thirdPartyCoupons.loading ? (
        <Results thirdPartyCouponList={idx(thirdPartyCoupons, _ => _.data.getThirdPartTicket)} thirdPartyCouponsRefetch={thirdPartyCoupons.refetch} />
      ) : (
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
