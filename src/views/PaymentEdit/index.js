/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchPayment from 'hooks/useFetchPayment'
import useFetchPayments from 'hooks/useFetchPayments'
import useFetchUpdatePayment from 'hooks/useFetchUpdatePayment'
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

function ServiceCategoryEdit(props) {
  const { updatePayment } = useFetchUpdatePayment()
  const payments = useFetchPayments()
  const paymentDetail = useFetchPayment({ id: props.match.params.id })

  const history = useHistory()
  const [payment, setPayment] = React.useState({
    type: '',
    name: '',
    fee: 0,
    amountType: '',
    isNoCash: false,
  })
  React.useEffect(() => {
    if (!paymentDetail.loading) {
      setPayment(
        produce(draft => {
          draft.type = paymentDetail.data.merchantPayWay.type
          draft.name = paymentDetail.data.merchantPayWay.name
          draft.fee = paymentDetail.data.merchantPayWay.fee
          draft.amountType = paymentDetail.data.merchantPayWay.amountType
          draft.isNoCash = paymentDetail.data.merchantPayWay.isNoCash
        })
      )
    }
  }, [paymentDetail.data, paymentDetail.loading])
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
      const res = await updatePayment({
        id: idx(paymentDetail, _ => _.data.merchantPayWay.id),
        input: { ...payment, fee: Number(fee) }
      })
      if (res) {
        payments.refetch()
        history.push('/payments')
        openSnackbar({ message: '更新支付方式成功', variant: 'success' })
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  const vaild = !(payment.type && payment.name && payment.fee >= 0 && payment.amountType)
  return (
    <Page css={styles.root} title="編輯支付方式">
      <Container maxWidth="lg">
        <PageTitle title='編輯支付方式' subTitle='Edit Payment' />
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
            data-testid="update-payment"
          >
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryEdit
