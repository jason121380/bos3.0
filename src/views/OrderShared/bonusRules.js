// 紅利點數欄位的規則（四個帳單頁的 Bonus 原本各一份、逐字相同，2026/10/21 合併；運算式原樣搬入，一字未改）。

// 「點數折抵金額」的上限：不含第三方卡券的服務／店販／會員卡金額＋卡券銷售金額，扣掉其他付款方式與扣入金；
// 帳單只有第三方卡券的項目（或沒有項目）時為 0
export function getBonusWalletPayLimit(bill) {
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

  const totalOrdersCount = bill.serviceOrders.length + bill.productOrders.length + bill.ticketOrders.length + bill.membershipOrders.length

  const thirdPartyOrdersCount = servicesWithThirdPartyCount.length + productsWithThirdPartyCount.length + membershipsWithThirdPartyCount.length

  const hasWalletPayLimit = totalOrdersCount - thirdPartyOrdersCount >= 1

  if (hasWalletPayLimit) {
    const servicesTotal = servicesWithoutThirdPartyCount.reduce((total, item) => total + item.price, 0)

    const productsTotal = productsWithoutThirdPartyCount.reduce((total, item) => total + item.price * item.count, 0)

    const membershipsTotal = membershipsWithoutThirdPartyCount.reduce((total, item) => total + item.price, 0)

    const ticketsTotal = bill.ticketOrders.reduce((total, item) => total + item.price * item.count, 0)

    const otherPayments = bill.amountByOtherPay + bill.walletPay

    const walletPayLimit = servicesTotal + productsTotal + membershipsTotal + ticketsTotal - otherPayments

    return walletPayLimit
  }
  return 0
}

// 「點數給點」是否停用：有自動給點規則時由規則計算、不可手動輸入；限 LINE 綁定才給點時，未綁定的顧客一律停用
export function isBonusDepositDisabled({ bonusRewardWithLINE, isLineBinded, bonusSetting }) {
  if (bonusRewardWithLINE) {
    return isLineBinded ? bonusSetting.isUsing : true
  }
  return bonusSetting.isUsing
}
