import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreatePayment from 'hooks/useFetchCreatePayment'
import useFetchPayments from 'hooks/useFetchPayments'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { cloneDeep } from 'lodash'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutPayment from './AboutPayment'

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
    <Page className="ui-root" title="新增支付方式">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-3xl */}
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader className="pb-0" title='新增支付方式' />
        <AboutPayment
          payment={payment}
          onChange={handleOnchange}
        />
        <div>
          <Button
            variant="primary"
            disabled={vaild}
            onClick={handleSubmit}
            data-testid="create-payment"
          >
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
