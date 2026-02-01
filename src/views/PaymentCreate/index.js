/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreatePayment from 'hooks/useFetchCreatePayment'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { cloneDeep } from 'lodash'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import AboutPayment from './AboutPayment'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function ServiceCategoryCreate() {
  const { createPayment } = useFetchCreatePayment()
  const payments = useFetchPayments()
  const history = useHistory()
  const [payment, setPayment] = React.useState({
    type: '',
    name: '',
    fee: 0,
    amountType: '',
    isNoCash: false,
  })
  const handleOnchange = ({ event, key }) => {
    if (key === 'fee' && isNaN(idx(event, _ => _.target.value))) return
    if (event.persist) event.persist()
    setPayment(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }
  const handleSubmit = async () => {
    const { fee } = cloneDeep(payment)
    try {
      const res = await createPayment({ input: { ...payment, fee: Number(fee) } })
      if (res) {
        payments.refetch()
        history.push('/payments')
        openSnackbar({ message: '新增支付方式成功', variant: 'success' })
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  const vaild = !(payment.type && payment.name && payment.fee >= 0 && payment.amountType)

  return (
    <Page css={styles.root} title="新增支付方式">
      <Container maxWidth="lg">
        <PageTitle title='新增支付方式' subTitle='New Payment' />
        <AboutPayment
          className={styles.aboutPayment}
          payment={payment}
          onChange={handleOnchange}
        />
        <div css={styles.actions}>
          <Button
            color="primary"
            variant="contained"
            disabled={vaild}
            onClick={handleSubmit}
            data-testid="create-payment"
          >
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
