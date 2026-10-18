/** @jsxImportSource @emotion/react */
import PageTitle from 'components/PageTitle'
import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import { Card, Container, Grid, Link, Button, IconButton, Collapse } from '@mui/material'
import { FilterList as FilterListIcon } from 'ui/icons'
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
        <Card
          css={css({
            display: 'flex',
            padding: '0 0 24px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: 0,
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PageTitle title='現金收支登錄' style={{ color: 'rgb(var(--accent))' }} />
            <Link component={RouterLink} to="/general/accounting/create" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                css={css({
                  borderRadius: '20px !important',
                  padding: '6px 20px !important',
                  fontSize: '14px !important',
                  boxShadow: 'none !important',
                  fontWeight: 'bold !important',
                  backgroundColor: 'rgb(var(--background)) !important',
                  color: 'rgb(var(--text-secondary)) !important',
                  '&:hover': {
                    backgroundColor: 'rgb(var(--surface)) !important',
                  }
                })}
              >
                新增
              </Button>
            </Link>
            <IconButton
              onClick={() => setShowFilter(!showFilter)}
              css={css({
                backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                color: showFilter ? 'rgb(var(--accent)) !important' : 'rgb(var(--text-secondary)) !important',
                marginLeft: '4px !important',
                '&:hover': {
                  backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                }
              })}
            >
              <FilterListIcon />
            </IconButton>
          </div>
          <DateSelector
            date={pageSetting}
            attributes={[
              'thismonth', 'lastmonth', 'dbyesterday',
              'yesterday', 'today', 'startDate', 'endDate'
            ]}
            dateChange={value => setPageSetting(value)}
          />
        </Card>

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: 'rgb(var(--background))', borderRadius: '8px', padding: '16px', border: '1px solid rgb(var(--border))' }}>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={values => setPageSetting(values)}
              outside
              visible={['employee', 'subject']}
              initFirst={!pageSetting.accountingSubjectName ? ['subject'] : []}
              relationUserId={true}
              lastInLeaderBoard={true}
            />
          </div>
        </Collapse>
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
