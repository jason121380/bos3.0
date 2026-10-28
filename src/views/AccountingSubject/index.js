import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchMoneyAccountDetail from 'hooks/useFetchMoneyAccountDetail'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { PageHeader, Toolbar } from 'ui/page-header'

import QueryFailed from 'components/QueryFailed'
import Results from './Results'

export default function AccountingSubject({ history, location }) {
  const [date, setDate] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [resultSetting, setResultSetting] = React.useState({
    moneyAccountDetail: {
      pageLimit: 20,
      pageOffset: 0,
    },
  })
  const moneyAccountDetail = useFetchMoneyAccountDetail({
    ...date,
    ...resultSetting.moneyAccountDetail,
  })

  const handleOnChangePage = ({ key, page }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = page
      })
    )
  }
  const handleOnChangeRowsPerPage = ({ value, key }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = 0
        draft[key].pageLimit = value
      })
    )
  }
  return (
    <Page title="收支科目明細" className="ui-root">
      <PageHeader title="收支科目明細" />
      <Toolbar>
        <MerchantSearchBar
          values={date}
          onFilter={values => setDate(values)}
          outside
          visible={['datePicker', 'payment']}
        />
      </Toolbar>
      {moneyAccountDetail.error ? (
        <QueryFailed onRetry={() => moneyAccountDetail.refetch()} />
      ) : idx(
        moneyAccountDetail,
        _ =>
          _.data.moneyAccountDetail && (
            <Results
              results={_.data.moneyAccountDetail}
              handleOnChangePage={(_event, page) =>
                handleOnChangePage({ page, key: 'moneyAccountDetail' })
              }
              handleOnChangeRowsPerPage={event =>
                handleOnChangeRowsPerPage({
                  value: idx(event, _ => _.target.value),
                  key: 'moneyAccountDetail',
                })
              }
            />
          )
      )}
    </Page>
  )
}
