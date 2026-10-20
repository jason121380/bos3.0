/** @jsxImportSource @emotion/react */
import { Field, Input } from 'ui/input'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import billContext from 'context/keyInContext'
import React, { useEffect } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import PaymentCustomerWallet from './PaymentCustomerWallet'

// 版面比照打帳單（views/OrderCreate/styles/Payment）：欄位上方標籤、靠底對齊、窄螢幕換行不擠壓
const styles = {
  payment: css({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px 0',
    minWidth: 0,
    maxWidth: '100%',
    marginBottom: theme.spacing(3),
  }),
  fieldWidth: css({
    width: '250px',
    maxWidth: 'calc(100% - 12px)', // 扣掉 marginRight，窄螢幕才不會超出卡片
    display: 'flex',
    marginRight: '12px',
    justifyContent: 'flex-start',
  }),
  field: css({
    width: '150px',
    minWidth: '150px',
    display: 'flex',
    marginRight: '12px',
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
    <div css={styles.payment}>
      {bill.customerId ? <PaymentCustomerWallet /> : ''}
      <Field label="付款方式">
        <PaymentAutoComplete
          className={styles.fieldWidth}
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
        <Field key={`${payment}-${index}`} label={`${payment}金額`} css={styles.field}>
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
