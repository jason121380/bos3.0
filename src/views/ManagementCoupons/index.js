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
import { Search } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import BoughtResults from './BoughtResults'
import UsagedResults from './UsagedResults'

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
    <Page title="卡券管理" className="ui-root">
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
          {!ticketSellOverviewData.loading && ticketSellOverviewData.data ?
            <BoughtResults
              pagenationLabel={pagenationLabel}
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
            ) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>
          }
        </div>
    </Page>
  )
}
