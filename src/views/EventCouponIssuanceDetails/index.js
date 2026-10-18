import Page from 'components/Page'
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
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

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
      <Page className="ui-root" title="活動發券明細">
        <div>
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

          {showFilter && (
            <Card className="mb-4 p-4">
              <div className="flex flex-wrap items-center gap-3">
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
                <div className="flex gap-3">
                  <Button
                    variant='primary'
                    disabled={voucherIssuanceRecordData.loading}
                    onClick={handleSearch}
                  >搜尋</Button>
                  <Button asChild variant='secondary'>
                    <CSVLink data={CSVData} filename="活動發券明細.csv">報表匯出</CSVLink>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {voucherIssuanceRecordData.loading ?
            <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
            :
            <Results
              recordData={recordData}
              pageSetting={pageSetting}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          }
        </div>
      </Page>
    </Fragment>
  )
}

export default EventCouponIssuanceDetails
