import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import React from 'react'
import { Card } from 'ui/card'

import Results from './Results'
import TotalPrice from 'views/AccountingShared/TotalPrice'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function AccountingRecordList() {
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    accountingSubjectName: '',
    payTypeKeyWord: '',
    relationUserId: '',
  })
  const [showFilter, setShowFilter] = React.useState(false)

  const getMoneyFlowsForAccounting = useFetchGetMoneyFlowsForAccounting({ input: pageSetting })

  return (
    <Page className="ui-root" title="高階收支登錄">
      <PageHeader
        title="高階收支登錄"
        actions={
          <>
            <DateSelector
              date={pageSetting}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              // 快速選擇日期只回傳起訖，合併進原條件：保留「現場現金」限制、篩選與筆數（Jason 2026/10/22）
              dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
            />
            <Button
              variant="secondary"
              aria-pressed={!!showFilter}
              onClick={() => setShowFilter(!showFilter)}
              className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
            >
              <ListFilter strokeWidth={1.75} />
              篩選
            </Button>
            <Button asChild variant="primary">
              <RouterLink to={'/accounting/create'}>{'新增'}</RouterLink>
            </Button>
          </>
        }
      />

      {showFilter && (
        <Card className="mb-6 p-4">
          <MerchantSearchBar
            values={pageSetting}
            onFilter={values => setPageSetting(values)}
            outside
            visible={['employee', 'subject', 'payType']}
            relationUserId={true}
            lastInLeaderBoard={true}
          />
        </Card>
      )}
      {idx(
        getMoneyFlowsForAccounting,
        _ =>
          _.data.moneyFlows && (
            <TotalPrice
              startDate={pageSetting.startDate}
              endDate={pageSetting.endDate}
              rev={_.data.moneyFlows.revenue}
              exp={_.data.moneyFlows.expenditure}
            />
          )
      )}
      {getMoneyFlowsForAccounting.error ? (
        <QueryFailed onRetry={() => getMoneyFlowsForAccounting.refetch()} />
      ) : (
        idx(getMoneyFlowsForAccounting, _ => _.data.moneyFlows && <Results moneyFlows={_.data.moneyFlows} pageSetting={pageSetting} />)
      )}
    </Page>
  )
}

export default AccountingRecordList
