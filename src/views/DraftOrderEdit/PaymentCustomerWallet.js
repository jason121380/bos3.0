import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import idx from 'idx'
import React from 'react'
import produce from 'immer'

export default function PaymentCustomerWallet() {
  const { bill, handleBillChange, orderDetail, setBill } = React.useContext(billContext)
  const [walletPayByOrder, setWalletPayByOrder] = React.useState(0)
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId: bill.customerId,
  })

  const useFetchCustomerWalletRef = React.useRef(fetchCustomerWallet)
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet + walletPayByOrder)
  React.useEffect(() => {
    // 找顧客本身的入金餘額
    if (bill.customerId) {
      useFetchCustomerWalletRef.current({
        customerId: bill.customerId,
      })
    }
    // 不留客資或新顧客， 就把walletPay的欄位清空
    if (bill.customerId === undefined) {
      setBill(
        produce(draft => {
          draft.walletPay = 0
        })
      )
      setWalletPayByOrder(0)
    }
  }, [bill.customerId])

  React.useEffect(() => {
    if (!orderDetail.loading) {
      // 如果訂單的顧客跟現在的顧客是一樣就把原本他被扣的入金餘額放上去
      if (orderDetail.data.order.customer.id === bill.customerId) {
        setWalletPayByOrder(
          orderDetail.data.order.walletPay === null ? 0 : orderDetail.data.order.walletPay
        )
      }
      // 如果換其他顧客，walletPay欄位就會清空
      if (orderDetail.data.order.customer.id !== bill.customerId) {
        handleBillChange({
          key: 'walletPay',
          value: 0,
        })
        setWalletPayByOrder(0)
      }
    }
  }, [orderDetail.loading, bill.customerId])

  const walletPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price ), 0) -
    bill.amountByOtherPay

  const handleFocus = event => {
    event.target.select()
  }
  
  return (
    <React.Fragment>
      {usableCustomerWallet > 0 && bill.customerId && (
        <Field label={`扣入金(${usableCustomerWallet}可用)`} className="!mr-[12px] flex w-[150px] max-w-[calc(100%-12px)] justify-start">
          <Input
            value={bill.walletPay}
            type="number"
            onFocus={handleFocus}
            onChange={event => {
              const walletPay =
                +event.target.value <= usableCustomerWallet && +event.target.value <= walletPayLimit
                  ? +event.target.value
                  : bill.walletPay
              handleBillChange({
                key: 'walletPay',
                value: walletPay,
              })
            }}
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
      )}
    </React.Fragment>
  )
}
