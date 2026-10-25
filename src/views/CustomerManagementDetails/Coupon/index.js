import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import produce from 'immer'
import { Fragment, useState } from 'react'
import roundDecimal from './../../../helper/roundDecimal.js'
import { Skeleton } from 'ui/skeleton'

import BoughtResults from './BoughtResults'
import UsagedResults from './UsagedResults'

export default function Coupon({ customer, pagenationLabel }) {
  const [resultSetting, setResultSetting] = useState({
    boughtRecords: {
      customerId: customer.id,
      pageLimit: 50,
      pageOffset: 0,
    },
    usagedResults: {
      customerId: customer.id,
      pageLimit: 50,
      pageOffset: 0,
      isUseTicket: true,
    },
  })
  const boughtTicketRecords = useFetchTicketRecords(resultSetting.boughtRecords)
  const usagedTicketRecoeds = useFetchTicketRecords(resultSetting.usagedResults)

  const handlePageSettingChange = ({ key, value, name }) => {
    setResultSetting(
      produce(draft => {
        draft[name].pageOffset = key === 'pageLimit' ? 0 : resultSetting[name].pageOffset
        draft[name][key] = value
      })
    )
  }
  return (
    <Fragment>
      {!boughtTicketRecords.loading && !usagedTicketRecoeds.loading ? (
        <div className="flex flex-col gap-6">
          {idx(
            boughtTicketRecords,
            _ =>
              _.data.ticketRecords.data && (
                <BoughtResults
                  results={_.data.ticketRecords.data}
                  page={{
                    limit: _.data.ticketRecords.pageLimit,
                    offset: _.data.ticketRecords.pageOffset,
                    count: _.data.ticketRecords.totalCount,
                  }}
                  onChangePage={(_event, page) =>
                    handlePageSettingChange({ value: page, key: 'pageOffset', name: 'boughtRecords' })
                  }
                  onChangeRowsPerPage={event => {
                    handlePageSettingChange({
                      value: idx(event, _ => _.target.value),
                      key: 'pageLimit',
                      name: 'boughtRecords',
                    })
                  }}
                  pagenationLabel={pagenationLabel}
                  roundDecimal={roundDecimal}
                />
              )
          )}
          {idx(
            usagedTicketRecoeds,
            _ =>
              _.data.ticketRecords.data && (
                <UsagedResults
                  results={_.data.ticketRecords.data}
                  page={{
                    limit: _.data.ticketRecords.pageLimit,
                    offset: _.data.ticketRecords.pageOffset,
                    count: _.data.ticketRecords.totalCount,
                  }}
                  onChangePage={(_event, page) =>
                    handlePageSettingChange({ value: page, key: 'pageOffset', name: 'usagedResults' })
                  }
                  onChangeRowsPerPage={event => {
                    handlePageSettingChange({
                      value: idx(event, _ => _.target.value),
                      key: 'pageLimit',
                      name: 'usagedResults',
                    })
                  }}
                  pagenationLabel={pagenationLabel}
                  roundDecimal={roundDecimal}
                />
              )
          )}
        </div>
      ) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>}
    </Fragment>
  )
}
