import { Field, Input } from 'ui/input'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import React, { createRef, useContext, useEffect, useRef, useState, memo, Fragment, useMemo } from 'react'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'

import PaymentCustomerWallet from './PaymentCustomerWallet'
import useStableCallback from 'hooks/useStableCallback'

const styles = {
  payment: 'items-center justify-start',
  field: 'w-[150px] flex mr-[12px] justify-start',
  fieldWidth: 'w-[250px] flex mr-[12px] justify-start',
  otherPaymentDiv: 'flex',
}
// 下拉的固定 props 放在模組層（身分固定），memo 過的付款方式下拉才不會因此重畫（效能修正 B）
const PAY_TYPE_INPUT_PROPS = { placeholder: '選擇付款方式' }

function Payment() {
  const { bill, handleBillChange } = useContext(billContext)
  const [priceRefs, setPriceRefs] = useState([])

  const payTypeRef = useRef()
  const [focus, setFocus] = useState('')

  const customerId = useMemo(() => {
    return bill.customerId
  }, [bill.customerId])
  const { fetchCustomerWallet, response } = useLazyFetchCustomerWallet({
    customerId,
  })
  const useFetchCustomerWalletRef = useRef(fetchCustomerWallet)
  useEffect(() => {
    if (customerId) {
      useFetchCustomerWalletRef.current({
        customerId,
      })
    }
  }, [customerId])

  const usableCustomerWallet = idx(response, _ => _.data.customerWallet)

  useEffect(() => {
    setPriceRefs(Array({ length: bill.payType.length }).map(createRef))
  }, [bill.payType.length])

  const otherPayLimit =
    bill.serviceOrders.map(d => typeof d.thirdPartyCouponMerchantId !== 'string' && d.price).reduce((total, item) => (total = total + item), 0) +
    bill.productOrders
      .filter(d => typeof d.thirdPartyCouponMerchantId !== 'string')
      .reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0) -
    bill.walletPay

  // 傳給 memo 過的付款方式下拉的 handler 以 useStableCallback 包成固定身分（效能修正 B）；內容不變，呼叫時讀最新的 state
  const handlePayTypeKeydown = useStableCallback(event => {
    if (event.key === 'Enter') {
      idx(priceRefs, _ => _[0].current.focus())
      setFocus(bill.payType[0])
    }
  })

  const handlePayFocus = useStableCallback(event => {
    event.target.focus()
    setFocus(event.target.name)
  })
  // 付款方式下拉選取（原本寫在 JSX 內，內容不變）
  const handlePayTypeChange = useStableCallback(value => {
    if (value === null) {
      handleBillChange({
        key: 'amountByOtherPay',
        value: 0,
      })
    }
    handleBillChange({
      key: 'payType',
      value: value === null ? [] : [value.name],
    })
    setFocus(value === null ? '' : value.name)
  })

  const servicesWithThirdPartyCount = []
  const productsWithThirdPartyCount = []
  const memberShipCardWithThirdPartyCount = []
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
      memberShipCardWithThirdPartyCount.push(data)
    }
  })

  const serviceTotalPrice = bill.serviceOrders
    .map(d => d.thirdPartyCouponMerchantId === null && d.price)
    .reduce((total, item) => (total = total + item), 0)

  const merchantSellTotalPrice = bill.productOrders
    .filter(d => typeof d.thirdPartyCouponMerchantId !== 'string')
    .reduce((total, item) => (total = total + item.price * item.count), 0)

  const couponSellPrice = bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0)
  const memberShipCardOrdersPrice = bill.membershipOrders
    .filter(d => typeof d.thirdPartyCouponMerchantId !== 'string')
    .reduce((total, item) => (total = total + item.price), 0)
  const totalShouldPay =
    bill.serviceOrders.length +
      bill.productOrders.length +
      bill.ticketOrders.length +
      bill.membershipOrders.length -
      (servicesWithThirdPartyCount.length + productsWithThirdPartyCount.length) >=
    1
      ? serviceTotalPrice + merchantSellTotalPrice + couponSellPrice + memberShipCardOrdersPrice - bill.bonusDecount - bill.walletPay
      : 0

  useEffect(() => {
    if (bill.payType.length === 0 && bill.amountByOtherPay !== 0) {
      handleBillChange({
        key: 'amountByOtherPay',
        value: 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [bill.payType] 變動時執行；bill.amountByOtherPay、handleBillChange 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [bill.payType])

  const amountByOtherPay = value => {
    if (value <= otherPayLimit && totalShouldPay > 0 && value <= totalShouldPay) {
      handleBillChange({
        key: 'amountByOtherPay',
        value: value,
      })
    } else {
      handleBillChange({
        key: 'amountByOtherPay',
        value: bill.amountByOtherPay,
      })
    }
  }
  return (
    <Fragment>
      <div className={styles.payment}>
        <div className={styles.otherPaymentDiv}>
          <Field label="付款方式">
            <PaymentAutoComplete
              className={styles.fieldWidth}
              value={bill.payType[0]}
              name="payType"
              autoFocus={focus === 'payType'}
              ref={payTypeRef}
              onKeyDown={handlePayTypeKeydown}
              onFocus={handlePayFocus}
              totalShouldPay={totalShouldPay}
              onChange={handlePayTypeChange}
              inputProps={PAY_TYPE_INPUT_PROPS}
            />
          </Field>
          {bill.payType.map((payment, index) => (
            <Field key={`${payment}-${index}`} label={`${payment}金額`} className={styles.field}>
              <Input
                value={bill.amountByOtherPay}
                ref={priceRefs[index]}
                data-testid={`${payment}金額`}
                autoFocus={focus === payment}
                name={payment}
                onFocus={handlePayFocus}
                onChange={event => {
                  amountByOtherPay(+event.target.value)
                  // const amountByOtherPay =
                  //   +event.target.value <= otherPayLimit &&
                  //   totalShouldPay > 0 &&
                  //   +event.target.value <= totalShouldPay
                  //     ? +event.target.value
                  //     : bill.amountByOtherPay
                  // handleBillChange({
                  //   key: 'amountByOtherPay',
                  //   value: amountByOtherPay,
                  // })
                }}
              />
            </Field>
          ))}
        </div>
        {bill.customerId && <PaymentCustomerWallet />}
      </div>
    </Fragment>
  )
}

export default memo(Payment)
