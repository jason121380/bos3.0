import { Button } from 'ui/button'
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import useFetchGetMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { roleSectionAuthority, hasPageAuthority } from 'helper/rolePageAuthority'
import idx from 'idx'
import React from 'react'
import WalletDepositModal from 'views/OrderShared/WalletDepositModal'


export default function PaymentCustomerWallet() {
  const { bill, handleBillChange, order } = React.useContext(billContext)
  const [walletPayByOrder, setWalletPayByOrder] = React.useState(0)
  const [openWalletDeposit, setOpenWalletDeposit] = React.useState(false)
  const [identity, setIdentity] = React.useState({
    allowDepositAddition: false,
    allowDepositDeduction: false,
  })
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId: bill.customerId,
  })

  const useFetchCustomerWalletRef = React.useRef(fetchCustomerWallet)
  const profileIdentity = useFetchProfileIdentity()
  const merchantAuthorities = useFetchGetMerchantAuthorities()

  // 可用餘額 = 訂單的walletPay + 顧客剩下的餘額
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet + walletPayByOrder)
  // 找顧客本身的入金餘額（這個元件只在帳單有顧客時掛載：Payment 依 bill.customerId 決定）
  React.useEffect(() => {
    useFetchCustomerWalletRef.current({
      customerId: bill.customerId,
    })
  }, [bill.customerId])

  React.useEffect(() => {
    // 查詢失敗時 data 為 undefined，不讀欄位（2026/10/28 稽核 B-04）
    if (!order.loading && idx(order, _ => _.data.order.customer)) {
      // 如果訂單的顧客跟現在的顧客是一樣就把原本他被扣的入金餘額放上去
      if (order.data.order.customer.id === bill.customerId) {
        setWalletPayByOrder(order.data.order.walletPay === null ? 0 : order.data.order.walletPay)
      }
      // 如果換其他顧客，walletPay欄位就會清空
      if (order.data.order.customer.id !== bill.customerId) {
        handleBillChange({
          key: 'walletPay',
          value: 0,
        })
        setWalletPayByOrder(0)
      }
    }
  }, [order.loading, bill.customerId])

  React.useEffect(() => {
    if (!profileIdentity.loading && !merchantAuthorities.loading) {
      const identityId = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityId)
      const authorities = idx(merchantAuthorities, _ => _.data.getMerchantAuthorities)

      // 查詢失敗、找不到登入者角色、角色缺「客戶管理」區塊或缺該項目時，視為沒有入金權限
      // （原本直接取 .pageAuthority／.authority 拋錯，有顧客的帳單整頁變錯誤畫面；與打帳單一致）
      const CustomerManagementIdentity = roleSectionAuthority(authorities, identityId, '客戶管理')
      const allowDepositAddition = hasPageAuthority(CustomerManagementIdentity, '入金(儲值)')
      const allowDepositDeduction = hasPageAuthority(CustomerManagementIdentity, '入金(扣除)')

      setIdentity({
        allowDepositAddition: allowDepositAddition,
        allowDepositDeduction: allowDepositDeduction,
      })
    }
  }, [profileIdentity.loading, merchantAuthorities.loading])

  const walletPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0) -
    bill.amountByOtherPay

  const handleFocus = event => {
    event.target.select()
  }
  return (
    <>
      {/* 欄位標籤在上；按鈕與輸入框靠底對齊，窄螢幕換行 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
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
                +event.target.value <= usableCustomerWallet && +event.target.value <= (walletPayLimit - bill.bonusDecount)
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
        {/* 沒有任何入金權限（含角色缺設定、權限查詢失敗）時不顯示，與打帳單一致（Codex review PR #259） */}
        {(identity.allowDepositAddition || identity.allowDepositDeduction) && (
          <Button
            variant="primary"
            onClick={() => setOpenWalletDeposit(true)}
          >
            異動入金
          </Button>
        )}
      </div>
      {openWalletDeposit && (
        <WalletDepositModal
          openWalletDeposit={openWalletDeposit}
          onClose={() => setOpenWalletDeposit(false)}
          response={response}
          identity={identity}
        />
      )}
    </>
  )
}
