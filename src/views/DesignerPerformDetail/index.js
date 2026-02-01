/** @jsxImportSource @emotion/react */
import { Container, Grid } from '@mui/material'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Customer from './Customer'
import Header from './Header'
import MerchantSells from './MerchantSells'
import OrderRecords from './OrderRecords'
import Performance from './Performance'
import Service from './Service'
import SupportRecord from './SupportRecord'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
}

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
    <Page css={styles.root} title="設計師細項分析">
      <Container maxWidth={false}>
        <Header />
        <MerchantSearchBar
          values={pageSetting}
          onFilter={values => setPageSetting(values)}
          initFirst={!pageSetting.employeeId ? ['employee'] : []}
          outside
          visible={['datePicker', 'employee', 'payment']}
        />
        <Grid container spacing={3}>
          {idx(
            designerSalesDetail,
            _ =>
              _.data.user.salesAnalytics && (
                <React.Fragment>
                  <Grid item md={6} xs={12}>
                    <Performance performance={_.data.user.salesAnalytics} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Customer customer={_.data.user.salesAnalytics} />
                  </Grid>
                </React.Fragment>
              )
          )}
          {idx(
            serviceCategoriesAnalytics,
            _ =>
              _.data.serviceCategories && (
                <Grid item xs={12}>
                  <Service services={_.data.serviceCategories} />
                </Grid>
              )
          )}

          {idx(
            merchantSalesAnalytics,
            _ =>
              _.data.productCategories && (
                <Grid item xs={12}>
                  <MerchantSells merchantSells={_.data.productCategories} />
                </Grid>
              )
          )}

          {idx(
            designerOrderRecords,
            _ =>
              _.data.orders.orders && (
                <Grid item xs={12}>
                  <OrderRecords orders={_.data.orders.orders} />
                </Grid>
              )
          )}

          {idx(
            serviceOrderHelpers,
            _ =>
              _.data.serviceOrderHelpers && (
                <Grid item xs={12}>
                  <SupportRecord records={_.data.serviceOrderHelpers.data} />
                </Grid>
              )
          )}
        </Grid>
      </Container>
    </Page>
  )
}

export default DesignerPerformDetail
