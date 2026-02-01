/** @jsxImportSource @emotion/react */
import { Container, Grid, Button, Link } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
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
import styles from './styles/TopUp'

function CustomerManagementList() {
  const [date, setDate] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    customerId: '',
    payWay: [],
  })

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
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='入金管理' subTitle='Top Up' />
          <Grid item>
            <Link component={RouterLink} to="/topup/create">
              <Button color="primary" variant="contained">
                新增
              </Button>
            </Link>
          </Grid>
        </Grid>
        <MerchantSearchBar
          values={date}
          onFilter={value => setDate(value)}
          outside
          visible={['datePicker', 'employee', 'customer', 'payment']}
          // initFirst={!date.employeeId || !date.customerId ? ['employee', 'customerId'] : []}
          lastInLeaderBoard={true}
        />
        <RecordResults
          pagenationLabel={pagenationLabel}
          className={styles.results}
          date={{ start: resultSetting.record.start, end: resultSetting.record.end }}
          resultSetting={resultSetting}
          walletDepositRecord={walletDepositRecord}
          onChange={event => handleChangeResult({ ...event, name: 'record' })}
        />
        <UsagedResult
          pagenationLabel={pagenationLabel}
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
