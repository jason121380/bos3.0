import { Button } from 'ui/button'
import { CheckboxField } from 'ui/checkbox'
import { Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { DragHandleRounded as DragHandleRoundedIcon, RemoveRounded as RemoveRoundedIcon } from 'ui/icons'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import useFetchGetMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import idx from 'idx'
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  Fragment,
  useRef,
  useState,
} from 'react'

import WalletDepositModal from 'views/OrderShared/WalletDepositModal'

const styles = {
  field: 'w-[120px] flex justify-start',
  walletDiv: 'flex flex-col',
}

function PaymentCustomerWallet(props, ref) {
  const [walletPayBalance, setWalletPayBalance] = useState(0)
  const [identity, setIdentity] = useState({
    allowDepositAddition: false,
    allowDepositDeduction: false,
  })

  const {
    bill, handleBillChange, setWalletPayBalanceForDetail,
    setCustomerWallet, walletFuncDisplay
  } = useContext(billContext)

  const [walletPayCheckBox, setWalletPayCheckBox] = useState(false)
  const [openWalletDeposit, setOpenWalletDeposit] = useState(false)
  const customerId = useMemo(() => {
    return bill.customerId
  }, [bill.customerId])
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId,
  })
  const useFetchCustomerWalletRef = useRef(fetchCustomerWallet)
  const profileIdentity = useFetchProfileIdentity()
  const merchantAuthorities = useFetchGetMerchantAuthorities()

  useEffect(() => {
    if (bill.walletPay === 0) return
    setWalletPayBalance(usableCustomerWallet - bill.walletPay)
    setWalletPayBalanceForDetail(usableCustomerWallet - bill.walletPay)
  }, [bill.walletPay, setWalletPayBalanceForDetail])

  // 本元件只在帳單有顧客時掛上（Payment.js），customerId 一定有值
  useEffect(() => {
    useFetchCustomerWalletRef.current({
      customerId,
    })
  }, [customerId])

  useEffect(() => {
    if (!profileIdentity.loading && !merchantAuthorities.loading) {
      const identityId = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityId)
      const authorities = idx(merchantAuthorities, _ => _.data.getMerchantAuthorities)

      // 找不到登入者角色、角色缺「客戶管理」區塊或缺該項目時，視為沒有入金權限（原本直接拋錯，選顧客就整頁錯誤）
      const identitySettings = Array.isArray(authorities) ? authorities.find(d => d.id === identityId) : undefined
      const CustomerManagementIdentity = identitySettings
        ? JSON.parse(identitySettings.authoritySettings).find(d => d.pageTitle === '客戶管理')?.pageAuthority ?? []
        : []
      const allowDepositAddition = CustomerManagementIdentity.find(d => d.pageName === '入金(儲值)')?.authority ?? false
      const allowDepositDeduction = CustomerManagementIdentity.find(d => d.pageName === '入金(扣除)')?.authority ?? false

      setIdentity({
        allowDepositAddition: allowDepositAddition,
        allowDepositDeduction: allowDepositDeduction,
      })
    }
  }, [profileIdentity.loading, merchantAuthorities.loading])

  const initWalletPay = () => {
    handleBillChange({
      key: 'walletPay',
      value: 0,
    })
  }
  useEffect(() => {
    initWalletPay()
  }, [customerId])

  const servicesWithThirdPartyCount = []
  const productsWithThirdPartyCount = []
  const membershipsWithThirdPartyCount = []

  const servicesWithoutThirdPartyCount = []
  const productsWithoutThirdPartyCount = []
  const membershipsWithoutThirdPartyCount = []

  bill.serviceOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      servicesWithThirdPartyCount.push(data)
    }
  })
  bill.productOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      productsWithThirdPartyCount.push(data)
    }
  })
  bill.membershipOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      membershipsWithThirdPartyCount.push(data)
    }
  })

  bill.serviceOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      servicesWithoutThirdPartyCount.push(data)
    }
  })
  bill.productOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      productsWithoutThirdPartyCount.push(data)
    }
  })
  bill.membershipOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      membershipsWithoutThirdPartyCount.push(data)
    }
  })

  const walletPayLimit =
    bill.serviceOrders.length +
      bill.productOrders.length +
      bill.ticketOrders.length +
      bill.membershipOrders.length -
      (servicesWithThirdPartyCount.length + productsWithThirdPartyCount.length + membershipsWithThirdPartyCount.length) >=
      1
      ? servicesWithoutThirdPartyCount
        .map(d => d.price)
        .reduce((total, item) => (total = total + item), 0) +
      productsWithoutThirdPartyCount.reduce(
        (total, item) => (total = total + item.price * item.count),
        0
      ) +
      membershipsWithoutThirdPartyCount.reduce(
        (total, item) => (total = total + item.price),
        0
      ) +
      bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) -
      bill.amountByOtherPay - bill.bonusDecount
      : 0
  const usableCustomerWallet = idx(response, _ => _.data.customerWallet)
  useEffect(() => {
    setCustomerWallet(usableCustomerWallet)
  }, [usableCustomerWallet, setCustomerWallet])
  const handleFocus = event => {
    event.target.focus()
  }

  const handleCheckWalletPay = () => {
    setWalletPayCheckBox(!walletPayCheckBox)
  }

  useEffect(() => {
    if (walletPayCheckBox) {
      if (usableCustomerWallet <= walletPayLimit) {
        handleBillChange({
          key: 'walletPay',
          value: usableCustomerWallet,
        })
      } else {
        handleBillChange({
          key: 'walletPay',
          value: walletPayLimit,
        })
      }
    } else {
      handleBillChange({
        key: 'walletPay',
        value: 0,
      })
    }
  }, [walletPayCheckBox])
  const handleOpenWalletDepositModal = () => {
    setOpenWalletDeposit(true)
  }

  return (
    <Fragment>
      {bill.customerId && !response.loading && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 36, flexWrap: 'wrap' }}>
            {walletFuncDisplay ? (
              <>
                <p>入金剩餘：<strong style={{ color: 'red' }}>{`${usableCustomerWallet}元`}</strong></p>
                <RemoveRoundedIcon />
                <div style={{ position: 'relative' }} className={styles.walletDiv}>
                  <Input
                    className={styles.field}
                    value={bill.walletPay}
                    ref={ref}
                    onFocus={handleFocus}
                    name="walletPay"
                    onChange={event => {
                      const walletPay =
                        +event.target.value <= usableCustomerWallet &&
                          +event.target.value <= walletPayLimit
                          ? +event.target.value
                          : bill.walletPay
                      handleBillChange({
                        key: 'walletPay',
                        value: walletPay,
                      })
                    }}
                  />
                  <div style={{ marginTop: 20, position: 'absolute', left: 0, bottom: -40 }}>
                    <CheckboxField
                      label="整筆扣入金"
                      className="whitespace-nowrap"
                      onChange={handleCheckWalletPay}
                    />
                  </div>
                </div>
                <DragHandleRoundedIcon />
                <strong style={{ color: 'red' }}>{`${usableCustomerWallet - bill.walletPay}元`}</strong>
                {(identity.allowDepositAddition || identity.allowDepositDeduction) &&
                  <Button
                    variant="primary"
                    onClick={handleOpenWalletDepositModal}
                  >
                    異動入金
                  </Button>
                }
              </>
            ) : (
              <>
                <p>入金剩餘：<strong style={{ color: 'red' }}>{`${usableCustomerWallet}元`}</strong></p>
                {(identity.allowDepositAddition || identity.allowDepositDeduction) &&
                  <Button
                    variant="primary"
                    onClick={handleOpenWalletDepositModal}
                  >
                    異動入金
                  </Button>
                }
              </>
            )}
          </div>
        </div>
      )}
      {openWalletDeposit && (
        <WalletDepositModal
          openWalletDeposit={openWalletDeposit}
          onClose={() => setOpenWalletDeposit(false)}
          response={response}
          identity={identity}
        />
      )}
    </Fragment>
  )
}

export default forwardRef(PaymentCustomerWallet)
