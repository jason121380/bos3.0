import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchPayment from 'hooks/useFetchPayment'
import useFetchPayments from 'hooks/useFetchPayments'
import useFetchUpdatePayment from 'hooks/useFetchUpdatePayment'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutPayment from './AboutPayment'

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
    <Page className="ui-root" title="編輯支付方式">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-3xl */}
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader className="pb-0" title='編輯支付方式' />
        <AboutPayment
          payment={payment}
          onChange={handleOnchange}
        />
        <div>
          <Button
            variant="primary"
            disabled={vaild}
            onClick={handleSubmit}
            data-testid="update-payment"
          >
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryEdit
