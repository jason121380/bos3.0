/** @jsxImportSource @emotion/react */
import {
  Container,
  Grid,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchProductOrders from 'hooks/useFetchProductOrders'
import idx from 'idx'
import produce from 'immer'
import React, { useState } from 'react'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  container: css({
    display: 'flex',
    alignItems: 'center',
    gap: 10
  }),
  field: css({
    width: '150px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(1),
  }),
  fieldToggle: css({
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start'
  }),
  result: css({
    marginTop: 12
  }),
}

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
  const handleOnChange = event => {
    setSortWay(event.target.value)
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
    <Page title="店販分類抽成明細">
      <Container maxWidth={false} css={styles.root}>
        <AdminPageHeader title='店販分類抽成明細' />
        <Grid container css={styles.container}>
          <Grid item>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              visible={['datePicker', 'employee', 'customer', 'product']}
              lastInLeaderBoard={true}
            />
          </Grid>
          <Grid item css={styles.fieldToggle}>
            <div className="divText">分類依據</div>
            <ToggleButtonGroup
              size="small"
              value={sortWay}
              onChange={handleToggleButtonChange}
              exclusive
            >
              {sortBy.map((data, idx) => (
                <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                  {data.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
          <Grid item css={styles.fieldToggle}>
            <div className="divText">時間排序依據</div>
            <ToggleButtonGroup
              size="small"
              value={sortTime}
              onChange={handleToggleButtonTimeChange}
              exclusive
            >
              {sortByTime.map((data, idx) => (
                <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                  {data.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {!productOrders.loading ? (
          idx(
            productOrders,
            _ =>
              _.data.productOrders && (
                <Results
                  className={styles.result}
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
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}
