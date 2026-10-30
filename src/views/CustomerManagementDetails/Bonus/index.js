import idx from 'idx'
import { Fragment } from 'react'
import { Skeleton } from 'ui/skeleton'

import RecordResults from './RecordResults'

export default function Bonus({ customer, customerBonusRecords }) {
  return (
    <Fragment>
      {!customerBonusRecords.loading ? (
        <RecordResults
          recordData={idx(customerBonusRecords, _ => _.data.customerBonusRecord)}
          refetch={() => customerBonusRecords.refetch()}
          customer={customer}
        />
      ) : (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}
    </Fragment>
  )
}
