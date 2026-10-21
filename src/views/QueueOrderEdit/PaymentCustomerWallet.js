import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import idx from 'idx'
import { useContext, useEffect, useRef, Fragment } from 'react'
import produce from 'immer'

export default function PaymentCustomerWallet() {
  const { bill, handleBillChange, setBill } = useContext(billContext)
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId: bill.customerId,
  })

  const useFetchCustomerWalletRef = useRef(fetchCustomerWallet)

  // 可用餘額＝顧客目前的入金餘額：佇列帳單是建立失敗的帳單，失敗時沒有扣入金（2026/10/22 Jason 確認），
  // 重試時才扣，所以不像帳單詳細／掛單詳細要加回原帳單的扣入金
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet)
  const previousCustomerId = useRef(bill.customerId)

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
    }
    // 換成另一位顧客時清空扣入金，原顧客的扣入金不帶到新顧客（2026/10/22 Jason 同意，比照帳單詳細／掛單詳細）；
    // 載入佇列帳單時由「尚未帶入」變成原顧客不算換顧客
    if (previousCustomerId.current !== undefined && previousCustomerId.current !== bill.customerId) {
      setBill(
        produce(draft => {
          draft.walletPay = 0
        })
      )
    }
    previousCustomerId.current = bill.customerId
  }, [bill.customerId, setBill])

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
