/** @jsxImportSource @emotion/react */
import { Container, Grid, CircularProgress } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import ProductAutoComplete from 'components/ProductAutoComplete'
import PageTitle from 'components/PageTitle'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchProductOrders from 'hooks/useFetchProductOrders'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  container: css({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }),
  field: css({
    width: '150px',
    alignItems: 'center',
    justifyContent: 'flex-start',
  })
}

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
    <Page title="店販抽成明細" css={styles.root}>
      <Container maxWidth={false}>
        <PageTitle title='店販抽成明細' subTitle='Merchant Sells Records' />
        <Grid container css={styles.container}>
          <Grid item>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              visible={['datePicker', 'employee', 'customer']}
              lastInLeaderBoard={true}
            />
          </Grid>
          <Grid item css={styles.field}>
            <ProductAutoComplete
              label="商品名稱"
              value={pageSetting.productId}
              onChange={handleProductChange}
            />
          </Grid>
        </Grid>

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
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}
