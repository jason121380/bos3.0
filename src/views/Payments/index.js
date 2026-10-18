import Page from 'components/Page'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { Skeleton } from 'ui/skeleton'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

function CustomerManagementList() {
  const payments = useFetchPayments()
  return (
    <Page className="ui-root" title="支付方式設定">
      <div>
        <AdminPageHeader
          title="支付方式設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增支付方式',
            to: '/payment/create'
          }}
        />
        {!payments.loading ?
          <Results
            paymentList={idx(payments, _ => _.data.merchantPayWays)}
          />
          : <Skeleton className="h-[320px] w-full rounded-lg" aria-label="載入中" />}

      </div>
    </Page>
  )
}

export default CustomerManagementList
