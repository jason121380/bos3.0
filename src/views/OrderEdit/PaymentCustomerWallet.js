/** @jsxImportSource @emotion/react */
import { Button } from 'ui/button-compat'
import { TextField } from 'ui/text-field'
import billContext from 'context/keyInContext'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import useFetchGetMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import idx from 'idx'
import React from 'react'
import produce from 'immer'
import WalletDepositModal from './WalletDepositModal'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  payment: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginRight: '12px !important',
    justifyContent: 'flex-start',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
}

export default function PaymentCustomerWallet() {
  const { bill, handleBillChange, order, setBill } = React.useContext(billContext)
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
    if (!order.loading) {
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

      const CustomerManagementIdentity = JSON.parse(
        authorities.find(d => {
          return d.id === identityId
        }).authoritySettings
      ).find(d => {
        return d.pageTitle === '客戶管理'
      }).pageAuthority
      const allowDepositAddition = CustomerManagementIdentity.find(d => {
        return d.pageName === '入金(儲值)'
      }).authority
      const allowDepositDeduction = CustomerManagementIdentity.find(d => {
        return d.pageName === '入金(扣除)'
      }).authority

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
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {usableCustomerWallet > 0 && bill.customerId && (
          <TextField
            variant="outlined"
            label={`扣入金(${usableCustomerWallet}可用)`}
            css={styles.field}
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
        )}
        <Button
          color="primary"
          variant="contained"
          onClick={() => setOpenWalletDeposit(true)}
        >
          異動入金
        </Button>
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
