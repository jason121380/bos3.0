/** @jsxImportSource @emotion/react */
import { Container, Grid, Button, Link } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import PageTitle from 'components/PageTitle'
import { Collapse } from '@mui/material'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchWalletDepositRecord from 'hooks/useFetchWalletDepositRecord'
import useFetchWalletUseRecord from 'hooks/useFetchWalletUseRecord'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import pagenationLabel from './../../helper/pagenationLabel'

import RecordResults from './RecordResults'
import UsagedResult from './UsagedResult'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  }),
  container: css({
    padding: '0px !important',
  }),
  result: css({
    marginBottom: theme.spacing(1.5),
  }),
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
}

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
  const handleChangeResult = ({ event, key, name }) => {
    if (event.persist) event.persist()
    setResultSetting(
      produce(draft => {
        draft[name][key] = idx(event, _ => _.target.value)
      })
    )
  }

  return (
    <Page css={styles.root} title="入金管理">
      <Container maxWidth={false} css={styles.container}>
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
        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: 'rgb(var(--background))', borderRadius: '12px', padding: '16px', border: '1px solid rgb(var(--border))' }}>
            <MerchantSearchBar
              values={date}
              onFilter={value => setDate(value)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer', 'payment']}
              lastInLeaderBoard={true}
            />
          </div>
        </Collapse>
        <RecordResults
          pagenationLabel={pagenationLabel}
          className={styles.result}
          date={{ start: resultSetting.record.start, end: resultSetting.record.end }}
          resultSetting={resultSetting}
          walletDepositRecord={walletDepositRecord}
          onChange={event => handleChangeResult({ ...event, name: 'record' })}
        />
        <UsagedResult
          pagenationLabel={pagenationLabel}
          className={styles.result}
          date={{ start: resultSetting.usaged.start, end: resultSetting.usaged.end }}
          resultSetting={resultSetting}
          walletUseRecord={walletUseRecord}
          onChange={event => handleChangeResult({ ...event, name: 'usaged' })}
        />
      </Container>
    </Page>
  )
}

export default CustomerManagementList
