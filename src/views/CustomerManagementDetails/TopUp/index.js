import useFetchWalletDepositRecord from 'hooks/useFetchWalletDepositRecord'
import useFetchWalletUseRecord from 'hooks/useFetchWalletUseRecord'
import useFetchGetCustomerWallet from 'hooks/useFetchCustomerWallet'
import idx from 'idx'
import produce from 'immer'
import React, { useEffect, useState } from 'react'

import RecordResults from './RecordResults'
import UsagedResult from './UsagedResult'

export default function TopUp({ customer, pagenationLabel }) {
  const [resultSetting, setResultSetting] = useState({
    record: {
      pageLimit: 50,
      pageOffset: 0,
    },
    usaged: {
      pageLimit: 50,
      pageOffset: 0,
    },
  })
  const [walletBalance, setWalletBalance] = useState(0)
  const walletDepositRecord = useFetchWalletDepositRecord({
    start: resultSetting.record.start,
    end: resultSetting.record.end,
    pageLimit: resultSetting.record.pageLimit,
    pageOffset: resultSetting.record.pageOffset,
    customerId: customer.id,
  })
  const walletUseRecord = useFetchWalletUseRecord({
    start: resultSetting.usaged.start,
    end: resultSetting.usaged.end,
    pageLimit: resultSetting.usaged.pageLimit,
    pageOffset: resultSetting.usaged.pageOffset,
    customerId: customer.id,
  })
  const customerWallet = useFetchGetCustomerWallet({ customerId: customer.id })
  const handleChangeResult = ({ event, key, name }) => {
    if (event.persist) event.persist()
    setResultSetting(
      produce(draft => {
        draft[name][key] = idx(event, _ => _.target.value)
      })
    )
  }

  useEffect(() => {
    if (!customerWallet.loading) {
      setWalletBalance(customerWallet.data.customerWallet)
    }
  }, [customerWallet.loading])

  return (
    <div className="flex flex-col gap-6">
      <RecordResults
        date={{ start: resultSetting.record.start, end: resultSetting.record.end }}
        resultSetting={resultSetting}
        walletDepositRecord={walletDepositRecord}
        onChange={event => handleChangeResult({ ...event, name: 'record' })}
        walletBalance={walletBalance}
        pagenationLabel={pagenationLabel}
      />
      <UsagedResult
        date={{ start: resultSetting.usaged.start, end: resultSetting.usaged.end }}
        resultSetting={resultSetting}
        walletUseRecord={walletUseRecord}
        onChange={event => handleChangeResult({ ...event, name: 'usaged' })}
        pagenationLabel={pagenationLabel}
      />
    </div>
  )
}
