import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import idx from 'idx'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter, Plus } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { PageHeader, Toolbar, ToolbarSpacer } from 'ui/page-header'

import Results from './Results'
import TotalPrice from './TotalPrice'

function AccountingRecordList() {
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    accountingSubjectName: '',
    payTypeKeyWord: '現場現金',
    relationUserId: '',
  })
  const [showFilter, setShowFilter] = React.useState(false)
  const getMoneyFlowsForAccounting = useFetchGetMoneyFlowsForAccounting({ input: pageSetting })

  return (
    <Page className="ui-root" title="現金收支登錄">
      <PageHeader
        title="現金收支登錄"
        actions={
          <Button asChild variant="primary">
            <RouterLink to="/general/accounting/create">
              <Plus strokeWidth={1.75} />
              新增
            </RouterLink>
          </Button>
        }
      />
      <Toolbar>
        <DateSelector
          date={pageSetting}
          attributes={[
            'thismonth', 'lastmonth', 'dbyesterday',
            'yesterday', 'today', 'startDate', 'endDate'
          ]}
          // 快速選擇日期只回傳起訖，合併進原條件：保留「現場現金」限制、篩選與筆數（Jason 2026/10/22）
          dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
        />
        <ToolbarSpacer />
        <Button
          variant="secondary"
          aria-pressed={showFilter}
          className={showFilter ? 'border-text bg-surface-hover' : undefined}
          onClick={() => setShowFilter(!showFilter)}
        >
          <ListFilter strokeWidth={1.75} />
          篩選
        </Button>
      </Toolbar>

      {showFilter && (
        <Card className="mb-6 p-4">
          <MerchantSearchBar
            values={pageSetting}
            onFilter={values => setPageSetting(values)}
            outside
            visible={['employee', 'subject']}
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
      {idx(
        getMoneyFlowsForAccounting,
        _ =>
          _.data.moneyFlows && (
            <Results
              moneyFlows={_.data.moneyFlows}
              pageSetting={pageSetting}
            />
          )
      )}
    </Page>
  )
}

export default AccountingRecordList
