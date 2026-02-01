/** @jsxImportSource @emotion/react */
import {
  Container, CircularProgress, Grid, Link, Button, FormControl,
  InputLabel, Select, MenuItem, Card, IconButton, Collapse
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { addDays, endOfDay, startOfMonth } from 'date-fns'
import useFetchGetBookingManagement from 'hooks/useFetchGetBookingManagement'
import { useFetchGetCheckinSettingsForManagementList } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import { useFetchGetDeleteOrderUsing } from 'hooks/useFetchMerchantPassword'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import DateSelector from 'components/DateSelector'

import Results from './Results'

const styles = {
  root: {},
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  })
}

function WebOrderMangagementList() {
  const merchantid = localStorage.getItem('userMerchant')
    ? localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null
    : ''
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(addDays(new Date(), +90)).getTime(),
    customerId: '',
    employeeId: '',
    isReserved: true,
    isCheckin: ''
  })
  const [showFilter, setShowFilter] = useState(false)
  const [checkInDisplay, setCheclInDisplay] = useState(false)
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const getBookingManagement = useFetchGetBookingManagement({
    dateRange: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate
    },
    pageLimit: pageSetting.pageLimit,
    pageOffset: pageSetting.pageOffset,
    isCheckin: pageSetting.isCheckin === '' ? null : pageSetting.isCheckin
  })
  const getCheckinSettings = useFetchGetCheckinSettingsForManagementList()
  const getDeleteOrderUsing = useFetchGetDeleteOrderUsing()

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

  useEffect(() => {
    if (!getCheckinSettings.loading) {
      const res = getCheckinSettings.data.getMerchantCheckinSettings.isBookingCheckinEnabled
      setCheclInDisplay(res)
    }
  }, [getCheckinSettings.loading])

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  }, [getIsBookingCusCheckUsing.loading])

  return (
    <Page css={styles.root} title="預約管理">
      <Container maxWidth={false} css={styles.container}>
        <Card
          css={css({
            display: 'flex',
            padding: '12px 24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#E8F0FE',
            borderRadius: '12px',
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: '12px',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PageTitle title='預約管理' style={{ color: '#1A73E8' }} />
            <Link component={RouterLink} to={`/customer/reservation/${merchantid}?usingLineLogin=0`} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                css={css({
                  borderRadius: '20px !important',
                  padding: '6px 20px !important',
                  fontSize: '14px !important',
                  boxShadow: 'none !important',
                  fontWeight: 'bold !important',
                  backgroundColor: '#FFFFFF !important',
                  color: '#666 !important',
                  '&:hover': {
                    backgroundColor: '#f8f8f8 !important',
                  }
                })}
              >
                新預約
              </Button>
            </Link>
            <IconButton
              onClick={() => setShowFilter(!showFilter)}
              css={css({
                backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                color: showFilter ? '#1A73E8 !important' : '#666 !important',
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
            date={{ startDate: pageSetting.startDate, endDate: pageSetting.endDate }}
            attributes={[
              'thismonth', 'lastmonth', 'dbyesterday',
              'yesterday', 'today', 'startDate', 'endDate'
            ]}
            dateChange={({ startDate, endDate }) => {
              setPageSetting(
                produce(draft => {
                  draft.startDate = startDate
                  draft.endDate = endDate
                })
              )
            }}
          />
        </Card>

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
            <Grid container spacing={2} alignItems='center'>
              {checkInDisplay && (
                <Grid item>
                  <FormControl variant="outlined" style={{ width: 120 }} >
                    <InputLabel>報到狀態</InputLabel>
                    <Select
                      label='報到狀態'
                      onChange={e => setPageSetting(
                        produce(draft => {
                          draft.isCheckin = e.target.value
                        })
                      )}
                      value={pageSetting.isCheckin}
                    >
                      <MenuItem value=''><em>無</em></MenuItem>
                      <MenuItem value={true}>報到成功</MenuItem>
                      <MenuItem value={false}>未報到</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </div>
        </Collapse>
        {!getBookingManagement.loading ?
          idx(
            getBookingManagement,
            _ =>
              _.data.bookingManagement.bookings && (
                <Results
                  orders={_.data.bookingManagement.bookings}
                  checkInDisplay={checkInDisplay}
                  startDate={pageSetting.startDate}
                  endDate={pageSetting.endDate}
                  bookingCusCheck={bookingCusCheck}
                  pageSetting={_.data.bookingManagement}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  refetch={_.refetch}
                  delOrderPassUsing={getDeleteOrderUsing.loading ? false : getDeleteOrderUsing.data.merchantPassword.deleteOrder.isUsing}
                />
              )
          ) : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default WebOrderMangagementList
