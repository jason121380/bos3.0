// 分類／排序切換鈕改 ui/toggle-group（handler (event, value) 原樣、`state !== null` 守衛不變）
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchProductOrders from 'hooks/useFetchProductOrders'
import idx from 'idx'
import produce from 'immer'
import React, { useState } from 'react'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

export default function DecreaseDetail({ history, location }) {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    productId: '',
    customerId: ''
  })
  const [sortWay, setSortWay] = useState('DESIGNER')
  const [sortTime, setSortTime] = useState('ASC')

  const [resultSetting, setResultSetting] = React.useState({
    merchantSell: {
      pageLimit: 1000,
      pageOffset: 0,
    },
  })
  const productOrders = useFetchProductOrders({
    ...resultSetting.merchantSell,
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    productId: pageSetting.productId,
    customerIds: pageSetting.customerId ? [pageSetting.customerId] : [],
    sellerId: pageSetting.employeeId.length > 0 ? pageSetting.employeeId : '',
    sortWay: sortTime,
    productOrderWay: sortWay,
  })
  // 換篩選條件時回到第 1 頁（原本沿用目前頁碼，在後面頁換條件可能整頁空白）
  const handleFilter = value => {
    setPageSetting(value)
    setResultSetting(
      produce(draft => {
        draft.merchantSell.pageOffset = 0
      })
    )
  }
  const handleOnChangePage = ({ key, page }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = page
      })
    )
  }
  const handleOnChangeRowsPerPage = ({ value, key }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = 0
        draft[key].pageLimit = value
      })
    )
  }
  const handleToggleButtonTimeChange = (_event, state) => {
    state !== null && setSortTime(state)
  }
  const handleToggleButtonChange = (_event, state) => {
    state !== null && setSortWay(state)
  }
  const sortBy = [
    {
      label: '設計師',
      value: 'DESIGNER',
    },
    {
      label: '商品',
      value: 'PRODUCTNO',
    },
    {
      label: '時間',
      value: 'DATE',
    },
  ]
  const sortByTime = [
    {
      label: '由小到大',
      value: 'ASC',
    },
    {
      label: '由大到小',
      value: 'DESC',
    },
  ]
  return (
    <Page className="ui-root" title="店販分類抽成明細">
      <PageHeader title="店販分類抽成明細" />
      <div className="flex flex-wrap items-center gap-2.5 pb-4">
        <div>
          <MerchantSearchBar
            values={pageSetting}
            onFilter={handleFilter}
            outside
            visible={['datePicker', 'employee', 'customer', 'product']}
            lastInLeaderBoard={true}
          />
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="divText text-label text-text-secondary">分類依據</div>
          <ToggleGroup
            size="small"
            value={sortWay}
            onChange={handleToggleButtonChange}
            exclusive
          >
            {sortBy.map((data, idx) => (
              <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                {data.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="divText text-label text-text-secondary">時間排序依據</div>
          <ToggleGroup
            size="small"
            value={sortTime}
            onChange={handleToggleButtonTimeChange}
            exclusive
          >
            {sortByTime.map((data, idx) => (
              <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                {data.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {!productOrders.loading ? (
        idx(
          productOrders,
          _ =>
            _.data.productOrders && (
              <Results
                className="mt-3"
                results={_.data.productOrders}
                handleOnChangePage={(_event, page) =>
                  handleOnChangePage({ page, key: 'merchantSell' })
                }
                sortWay={sortWay}
                handleOnChangeRowsPerPage={event =>
                  handleOnChangeRowsPerPage({
                    value: idx(event, _ => _.target.value),
                    key: 'merchantSell',
                  })
                }
              />
            )
        )
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}
