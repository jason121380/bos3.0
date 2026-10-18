import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetCustomerBonusDepositRecords from 'hooks/useFetchGetCustomerBonusDepositRecords'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import { Skeleton } from 'ui/skeleton'

function CustomerBonusRecord() {
  const customerBonusDepositRecords = useFetchGetCustomerBonusDepositRecords()

  return (
    <Page className="ui-root" title="紅利點數紀錄">
      <div>
        <AdminPageHeader
          title="紅利點數紀錄"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增紀錄',
            to: '/customer-bonus-record/create'
          }}
        />
        {!customerBonusDepositRecords.loading ?
          <Results
            recordData={idx(customerBonusDepositRecords, _ => _.data.customerBonusDepositRecords)}
            refetch={() => customerBonusDepositRecords.refetch()}
          /> : <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>}
      </div>
    </Page>
  )
}

export default CustomerBonusRecord