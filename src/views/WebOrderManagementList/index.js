/** @jsxImportSource @emotion/react */
import {
  Container, CircularProgress, Grid, Link, Button, FormControl,
  InputLabel, Select, MenuItem, Card, IconButton, Collapse
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import Page from 'components/Page'
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
import AdminPageHeader from 'components/AdminPageHeader'

import Results from './Results'

const styles = {
  root: {},
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  })
}

function WebOrderMangagementList() {
  // 從本地存儲獲取商戶 ID
  const merchantid = localStorage.getItem('userMerchant')
    ? localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null
    : ''

  // 分頁與過濾器狀態管理
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(addDays(new Date(), +90)).getTime(),
    customerId: '',
    employeeId: '',
    isReserved: true,
    isCheckin: ''
  })

  // UI 狀態：切換過濾器、報到功能顯示、未來預約確認邏輯
  const [showFilter, setShowFilter] = useState(false)
  const [checkInDisplay, setCheclInDisplay] = useState(false)
  const [bookingCusCheck, setBookingCusCheck] = useState(false)

  // 獲取後端數據
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

  /**
   * 處理分頁切換
   */
  const handlePageChange = (event, newPage) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = newPage
      })
    )
  }

  /**
   * 處理每頁顯示筆數切換
   */
  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }

  // 同步報到設置
  useEffect(() => {
    if (!getCheckinSettings.loading) {
      const res = getCheckinSettings.data.getMerchantCheckinSettings.isBookingCheckinEnabled
      setCheclInDisplay(res)
    }
  }, [getCheckinSettings.loading])

  // 同步未來預約確認設置
  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  }, [getIsBookingCusCheckUsing.loading])

  return (
    <Page css={styles.root} title="預約管理">
      <Container maxWidth={false} css={styles.container}>

        <AdminPageHeader
          title='預約管理'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新預約',
            to: `/customer/reservation/${merchantid}?usingLineLogin=0`
          }}
        >
          <DateSelector
            date={{ startDate: pageSetting.startDate, endDate: pageSetting.endDate }}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={({ startDate, endDate }) => {
              setPageSetting(
                produce(draft => {
                  draft.startDate = startDate
                  draft.endDate = endDate
                })
              )
            }}
          />
        </AdminPageHeader>

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
