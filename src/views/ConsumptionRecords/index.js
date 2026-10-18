import Page from 'components/Page'
import getQueryString from 'helper/getQueryString'
import useFetchCustomerOrders from 'hooks/useFetchCustomerOrders'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'

import Consumption from './Consumption'

function ConsumptionRecords({ location }) {
  const history = useHistory()
  const customer = JSON.parse(localStorage.getItem('customer'))
  const merchantId = getQueryString({
    key: 'merchantid',
    location,
  })
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 50,
    pageOffset: 0,
  })

  const orders = useFetchCustomerOrders({
    pageLimit: pageSetting.pageLimit,
    pageOffset: pageSetting.pageOffset,
  })

  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = key === 'pageLimit' ? 0 : pageSetting.pageOffset
        draft[key] = value
      })
    )
  }
  React.useEffect(() => {
    if (!customer || (customer && !customer.userCode)) {
      history.push(
        `/customer/login?merchantid=${merchantId}&redirect=/customer/consumption/records?merchantid=${merchantId}`
      )
    }
  }, [history, customer, merchantId])

  return (
    <Page className="ui-root" title="消費記錄">
      {idx(orders, _ =>
        _.data.viewer.customer.orders.orders ? (
          <Consumption
            orders={_.data.viewer.customer.orders.orders}
            totalCount={_.data.viewer.customer.orders.totalCount}
            pageOffset={_.data.viewer.customer.orders.pageOffset}
            pageLimit={_.data.viewer.customer.orders.pageLimit}
            // refetch={orders.refetch}
            onPageChange={handlePageChange}
          />
        ) : (
          ''
        )
      )}
    </Page>
  )
}

export default ConsumptionRecords
