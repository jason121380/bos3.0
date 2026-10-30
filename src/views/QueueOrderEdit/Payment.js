import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import billContext from 'context/keyInContext'
import React, { useEffect } from 'react'

import PaymentCustomerWallet from './PaymentCustomerWallet'

export default function Payment() {
  const { bill, handleBillChange, setPaymentAlready } = React.useContext(billContext)
  const otherPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0) -
    bill.walletPay
  const servicesWithThirdPartyCount = []
  const productsWithThirdPartyCount = []
  const memberShipCardWithThirdPartyCount = []
  bill.serviceOrders.forEach(data => {
    if (data.thirdPartyCouponMerchantId !== null && data.thirdPartyCouponMerchantId !== undefined) {
      servicesWithThirdPartyCount.push(data)
    }
  })
  bill.productOrders.forEach(data => {
    if (data.thirdPartyCouponMerchantId !== null && data.thirdPartyCouponMerchantId !== '') {
      productsWithThirdPartyCount.push(data)
    }
  })
  bill.membershipOrders.forEach(data => {
    if (data.thirdPartyCouponMerchantId !== null && data.thirdPartyCouponMerchantId !== '') {
      memberShipCardWithThirdPartyCount.push(data)
    }
  })

  const serviceTotalPrice = bill.serviceOrders.reduce((total, item) => total + item.price, 0)

  const merchantSellTotalPrice = bill.productOrders.reduce(
    (total, item) => (total = total + item.price * item.count),
    0
  )

  const couponSellPrice = bill.ticketOrders.reduce(
    (total, item) => (total = total + item.price * item.count),
    0
  )

  const memberShipCardOrdersPrice = bill.membershipOrders
    .filter(d => typeof d.thirdPartyCouponMerchantId !== 'string')
    .reduce((total, item) => (total = total + item.price), 0)

  const totalShouldPay =
    bill.serviceOrders.length +
      bill.productOrders.length +
      bill.ticketOrders.length +
      bill.membershipOrders.length -
      (servicesWithThirdPartyCount.length +
        productsWithThirdPartyCount.length +
        memberShipCardWithThirdPartyCount.length) >=
      1
      ? serviceTotalPrice + merchantSellTotalPrice + couponSellPrice + memberShipCardOrdersPrice
      : 0

  const handleFocus = event => {
    event.target.select()
  }
  const selectPayment = value => {
    handleBillChange({
      key: 'payType',
      value: value ? [value.name] : [],
    })
    // 沒有選擇其他付款方式 amountByOtherPay的值為0 payType為空陣列
    if (!value) {
      handleBillChange({
        key: 'amountByOtherPay',
        value: 0,
      })
      handleBillChange({
        key: 'payType',
        value: [],
      })
    }
  }

  useEffect(() => {
    const serviceCoupon = bill.serviceOrders.filter(data => {
      return !data.thirdPartyCouponMerchantId
    })
    const productCoupon = bill.productOrders.filter(data => {
      return !data.thirdPartyCouponMerchantId
    })
    const membershipCoupon = bill.membershipOrders.filter(data => {
      return !data.thirdPartyCouponMerchantId
    })
    const ticketOrders = bill.ticketOrders.filter(data => {
      return !data.ticketOrders
    })

    if (
      serviceCoupon.length === 0 &&
      productCoupon.length === 0 &&
      ticketOrders.length === 0 &&
      membershipCoupon.length === 0
    ) {
      handleBillChange({
        key: 'amountByOtherPay',
        value: 0,
      })
      handleBillChange({
        key: 'walletPay',
        value: 0,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleBillChange）；只在 [bill.serviceOrders, bill.productOrders, bill.ticketOrders, bill.membershipOrders] 變動時呼叫，補上會每次 render 重跑
  }, [bill.serviceOrders, bill.productOrders, bill.ticketOrders, bill.membershipOrders])
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
    <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
      {bill.customerId ? <PaymentCustomerWallet /> : ''}
      <Field label="付款方式">
        <PaymentAutoComplete
          setPaymentAlready={setPaymentAlready}
          className="mr-[12px] flex w-[250px] max-w-full justify-start"
          value={bill.payType[0]}
          totalShouldPay={totalShouldPay}
          onChange={value => selectPayment(value)}
          inputProps={{
            'data-testid': 'payment',
          }}
        />
      </Field>
      {bill.payType.map((payment, index) => (
        <Field key={`${payment}-${index}`} label={`${payment}金額`} className="mr-[12px] flex w-[150px] min-w-[150px] justify-start">
          <TextField
            fullWidth
            value={bill.amountByOtherPay}
            variant="outlined"
            onFocus={handleFocus}
            onChange={event => {
              amountByOtherPay(+event.target.value)
            }}
            inputProps={{
              'data-testid': `${payment}金額`,
            }}
          />
        </Field>
      ))}
    </div>
  )
}
