/** @jsxImportSource @emotion/react */
import { Container, Grid, Link, Button } from '@mui/material'
import PageTitle from 'components/PageTitle'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'
import TotalPrice from './TotalPrice'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

function AccountingRecordList() {
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 500,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    accountingSubjectName: '',
    payTypeKeyWord: '現場現金',
    relationUserId: '',
  })
  const getMoneyFlowsForAccounting = useFetchGetMoneyFlowsForAccounting({ input: pageSetting })

  const handlePageChange = (event, newPage) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = newPage
      })
    )
  }
  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }
  return (
    <Page css={styles.root} title="現金收支登錄">
      <Container maxWidth={false} css={styles.container}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='現金收支登錄' subTitle='GENERAL ACCOUNTING RECORDS' />
          <Grid item>
            <Link component={RouterLink} to="/general/accounting/create">
              <Button color="primary" variant="contained">
                新增
              </Button>
            </Link>
          </Grid>
        </Grid>
        <MerchantSearchBar
          values={pageSetting}
          onFilter={values => setPageSetting(values)}
          outside
          visible={['datePicker', 'employee', 'subject']}
          initFirst={!pageSetting.accountingSubjectName ? ['subject'] : []}
          relationUserId={true}
          lastInLeaderBoard={true}
        />
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
                className={styles.results}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                moneyFlows={_.data.moneyFlows}
                pageSetting={pageSetting}
              />
            )
        )}
      </Container>
    </Page>
  )
}

export default AccountingRecordList
