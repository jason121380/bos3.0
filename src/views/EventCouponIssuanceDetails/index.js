/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button } from '@mui/material'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }),
  filterWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& .MerchantSearchBar': {
      width: 'fit-content'
    },
    '& button': {
      whiteSpace: 'nowrap',
      height: 'fit-content'
    }
  })
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
        <Container maxWidth={false}>
          <PageTitle title='活動發券明細' subTitle='event coupon issuance details' />
          <div css={styles.filterWrap}>
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
              margin
            />
            <CSVLink data={CSVData} filename="活動發券明細.csv">
              <Button color='primary' variant='contained'>報表匯出</Button>
            </CSVLink>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <Button
              style={{ height: 'fit-content' }}
              color='primary'
              variant='contained'
              disabled={voucherIssuanceRecordData.loading}
              onClick={handleSearch}
            >搜尋</Button>
          </div>
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
