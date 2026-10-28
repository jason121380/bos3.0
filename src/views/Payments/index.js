import Page from 'components/Page'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function CustomerManagementList() {
  const payments = useFetchPayments()
  return (
    <Page className="ui-root" title="支付方式設定">
      <div>
        <PageHeader
          title="支付方式設定"
          actions={
            <>
              <Button asChild variant="primary">
                <RouterLink to={'/payment/create'}>{'新增支付方式'}</RouterLink>
              </Button>
            </>
          }
        />
        {payments.error ? (
          <QueryFailed onRetry={() => payments.refetch()} />
        ) : !payments.loading ?
          <Results
            paymentList={idx(payments, _ => _.data.merchantPayWays)}
          />
          : <Skeleton className="h-[320px] w-full rounded-lg" aria-label="載入中" />}

      </div>
    </Page>
  )
}

export default CustomerManagementList
