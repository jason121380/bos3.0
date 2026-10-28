import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import idx from 'idx'
import { useContext, useEffect, useRef, Fragment } from 'react'
import produce from 'immer'

// 換成佇列帳單原本以外的顧客時清空扣入金，原顧客的扣入金不帶到新顧客（2026/10/22 Jason 同意，比照掛單詳細）。
// 以佇列帳單本身的顧客比對（不是上一次的顧客）：在重新開單頁從佇列選另一筆帳單時元件沿用，
// 新帳單的顧客與扣入金一起帶入，不算換顧客（Codex review PR #261）。
// 清除顧客、改輸入新手機（沒有顧客 id）也算換顧客。由 index.js 呼叫：扣入金欄（下方元件）在沒有顧客時不顯示，
// 原本寫在元件裡的清空在這兩種情況不會執行，原顧客的扣入金照樣送出（coverage wave 1，2026/10/22）。
// 在 setBill 的 updater 內比對：與載入佇列帳單的 setBill 同一輪時，看到的是已帶入的顧客
export function useClearWalletPayOnCustomerChange({ bill, order, setBill }) {
  useEffect(() => {
    if (order.loading) return
    // 佇列帳單讀不到時不比對（原本 JSON.parse(undefined) 整頁錯誤；2026/10/28）
    if (!idx(order, _ => _.data.getOrderInputByQueueId)) return
    const queued = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
    setBill(
      produce(draft => {
        if (draft.customerId !== queued.customerId) {
          draft.walletPay = 0
        }
      })
    )
  }, [order, bill.customerId, setBill])
}

export default function PaymentCustomerWallet() {
  const { bill, handleBillChange } = useContext(billContext)
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId: bill.customerId,
  })

  const useFetchCustomerWalletRef = useRef(fetchCustomerWallet)

  // 可用餘額＝顧客目前的入金餘額：佇列帳單是建立失敗的帳單，失敗時沒有扣入金（2026/10/22 Jason 確認），
  // 重試時才扣，所以不像帳單詳細／掛單詳細要加回原帳單的扣入金
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet)

  useEffect(() => {
    // 找顧客本身的入金餘額（本元件只在有顧客時顯示，Payment.js；換顧客時清空扣入金見上方 useClearWalletPayOnCustomerChange）
    useFetchCustomerWalletRef.current({
      customerId: bill.customerId,
    })
  }, [bill.customerId])

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
