// 篩選區的排序／會員／效期／黑名單下拉：Field（標籤在上）＋NativeSelect（值皆為字串，onChange 的 event.target.value 與原 Select 相同）
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import useFetchCustomers from 'hooks/useFetchCustomers'
import AdminPageHeader from 'components/AdminPageHeader'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import produce from 'immer'
import React, { Fragment, useEffect, useState } from 'react'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { Link as RouterLink } from 'react-router-dom'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

// 排序
const sortByA = [
  {
    label: '依序顧客編號',
    value: 'NO',
  },
  {
    label: '依序最後編輯時間',
    value: 'UPDATEDAT',
  },
]
const sortByB = [
  {
    label: '由小到大',
    value: 'ASC',
  },
  {
    label: '由大到小',
    value: 'DESC',
  },
]
const membership = [
  {
    label: '全部',
    value: 'UNSET',
  },
  {
    label: '是',
    value: 'ALL',
  },
  {
    label: '否',
    value: 'NONE',
  },
]
const membershipValidity = [
  {
    label: '全部',
    value: 'ALL',
  },
  {
    label: '進行中',
    value: 'PROCESSING',
  },
  {
    label: '已過期',
    value: 'EXPIRED',
  },
]

function CustomerManagementList() {
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)

  const [pageSetting, setPageSetting] = React.useState({
    merchantId: localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null,
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    preferDesigner: '',
    latestDesigner: '',
    birthday: {
      year: '',
      month: '',
      day: '',
    },
    searchingOrder: 'UPDATEDAT',
    orderWay: 'DESC',
    membershipPreference: null,
    isUnwelcome: 'ALL'
  })
  const [showFilter, setShowFilter] = React.useState(false)

  const [membershipFilter, setMemberShipFilter] = useState({
    membership: "UNSET",
    membershipValidity: "ALL"
  })

  const customerList = useFetchCustomers(pageSetting)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    setPageSetting({
      ...pageSetting,
      membershipPreference: membershipFilter
    })
  }, [membershipFilter])

  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleOnChange = ({ key, event, item }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = event.target.value
      })
    )
  }

  const handleClearData = () => {
    setPageSetting({
      merchantId: localStorage.getItem('userMerchant')
        ? JSON.parse(localStorage.getItem('userMerchant')).id
        : null,
      pageLimit: 50,
      pageOffset: 0,
      keyword: '',
      preferDesigner: '',
      latestDesigner: '',
      birthday: {
        year: '',
        month: '',
        day: '',
      },
      searchingOrder: 'UPDATEDAT',
      orderWay: 'DESC',
      membershipPreference: {
        membership: "UNSET",
        membershipValidity: "ALL"
      },
      isUnwelcome: 'ALL'
    })
    setMemberShipFilter({
      membership: "UNSET",
      membershipValidity: "ALL"
    })
  }

  return (
    <Page className="ui-root" title="客戶列表">
        <AdminPageHeader
          title='客戶列表'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新增',
            to: '/management/customer/create'
          }}
        />

        {/* 以 hidden 收合（取代 MUI Collapse）：SearchBar 內有非受控輸入，保持掛載，收合後內容與舊版一樣保留 */}
        <div hidden={!showFilter}>
          <Card className="mb-6 p-4">
            <SearchBar
              inCustomerFilterExport
              disableCustomerSource
              handleClearData={handleClearData}
              onSearchV2={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
              onDesignerV2={event =>
                handlePageChange({
                  key: 'preferDesigner',
                  value: event.userId,
                })
              }
              onDesignerV3={event =>
                handlePageChange({
                  key: 'latestDesigner',
                  value: event.userId,
                })
              }
              onBirthdayStart={event =>
                handlePageChange({
                  key: 'birthday',
                  value: event,
                })
              }
            />
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <Field label="顧客排序方式" htmlFor="customer-list-sort" className="w-[184px]">
                <NativeSelect id="customer-list-sort" value={pageSetting.searchingOrder} onChange={event => handleOnChange({ key: "searchingOrder", event: event })}>
                  {sortByA.map((data, index) => (
                    <NativeSelectOption value={data.value} key={index}>{data.label}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="呈現順序" htmlFor="customer-list-order" className="w-[150px]">
                <NativeSelect id="customer-list-order" value={pageSetting.orderWay} onChange={event => handleOnChange({ key: "orderWay", event: event })}>
                  {sortByB.map((data, index) => (
                    <NativeSelectOption value={data.value} key={index}>{data.label}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              {isMemberShipCardActive && (
                <Fragment>
                  <Field label="會員" htmlFor="customer-list-membership" className="w-[150px]">
                    <NativeSelect
                      id="customer-list-membership"
                      value={membershipFilter.membership}
                      onChange={event => {
                        setMemberShipFilter({
                          ...membershipFilter,
                          membership: event.target.value
                        })
                      }}
                    >
                      {membership.map((data, index) => (
                        <NativeSelectOption value={data.value} key={index}>{data.label}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  {pageSetting.membershipPreference !== null && pageSetting.membershipPreference.membership === 'ALL' &&
                    <Field label="效期" htmlFor="customer-list-validity" className="w-[150px]">
                      <NativeSelect
                        id="customer-list-validity"
                        value={membershipFilter.membershipValidity}
                        onChange={event => {
                          setMemberShipFilter({
                            ...membershipFilter,
                            membershipValidity: event.target.value
                          })
                        }}
                      >
                        {membershipValidity.map((data, index) => (
                          <NativeSelectOption value={data.value} key={index}>{data.label}</NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  }
                  <Field label="黑名單篩選" htmlFor="customer-list-unwelcome" className="w-[150px]">
                    <NativeSelect
                      id="customer-list-unwelcome"
                      value={pageSetting.isUnwelcome}
                      onChange={e => setPageSetting({ ...pageSetting, isUnwelcome: e.target.value })}
                    >
                      <NativeSelectOption value='ALL'>顯示全部</NativeSelectOption>
                      <NativeSelectOption value='UNWELCOME'>顯示黑名單</NativeSelectOption>
                      <NativeSelectOption value='WELCOME'>排除黑名單</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                </Fragment>
              )}
            </div>
          </Card>
        </div>
        {(!isMemberShipCardActive.loading && !customerList.loading) ?
          idx(customerList.data, _ => (
            <Results
              customers={_.customers.customers}
              refetch={customerList.refetch}
              pageLimit={_.customers.pageLimit}
              pageOffset={_.customers.pageOffset}
              totalCount={_.customers.totalCount}
              onPageChange={handlePageChange}
              isMemberShipCardActive={isMemberShipCardActive}
            />
          )) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>
        }
    </Page>
  )
}

export default CustomerManagementList
