import billPaymentSummary from '../billPaymentSummary'

// 為什麼重要：櫃檯結帳時看「現金應收」收錢、收據印「付現金額」給顧客；
// 這兩個數字曾經永遠是 0，櫃檯只能自己心算。公式必須與打帳單頁右側「金額彙總」完全一致。

const emptyBill = {
  serviceOrders: [],
  productOrders: [],
  ticketOrders: [],
  membershipOrders: [],
  walletPay: 0,
  amountByOtherPay: 0,
  bonusDecount: 0,
}

test('服務、商品（單價×數量）、會員卡、卡券販賣（單價×數量）都計入應付帳款', () => {
  const bill = {
    ...emptyBill,
    serviceOrders: [{ price: 1000, thirdPartyCouponMerchantId: null }],
    productOrders: [{ price: 300, count: 2, thirdPartyCouponMerchantId: null }],
    membershipOrders: [{ price: 2000, thirdPartyCouponMerchantId: null }],
    ticketOrders: [{ price: 500, count: 3 }],
  }
  expect(billPaymentSummary(bill)).toEqual({ shouldPay: 1000 + 600 + 2000 + 1500, cashDue: 5100 })
})

test('第三方卡券支付的服務、商品、會員卡不由店家收款，不計入', () => {
  const bill = {
    ...emptyBill,
    serviceOrders: [
      { price: 1000, thirdPartyCouponMerchantId: 'coupon-1' },
      { price: 800, thirdPartyCouponMerchantId: null },
    ],
    productOrders: [{ price: 300, count: 2, thirdPartyCouponMerchantId: 'coupon-1' }],
    membershipOrders: [{ price: 2000, thirdPartyCouponMerchantId: 'coupon-1' }],
  }
  expect(billPaymentSummary(bill)).toEqual({ shouldPay: 800, cashDue: 800 })
})

test('現金應收＝應付帳款扣掉扣入金、其他付款方式、紅利點數折抵；應付帳款不受影響', () => {
  const bill = {
    ...emptyBill,
    serviceOrders: [{ price: 3000, thirdPartyCouponMerchantId: null }],
    walletPay: 1000,
    amountByOtherPay: 500,
    bonusDecount: 200,
  }
  expect(billPaymentSummary(bill)).toEqual({ shouldPay: 3000, cashDue: 1300 })
})

test('沒有任何項目時兩者都是 0', () => {
  expect(billPaymentSummary(emptyBill)).toEqual({ shouldPay: 0, cashDue: 0 })
})

// 帳單詳細的現金應收改呼叫這支函式。舊式另外排除「還沒選商品」的店販列，
// 但那種列的價格一律是 0（見 OrderEdit/PannelMerchantSells），結果必須與這裡相同。
test('未選商品的店販列價格為 0 時，現金應收與只算已選項目相同', () => {
  const selected = {
    ...emptyBill,
    serviceOrders: [{ price: 800, thirdPartyCouponMerchantId: null }],
    walletPay: 100,
    amountByOtherPay: 50,
    bonusDecount: 20,
  }
  const withEmptyProductRow = {
    ...selected,
    productOrders: [{ price: 0, count: 1, productId: '', thirdPartyCouponMerchantId: null }],
  }
  expect(billPaymentSummary(withEmptyProductRow)).toEqual(billPaymentSummary(selected))
  expect(billPaymentSummary(withEmptyProductRow)).toEqual({ shouldPay: 800, cashDue: 630 })
})
