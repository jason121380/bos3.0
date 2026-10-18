/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button, Collapse } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import PageTitle from 'components/PageTitle'
import TicketsAutocpmplete from 'components/TicketsAutocpmplete'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchTicketSellOverviewLazy } from 'hooks/useFetchTicketSellOverview'
import { useFetchUsedTicketRecordsLazy } from 'hooks/useFetchUsedTicketRecords.js'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import pagenationLabel from './../../helper/pagenationLabel'
import useQueryString from 'hooks/useQueryString'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import BoughtResults from './BoughtResults'
import UsagedResults from './UsagedResults'

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
  selector: css({
    display: 'flex',
    gap: 10,
    flexDirection: 'column',
    marginBottom: 8,
    backgroundColor: 'rgb(var(--background))',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgb(var(--border))'
  })
}

export default function ManagementCoupons() {
  const [ticketSellOverviewLazy, ticketSellOverviewData] = useFetchTicketSellOverviewLazy()
  const [getUsedTicketRecords, usedTicketRecordsData] = useFetchUsedTicketRecordsLazy()
  const [getQueryString] = useQueryString()
  const [pageSetting, setPageSetting] = useState({
    startDate: Number(getQueryString('startDate')) || startOfMonth(new Date()).getTime(),
    endDate: Number(getQueryString('endDate')) || endOfDay(new Date()).getTime(),
    employeeId: '',
    customerId: '',
    ticketIds: []
  })
  const [showFilter, setShowFilter] = useState(false)

  const [resultSetting, setResultSetting] = useState({
    boughtRecords: {
      pageLimit: 50,
      pageOffset: 0,
    },
    usagedResults: {
      pageLimit: 50,
      pageOffset: 0,
    },
  })

  const handlePageSettingChange = ({ key, value, name }) => {
    setResultSetting(
      produce(draft => {
        draft[name].pageOffset = key === 'pageLimit' ? 0 : resultSetting[name].pageOffset
        draft[name][key] = value
      })
    )
  }

  const handleSearch = () => {
    ticketSellOverviewLazy({
      variables: {
        input: {
          dateRange: {
            startDate: pageSetting.startDate,
            endDate: pageSetting.endDate,
          },
          ticketIds: pageSetting.ticketIds,
          designerId: pageSetting.employeeId,
          customerId: pageSetting.customerId,
        }
      }
    })
    getUsedTicketRecords({
      variables: {
        input: {
          startDate: pageSetting.startDate,
          endDate: pageSetting.endDate,
          designerId: pageSetting.employeeId,
          customerId: pageSetting.customerId,
          ...resultSetting.usagedResults,
        },
        ticketIds: pageSetting.ticketIds
      }
    })
  }

  useEffect(() => {
    getUsedTicketRecords({
      variables: {
        input: {
          startDate: pageSetting.startDate,
          endDate: pageSetting.endDate,
          designerId: pageSetting.employeeId,
          customerId: pageSetting.customerId,
          ...resultSetting.usagedResults,
        },
        ticketIds: pageSetting.ticketIds
      }
    })
  }, [resultSetting.usagedResults])


  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <Page title="卡券管理" css={styles.root}>
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title='卡券管理'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
        >
          <DateSelector
            attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            date={{
              startDate: pageSetting.startDate,
              endDate: pageSetting.endDate
            }}
            dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
            margin={false}
          />
        </AdminPageHeader>
        <Collapse in={showFilter}>
          <div css={styles.selector}>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer']}
              lastInLeaderBoard={true}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flexGrow: 1 }}>
                <TicketsAutocpmplete
                  value={pageSetting.ticketIds}
                  onChange={value => {
                    setPageSetting(
                      produce(draft => {
                        draft.ticketIds = value
                      })
                    )
                  }}
                />
              </div>
              <Button
                style={{ height: 'fit-content' }}
                color='primary'
                variant='contained'
                onClick={handleSearch}
                disabled={ticketSellOverviewData.loading || usedTicketRecordsData.loading}
              >查詢</Button>
            </div>
          </div>
        </Collapse>
        <div css={styles.container}>
          {!ticketSellOverviewData.loading && ticketSellOverviewData.data ?
            <BoughtResults
              pagenationLabel={pagenationLabel}
              className={styles.result}
              results={ticketSellOverviewData.data.ticketSellOverview}
              page={resultSetting.boughtRecords}
              onChangePage={(_event, page) =>
                handlePageSettingChange({
                  value: page,
                  key: 'pageOffset',
                  name: 'boughtRecords',
                })
              }
              onChangeRowsPerPage={event => {
                handlePageSettingChange({
                  value: idx(event, _ => _.target.value),
                  key: 'pageLimit',
                  name: 'boughtRecords',
                })
              }}
              roundDecimal={roundDecimal}
            /> : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
          }
          {
            !usedTicketRecordsData.loading && usedTicketRecordsData.data ? (
              idx(usedTicketRecordsData,
                _ => (
                  <UsagedResults
                    pagenationLabel={pagenationLabel}
                    results={_.data.usedTicketRecords.data}
                    page={{
                      limit: _.data.usedTicketRecords.pageLimit,
                      offset: _.data.usedTicketRecords.pageOffset,
                      count: _.data.usedTicketRecords.totalCount,
                    }}
                    onChangePage={(_event, page) =>
                      handlePageSettingChange({
                        value: page,
                        key: 'pageOffset',
                        name: 'usagedResults',
                      })
                    }
                    onChangeRowsPerPage={event => {
                      handlePageSettingChange({
                        value: idx(event, _ => _.target.value),
                        key: 'pageLimit',
                        name: 'usagedResults',
                      })
                    }}
                    roundDecimal={roundDecimal}
                  />
                )
              )
            ) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
          }
        </div>
      </Container>
    </Page>
  )
}
