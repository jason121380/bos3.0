import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import TicketsAutocpmplete from 'components/TicketsAutocpmplete'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchTicketSellOverviewLazy } from 'hooks/useFetchTicketSellOverview'
import { useFetchUsedTicketRecordsLazy } from 'hooks/useFetchUsedTicketRecords.js'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked from 'helper/exportCustomerMask'
import useQueryString from 'hooks/useQueryString'
import roundDecimal from './../../helper/roundDecimal.js'
import { Search, ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'

import BoughtResults from './BoughtResults'
import UsagedResults from './UsagedResults'
import { PageHeader } from 'ui/page-header'

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
  // 匯出是否遮罩顧客姓名與手機。前端 CSV 一律遮罩（helper/exportCustomerMask）。
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const [isCustomerDataMarked, setIsCustomerDataMarked] = useState(true)
  useEffect(() => {
    if (!customerDataMarkedData.loading) {
      setIsCustomerDataMarked(isExportCustomerMasked(customerDataMarkedData))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerDataMarkedData.loading, customerDataMarkedData.error])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [resultSetting.usagedResults] 變動時執行；getUsedTicketRecords、pageSetting.customerId、pageSetting.employeeId、pageSetting.endDate、pageSetting.startDate、pageSetting.ticketIds 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [resultSetting.usagedResults])


  useEffect(() => {
    handleSearch()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  return (
    <Page title="卡券管理" className="ui-root">
        <PageHeader
          title='卡券管理'
          actions={
            <>
              <DateSelector
                attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
                date={{
                  startDate: pageSetting.startDate,
                  endDate: pageSetting.endDate
                }}
                dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
                margin={false}
              />
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
            </>
          }
        />
        {/* 以 hidden 收合（取代 MUI Collapse）：篩選元件保持掛載，收合後內容與舊版一樣保留 */}
        <div hidden={!showFilter}>
          <Card className="mb-6 flex flex-col gap-2.5 p-4">
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer']}
              lastInLeaderBoard={true}
            />
            <div className="flex items-center gap-2.5">
              <div className="min-w-0 flex-1">
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
                variant="secondary"
                onClick={handleSearch}
                disabled={ticketSellOverviewData.loading || usedTicketRecordsData.loading}
              ><Search strokeWidth={1.75} />查詢</Button>
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          {ticketSellOverviewData.error ? (
            <QueryFailed onRetry={handleSearch} />
          ) : !ticketSellOverviewData.loading && ticketSellOverviewData.data ?
            <BoughtResults
              isCustomerDataMarked={isCustomerDataMarked}
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
            /> : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>
          }
          {
            usedTicketRecordsData.error ? (
              <QueryFailed onRetry={handleSearch} />
            ) : !usedTicketRecordsData.loading && usedTicketRecordsData.data ? (
              idx(usedTicketRecordsData,
                _ => (
                  <UsagedResults
                    isCustomerDataMarked={isCustomerDataMarked}
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
            ) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>
          }
        </div>
    </Page>
  )
}
