import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import ProductAutoComplete from 'components/ProductAutoComplete'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchProductOrders from 'hooks/useFetchProductOrders'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

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
  const handleProductChange = product => setPageSetting({ ...pageSetting, productId: product.id })
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
      {/* 日期留在篩選列；設計師、顧客、商品收進「篩選」（STYLE §14）。MerchantSearchBar 拆兩個實例共用同一份 values，收合區的那個不讀網址日期 */}
      <ReportToolbar
        date={
          <MerchantSearchBar
            values={pageSetting}
            onFilter={value => setPageSetting(value)}
            outside
            visible={['datePicker']}
            lastInLeaderBoard={true}
          />
        }
        filters={
          <>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer']}
              lastInLeaderBoard={true}
            />
            <ProductAutoComplete label="商品名稱" value={pageSetting.productId} onChange={handleProductChange} />
          </>
        }
      />

      {productOrders.error ? (
        <QueryFailed onRetry={() => productOrders.refetch()} />
      ) : !productOrders.loading ? (
        idx(
          productOrders,
          _ =>
            _.data.productOrders && (
              <Results
                results={_.data.productOrders}
                handleOnChangePage={(_event, page) => handleOnChangePage({ page, key: 'merchantSell' })}
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
