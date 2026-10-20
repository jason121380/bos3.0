import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import idx from 'idx'
import { useContext, useEffect, useRef, useState, Fragment } from 'react'
import produce from 'immer'

export default function PaymentCustomerWallet() {
  const { bill, handleBillChange, order, setBill } = useContext(billContext)
  const [walletPayByOrder, setWalletPayByOrder] = useState(0)
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId: bill.customerId,
  })

  const useFetchCustomerWalletRef = useRef(fetchCustomerWallet)

  // 可用餘額 = 訂單的walletPay + 顧客剩下的餘額
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet + walletPayByOrder)

  useEffect(() => {
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

  useEffect(() => {
    if (!order.loading) {
      // 如果訂單的顧客跟現在的顧客是一樣就把原本他被扣的入金餘額放上去
      if (order.customerId === bill.customerId) {
        setWalletPayByOrder(order.data.order.walletPay === null ? 0 : order.data.order.walletPay)
      }
    }
  }, [order.loading, bill.customerId])

  const walletPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) -
    bill.amountByOtherPay

  const handleFocus = event => {
    event.target.select()
  }
  return (
    <Fragment>
      {usableCustomerWallet > 0 && bill.customerId && (
        <Field label={`扣入金(${usableCustomerWallet}可用)`} className="!mr-[12px] flex w-[150px] justify-start">
          <TextField
            fullWidth
            variant="outlined"
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
    </Fragment>
  )
}
