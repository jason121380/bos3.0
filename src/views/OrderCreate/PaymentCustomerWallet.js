import { Button } from 'ui/button'
import { formatNumber } from 'ui/format'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [bill.walletPay, setWalletPayBalanceForDetail] 變動時執行；usableCustomerWallet 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [profileIdentity.loading, merchantAuthorities.loading])

  const initWalletPay = () => {
    handleBillChange({
      key: 'walletPay',
      value: 0,
    })
  }
  useEffect(() => {
    initWalletPay()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（initWalletPay）；只在 [customerId] 變動時呼叫，補上會每次 render 重跑
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [walletPayCheckBox] 變動時執行；handleBillChange、usableCustomerWallet、walletPayLimit 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [walletPayCheckBox])
  // 勾「整筆扣入金」之後如果項目變少，上限會下降，但上面的 effect 只在勾選當下寫入。
  // 扣入金留在舊金額會讓現金應收變負數。只往下夾到新上限，不把手動改小的金額拉回去。
  useEffect(() => {
    if (!(bill.walletPay > walletPayLimit)) return
    const next = walletPayLimit > 0 ? walletPayLimit : 0
    // 上限已是負數、扣入金已是 0 時不要再寫一次，否則每次 render 都 setState
    if (next === bill.walletPay) return
    handleBillChange({
      key: 'walletPay',
      value: next,
    })
  }, [bill.walletPay, walletPayLimit, handleBillChange])
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
                <p>入金剩餘：<strong className="text-danger">{formatNumber(usableCustomerWallet)} 元</strong></p>
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
                <strong className="text-danger">{formatNumber(usableCustomerWallet - bill.walletPay)} 元</strong>
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
                <p>入金剩餘：<strong className="text-danger">{formatNumber(usableCustomerWallet)} 元</strong></p>
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
