/** @jsxImportSource @emotion/react */
// 篩選區的排序／會員／黑名單下拉保留 MUI Select（值可能非字串或含 null）
import { InputLabel, Select, FormControl, MenuItem } from '@mui/material'
import { FilterList as FilterListIcon } from 'ui/icons'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  formGroup: css({
    width: '150px',
    margin: '10px',
    marginTop: '20px',
  }),
}
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
            <div className="mt-3 flex flex-wrap">
              <FormControl variant="outlined" css={styles.formGroup}>
                <InputLabel>顧客排序方式</InputLabel>
                <Select label='顧客排序方式' value={pageSetting.searchingOrder} onChange={event => handleOnChange({ key: "searchingOrder", event: event })}>
                  {sortByA.map((data, index) => (
                    <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" css={styles.formGroup}>
                <InputLabel>呈現順序</InputLabel>
                <Select label='呈現順序' value={pageSetting.orderWay} onChange={event => handleOnChange({ key: "orderWay", event: event })}>
                  {sortByB.map((data, index) => (
                    <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {isMemberShipCardActive && (
                <Fragment>
                  <FormControl variant="outlined" css={styles.formGroup}>
                    <InputLabel>會員</InputLabel>
                    <Select label='會員'
                      value={membershipFilter.membership}
                      onChange={event => {
                        setMemberShipFilter({
                          ...membershipFilter,
                          membership: event.target.value
                        })
                      }}
                    >
                      {membership.map((data, index) => (
                        <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {pageSetting.membershipPreference !== null && pageSetting.membershipPreference.membership === 'ALL' &&
                    <FormControl variant="outlined" css={styles.formGroup}>
                      <InputLabel>效期</InputLabel>
                      <Select
                        label='效期'
                        value={membershipFilter.membershipValidity}
                        onChange={event => {
                          setMemberShipFilter({
                            ...membershipFilter,
                            membershipValidity: event.target.value
                          })
                        }}
                      >
                        {membershipValidity.map((data, index) => (
                          <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  }
                  <FormControl variant="outlined" css={styles.formGroup}>
                    <InputLabel>黑名單篩選</InputLabel>
                    <Select
                      value={pageSetting.isUnwelcome}
                      label='黑名單篩選'
                      onChange={e => setPageSetting({ ...pageSetting, isUnwelcome: e.target.value })}
                    >
                      <MenuItem value='ALL'>顯示全部</MenuItem>
                      <MenuItem value='UNWELCOME'>顯示黑名單</MenuItem>
                      <MenuItem value='WELCOME'>排除黑名單</MenuItem>
                    </Select>
                  </FormControl>
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
          )) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-2xl" /></div>
        }
    </Page>
  )
}

export default CustomerManagementList
