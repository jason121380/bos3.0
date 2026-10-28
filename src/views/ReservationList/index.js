import Page from 'components/Page'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchCustomerCancelOrder from 'hooks/useFetchCustomerCancelOrder'
import { useFetchCustomerBookingResults } from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { useHistory } from 'react-router'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'

import Header from './Header'
import QueryFailed from 'components/QueryFailed'

// 預約狀態的 Badge 顏色（只影響外觀）
const statusVariant = status => (status === '預約成功' ? 'success' : status === '待審核' ? 'warning' : 'neutral')

export default function Reservation({ location }) {
  const history = useHistory()
  const customer = JSON.parse(localStorage.getItem('customer'))

  const customerBookingResults = useFetchCustomerBookingResults({ isReserved: true })
  const { cancelOrder } = useFetchCustomerCancelOrder()
  const handleCancleOrder = orderId => {
    cancelOrder(orderId).then(() => {
      openSnackbar({
        message: '取消預約成功',
        variant: 'success',
      })
      customerBookingResults.refetch()
    })
  }
  React.useEffect(() => {
    if (!customer || (customer && !customer.userCode)) {
      history.push(
        `/customer/login?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}&redirect=/customer/reservation/list?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}`
      )
    }
  }, [customer, history, location])

  return (
    <Page className="ui-root flex flex-col gap-4" title="預約管理">
      <Header />
      {customerBookingResults.error ? (
        <QueryFailed onRetry={() => customerBookingResults.refetch()} />
      ) : idx(customerBookingResults, _ =>
        _.data.viewer.customer.orders.orders.map((data, index) => (
          <Card key={`order-${index}`}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-caption tabular-nums text-text-secondary">
                    {format(new Date(data.date), 'yyyy/MM/dd HH:mm')}
                  </p>
                  <h2 className="text-heading text-text">
                    {data.designer ? data.designer.name + ' 設計師' : '不指定設計師'}
                  </h2>
                  {data.isDesignate ? (
                    <p className="text-body text-text-secondary">
                      指定設計師
                    </p>
                  ) : (
                    ''
                  )}
                </div>
                <Badge variant={statusVariant(data.status)} className="shrink-0">
                  {data.status}
                </Badge>
              </div>
              {data.status === '待審核' && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-11 w-full"
                  onClick={() => handleCancleOrder(data.id)}
                >
                  取消預約
                </Button>
              )}
              {data.status === '預約成功' && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-11 w-full"
                  onClick={() => handleCancleOrder(data.id)}
                >
                  取消預約
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Page>
  )
}
