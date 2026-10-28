import Page from 'components/Page'
import useFetchGetCustomerBonusDepositRecords from 'hooks/useFetchGetCustomerBonusDepositRecords'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function CustomerBonusRecord() {
  const customerBonusDepositRecords = useFetchGetCustomerBonusDepositRecords()

  return (
    <Page className="ui-root" title="紅利點數紀錄">
      <div>
        <PageHeader
          title="紅利點數紀錄"
          actions={
            <>
              <Button asChild variant="primary">
                <RouterLink to={'/customer-bonus-record/create'}>{'新增紀錄'}</RouterLink>
              </Button>
            </>
          }
        />
        {customerBonusDepositRecords.error ? (
          <QueryFailed onRetry={() => customerBonusDepositRecords.refetch()} />
        ) : !customerBonusDepositRecords.loading ?
          <Results
            // 查詢失敗時傳空陣列（原本傳 undefined 整頁錯誤；Jason 2026/10/22 fix all）
            recordData={idx(customerBonusDepositRecords, _ => _.data.customerBonusDepositRecords) || []}
            refetch={() => customerBonusDepositRecords.refetch()}
          /> : <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>}
      </div>
    </Page>
  )
}

export default CustomerBonusRecord