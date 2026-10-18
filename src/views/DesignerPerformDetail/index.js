import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchDesignerOrderRecords } from 'hooks/useFetchOrders'
import { useFetchMerchantSalesAnalytics } from 'hooks/useFetchProductCategories'
import { useLazyFetchServiceCategoriesAnalytics } from 'hooks/useFetchServiceCategories'
import { useLazyFetchServiceOrderHelpers } from 'hooks/useFetchServiceOrderHelpers'
import { useLazyFetchDesignerSalesDetail } from 'hooks/useFetchUser'
import idx from 'idx'
import React from 'react'

import Customer from './Customer'
import Header from './Header'
import MerchantSells from './MerchantSells'
import OrderRecords from './OrderRecords'
import Performance from './Performance'
import Service from './Service'
import SupportRecord from './SupportRecord'

function DesignerPerformDetail({ history, location }) {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
  })
  const { fetchDesignerSalesDetail, designerSalesDetail } = useLazyFetchDesignerSalesDetail({
    input: {
      id: pageSetting.employeeId,
    },
    date: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate,
    },
  })

  const {
    fetchServiceCategoriesAnalytics,
    serviceCategoriesAnalytics,
  } = useLazyFetchServiceCategoriesAnalytics({
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    userId: pageSetting.employeeId,
  })

  const { fetchMerchantSalesAnalytics, merchantSalesAnalytics } = useFetchMerchantSalesAnalytics({
    input: {
      paranoid: true,
    },
    analytics: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate,
      userId: pageSetting.employeeId,
    },
  })
  const { fetchDesignerOrderRecords, designerOrderRecords } = useFetchDesignerOrderRecords({
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    employeeId: pageSetting.employeeId,
  })

  const { fetchServiceOrderHelpers, serviceOrderHelpers } = useLazyFetchServiceOrderHelpers({
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    helperId: pageSetting.employeeId,
  })
  React.useEffect(() => {
    if (pageSetting.employeeId) {
      fetchDesignerSalesDetail()
      fetchServiceCategoriesAnalytics()
      fetchMerchantSalesAnalytics()
      fetchDesignerOrderRecords()
      fetchServiceOrderHelpers()
    }
  }, [
    pageSetting.employeeId,
    fetchDesignerOrderRecords,
    fetchDesignerSalesDetail,
    fetchMerchantSalesAnalytics,
    fetchServiceCategoriesAnalytics,
    fetchServiceOrderHelpers,
  ])

  return (
    <Page className="ui-root" title="設計師細項分析">
      <div>
        <Header />
        <MerchantSearchBar
          values={pageSetting}
          onFilter={values => setPageSetting(values)}
          initFirst={!pageSetting.employeeId ? ['employee'] : []}
          outside
          visible={['datePicker', 'employee', 'payment']}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {idx(
            designerSalesDetail,
            _ =>
              _.data.user.salesAnalytics && (
                <React.Fragment>
                  <div className="min-w-0">
                    <Performance performance={_.data.user.salesAnalytics} />
                  </div>
                  <div className="min-w-0">
                    <Customer customer={_.data.user.salesAnalytics} />
                  </div>
                </React.Fragment>
              )
          )}
          {idx(
            serviceCategoriesAnalytics,
            _ =>
              _.data.serviceCategories && (
                <div className="min-w-0 md:col-span-2">
                  <Service services={_.data.serviceCategories} />
                </div>
              )
          )}

          {idx(
            merchantSalesAnalytics,
            _ =>
              _.data.productCategories && (
                <div className="min-w-0 md:col-span-2">
                  <MerchantSells merchantSells={_.data.productCategories} />
                </div>
              )
          )}

          {idx(
            designerOrderRecords,
            _ =>
              _.data.orders.orders && (
                <div className="min-w-0 md:col-span-2">
                  <OrderRecords orders={_.data.orders.orders} />
                </div>
              )
          )}

          {idx(
            serviceOrderHelpers,
            _ =>
              _.data.serviceOrderHelpers && (
                <div className="min-w-0 md:col-span-2">
                  <SupportRecord records={_.data.serviceOrderHelpers.data} />
                </div>
              )
          )}
        </div>
      </div>
    </Page>
  )
}

export default DesignerPerformDetail
