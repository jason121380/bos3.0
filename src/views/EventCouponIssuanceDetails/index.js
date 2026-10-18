/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button, Collapse } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import MainEventAutocomplete from 'components/MainEventAutocomplete'
import DateSelector from 'components/DateSelector'
import { useFetchGetVoucherIssuanceRecordLazy } from 'hooks/useFetchGetVoucherIssuanceRecord'
import produce from 'immer'
import format from 'date-fns/format'
import { CSVLink } from "react-csv";
import AdminPageHeader from 'components/AdminPageHeader'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3)
  }),
  filterWrap: css({
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '4px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    height: '32px !important',
  }),
  secondaryPill: css({
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
}

function EventCouponIssuanceDetails() {
  const [getVoucherIssuanceRecord, voucherIssuanceRecordData] = useFetchGetVoucherIssuanceRecordLazy()
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    totalCount: 0
  })
  const [inputData, setInputData] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    eventIds: [],
  })
  const [recordData, setRecordData] = useState([])
  const [CSVData, setCSVData] = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const handlePageChange = (d, value) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = value
      })
    )
  }

  const handleRowsPerPageChange = (event) => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }

  const handleSearch = () => {
    getVoucherIssuanceRecord({
      variables: {
        input: {
          pageLimit: pageSetting.pageLimit,
          pageOffset: pageSetting.pageOffset,
          ...inputData
        }
      }
    })
  }

  const handleSetCSVData = data => {
    const arr = []
    data.forEach(d => {
      arr.push({
        流水號: d.number,
        活動名稱: d.eventName,
        規則名稱: d.ruleName,
        訂單日期: format(d.orderDate, 'yyyy/M/d'),
        訂單編號: `#${d.orderNo}`,
        顧客姓名: d.customerName,
        顧客手機: d.customerCellphone,
        使用手機端: d.isCustomerSideUsing ? '是' : '否',
        寄送簡訊: d.isSMSSended ? '是' : '否',
      })
    })
    setCSVData(arr)
  }

  useEffect(() => {
    if (!voucherIssuanceRecordData.loading && voucherIssuanceRecordData.data) {
      const {
        data, pageLimit, pageOffset, totalCount
      } = idx(voucherIssuanceRecordData, _ => _.data.voucherIssuanceRecord)
      setPageSetting(
        produce(draft => {
          draft.pageLimit = pageLimit,
            draft.pageOffset = pageOffset,
            draft.totalCount = totalCount
        })
      )
      setRecordData(data)
      handleSetCSVData(data)
    }
  }, [voucherIssuanceRecordData.loading])

  useEffect(() => {
    handleSearch()
  }, [
    pageSetting.pageLimit, pageSetting.pageOffset,
    inputData.startDate, inputData.endDate
  ])

  return (
    <Fragment>
      <Page css={styles.root} title="活動發券明細">
        <Container maxWidth={false} css={styles.container}>
          <AdminPageHeader
            title="活動發券明細"
            showFilter={showFilter}
            onFilterClick={() => setShowFilter(!showFilter)}
          >
            <DateSelector
              date={inputData}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={({ startDate, endDate }) => {
                setInputData(
                  produce(draft => {
                    draft.startDate = startDate
                    draft.endDate = endDate
                  })
                )
              }}
              margin={false}
            />
          </AdminPageHeader>

          <Collapse in={showFilter}>
            <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
              <div css={styles.filterWrap} style={{ marginBottom: 0 }}>
                <MainEventAutocomplete
                  value={inputData.eventIds}
                  onChange={value => {
                    setInputData(
                      produce(draft => {
                        draft.eventIds = value
                      })
                    )
                  }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    css={styles.pillButton}
                    color='primary'
                    variant='contained'
                    disabled={voucherIssuanceRecordData.loading}
                    onClick={handleSearch}
                  >搜尋</Button>
                  <CSVLink data={CSVData} filename="活動發券明細.csv" style={{ textDecoration: 'none' }}>
                    <Button css={[styles.pillButton, styles.secondaryPill]} variant='contained'>報表匯出</Button>
                  </CSVLink>
                </div>
              </div>
            </div>
          </Collapse>

          {voucherIssuanceRecordData.loading ?
            <div style={{ textAlign: 'center', marginTop: 100 }}><CircularProgress /></div>
            :
            <Results
              recordData={recordData}
              pageSetting={pageSetting}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          }
        </Container>
      </Page>
    </Fragment>
  )
}

export default EventCouponIssuanceDetails
