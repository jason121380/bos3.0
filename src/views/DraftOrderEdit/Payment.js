import { Field, Input } from 'ui/input'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import billContext from 'context/keyInContext'
import React, { useEffect } from 'react'

import PaymentCustomerWallet from './PaymentCustomerWallet'

// 版面比照打帳單（views/OrderCreate/styles/Payment）：欄位上方標籤、靠底對齊、窄螢幕換行不擠壓
export default function Payment() {
  const { bill, handleBillChange } = React.useContext(billContext)

  const otherPayLimit =
    bill.serviceOrders
      .map(d => typeof d.thirdPartyCouponMerchantId !== 'string' && d.price)
      .reduce((total, item) => (total = total + item), 0) +
    bill.productOrders
      .filter(d => typeof d.thirdPartyCouponMerchantId !== 'string')
      .reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0) -
    bill.walletPay

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

  const merchantSellTotalPrice = bill.productOrders.reduce(
    (total, item) => (total = total + item.price * item.count),
    0
  )
  const couponSellPrice = bill.ticketOrders.reduce(
    (total, item) => (total = total + item.price * item.count),
    0
  )
  const memberShipCardSellPrice = bill.membershipOrders.reduce(
    (total, item) => (total = total + item.price),
    0
  )
  const totalShouldPay =
    bill.serviceOrders.length +
      bill.productOrders.length +
      bill.ticketOrders.length +
      bill.membershipOrders.length -
      (servicesWithThirdPartyCount.length +
        productsWithThirdPartyCount.length +
        memberShipCardWithThirdPartyCount.length) >=
      1
      ? serviceTotalPrice + merchantSellTotalPrice + couponSellPrice + memberShipCardSellPrice
      : 0

  if (bill.amountByOtherPay > totalShouldPay) {
    handleBillChange({
      key: 'amountByOtherPay',
      value: 0,
    })
  }

  const handleFocus = event => {
    event.target.select()
  }
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
    <div className="mb-[24px] flex min-w-0 max-w-full flex-wrap items-end justify-start gap-[12px_0]">
      {bill.customerId ? <PaymentCustomerWallet /> : ''}
      <Field label="付款方式">
        <PaymentAutoComplete
          className="mr-[12px] flex w-[250px] max-w-[calc(100%-12px)] justify-start"
          value={bill.payType[0]}
          totalShouldPay={totalShouldPay}
          onChange={value =>
            handleBillChange({
              key: 'payType',
              value: value === null ? [] : [value.name],
            })
          }
          inputProps={{
            'data-testid': 'payment',
            placeholder: '選擇付款方式',
          }}
        />
      </Field>
      {bill.payType.map((payment, index) => (
        <Field key={`${payment}-${index}`} label={`${payment}金額`} className="mr-[12px] flex w-[150px] min-w-[150px] justify-start">
          <Input
            value={bill.amountByOtherPay}
            onFocus={handleFocus}
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
            data-testid={`${payment}金額`}
          />
        </Field>
      ))}
    </div>
  )
}
