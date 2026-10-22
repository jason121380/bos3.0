import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import PageTitle from 'components/PageTitle'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchWalletDepositRecord from 'hooks/useFetchWalletDepositRecord'
import useFetchWalletUseRecord from 'hooks/useFetchWalletUseRecord'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked from 'helper/exportCustomerMask'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import pagenationLabel from './../../helper/pagenationLabel'

import RecordResults from './RecordResults'
import UsagedResult from './UsagedResult'
import { Card } from 'ui/card'

function CustomerManagementList() {

  const [date, setDate] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    customerId: '',
    payWay: [],
  })
  const [showFilter, setShowFilter] = React.useState(false)

  const [resultSetting, setResultSetting] = React.useState({
    record: {
      pageLimit: 50,
      pageOffset: 0,
    },
    usaged: {
      pageLimit: 50,
      pageOffset: 0,
    },
  })
  const walletDepositRecord = useFetchWalletDepositRecord({
    start: date.startDate,
    end: date.endDate,
    pageLimit: resultSetting.record.pageLimit,
    pageOffset: resultSetting.record.pageOffset,
    designerId: date.employeeId,
    customerId: date.customerId,
    payType: date.payWay,
  })
  const walletUseRecord = useFetchWalletUseRecord({
    start: date.startDate,
    end: date.endDate,
    pageLimit: resultSetting.usaged.pageLimit,
    pageOffset: resultSetting.usaged.pageOffset,
    designerId: date.employeeId,
    customerId: date.customerId,
  })
  // 匯出檔遮罩客資比照帳單列表：只有設定查詢成功且為 false 才不遮罩（Jason 2026/10/22 同意）
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isCustomerDataMarked = isExportCustomerMasked(customerDataMarkedData)
  const handleChangeResult = ({ event, key, name }) => {
    if (event.persist) event.persist()
    setResultSetting(
      produce(draft => {
        draft[name][key] = idx(event, _ => _.target.value)
      })
    )
  }

  return (
    <Page className="ui-root" title="入金管理">
        <AdminPageHeader
          title='入金管理'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新增',
            to: '/topup/create'
          }}
        >
          <DateSelector
            attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            date={date}
            dateChange={value => setDate(prev => ({ ...prev, ...value }))}
            margin={false}
          />
        </AdminPageHeader>
        {/* 以 hidden 收合（取代 MUI Collapse）：篩選元件保持掛載，收合後內容與舊版一樣保留 */}
        <div hidden={!showFilter}>
          <Card className="mb-6 p-4">
            <MerchantSearchBar
              values={date}
              onFilter={value => setDate(value)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer', 'payment']}
              lastInLeaderBoard={true}
            />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
        <RecordResults
          pagenationLabel={pagenationLabel}
          date={{ start: resultSetting.record.start, end: resultSetting.record.end }}
          resultSetting={resultSetting}
          walletDepositRecord={walletDepositRecord}
          isCustomerDataMarked={isCustomerDataMarked}
          onChange={event => handleChangeResult({ ...event, name: 'record' })}
        />
        <UsagedResult
          pagenationLabel={pagenationLabel}
          date={{ start: resultSetting.usaged.start, end: resultSetting.usaged.end }}
          resultSetting={resultSetting}
          walletUseRecord={walletUseRecord}
          isCustomerDataMarked={isCustomerDataMarked}
          onChange={event => handleChangeResult({ ...event, name: 'usaged' })}
        />
        </div>
    </Page>
  )
}

export default CustomerManagementList
