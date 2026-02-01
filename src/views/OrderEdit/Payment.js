/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import billContext from 'context/keyInContext'
import React, { useEffect } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import PaymentCustomerWallet from './PaymentCustomerWallet'

const styles = {
  payment: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
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

  const serviceTotalPrice = bill.serviceOrders
    .map(d => d.price)
    .reduce((total, item) => (total = total + item), 0)

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
    <div>
      <div css={styles.payment}>
        <PaymentAutoComplete
          setPaymentAlready={setPaymentAlready}
          label="其他付款方式"
          className={styles.field}
          value={bill.payType[0]}
          totalShouldPay={totalShouldPay}
          onChange={value => selectPayment(value)}
        />
        {bill.payType.map((payment, index) => (
          <TextField
            value={bill.amountByOtherPay}
            key={`${payment}-${index}`}
            variant="outlined"
            label={`${payment}金額`}
            css={styles.field}
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
            inputProps={{
              'data-testid': `${payment}金額`,
            }}
          />
        ))}
      </div>
      {bill.customerId ? <PaymentCustomerWallet /> : ''}
    </div>
  )
}
