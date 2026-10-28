import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import ProductAutoComplete from 'components/ProductAutoComplete'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchProductOrders from 'hooks/useFetchProductOrders'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

export default function DecreaseDetail({ history, location }) {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    productId: '',
    customerId: '',
  })

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
    sellerId: pageSetting.employeeId.length > 0 ? pageSetting.employeeId : '',
    customerIds: pageSetting.customerId.length > 0 ? [pageSetting.customerId] : [],
  })
  // 換條件時回到第 1 頁（原本沿用目前頁碼，在後面頁換條件可能整頁空白）
  const backToFirstPage = () => {
    setResultSetting(
      produce(draft => {
        draft.merchantSell.pageOffset = 0
      })
    )
  }
  const handleFilter = value => {
    setPageSetting(value)
    backToFirstPage()
  }
  const handleProductChange = product => {
    setPageSetting({ ...pageSetting, productId: product.id })
    backToFirstPage()
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
  return (
    <Page title="店販抽成明細" className="ui-root">
      <PageHeader title="店販抽成明細" />
      <div className="flex flex-wrap items-center gap-2.5 pb-4">
        <div>
          <MerchantSearchBar
            values={pageSetting}
            onFilter={handleFilter}
            outside
            visible={['datePicker', 'employee', 'customer']}
            lastInLeaderBoard={true}
          />
        </div>
        <div className="mt-2 w-[150px]">
          <ProductAutoComplete
            label="商品名稱"
            value={pageSetting.productId}
            onChange={handleProductChange}
          />
        </div>
      </div>

      {!productOrders.loading ? (
        idx(
          productOrders,
          _ =>
            _.data.productOrders && (
              <Results
                results={_.data.productOrders}
                handleOnChangePage={(_event, page) =>
                  handleOnChangePage({ page, key: 'merchantSell' })
                }
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
