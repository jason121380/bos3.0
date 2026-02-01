/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, Typography
} from '@mui/material'
import cyan from '@mui/material/colors/cyan'
import Page from 'components/Page'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchCustomerCancelOrder from 'hooks/useFetchCustomerCancelOrder'
import { useFetchCustomerBookingResults } from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Header from './Header'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(2),
  }),
  title: css({
    fontSize: 14,
  }),
  pos: css({
    marginBottom: 12,
  }),
  cardInner: css({
    padding: theme.spacing(1),
  }),
  cancelButton: css({
    backgroundColor: cyan[500],
    color: 'white',
    '&:hover': {
      backgroundColor: cyan[400],
    },
  }),
}

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
    <Page css={styles.root} title="預約管理">
      <Header />
      {idx(customerBookingResults, _ =>
        _.data.viewer.customer.orders.orders.map((data, index) => (
          <Card css={styles.root} key={`order-${index}`}>
            <CardContent css={styles.cardInner}>
              <Typography css={styles.title} color="textSecondary" gutterBottom>
                {format(new Date(data.date), 'yyyy/MM/dd HH:mm')}
              </Typography>
              <Typography variant="h5" component="h2">
                {data.designer ? data.designer.name + ' 設計師' : '不指定設計師'}
              </Typography>
              {data.isDesignate ? (
                <Typography variant="body2" component="p">
                  指定設計師
                </Typography>
              ) : (
                ''
              )}
              <Typography variant="h5" component="h2">
                {data.status}
              </Typography>
            </CardContent>
            {data.status === '待審核' && (
              <CardActions css={styles.cardInner}>
                <Button
                  size="small"
                  css={styles.cancelButton}
                  onClick={() => handleCancleOrder(data.id)}
                >
                  取消預約
                </Button>
              </CardActions>
            )}
            {data.status === '預約成功' && (
              <CardActions css={styles.cardInner}>
                <Button
                  size="small"
                  css={styles.cancelButton}
                  onClick={() => handleCancleOrder(data.id)}
                >
                  取消預約
                </Button>
              </CardActions>
            )}
          </Card>
        ))
      )}
    </Page>
  )
}
