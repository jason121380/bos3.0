// 打帳單的「應付帳款」與「現金應收」（明細彈窗、列印收據、頁面右側金額彙總共用同一份公式）。
// 第三方卡券支付的服務／商品／會員卡不由店家收款，不計入；卡券販賣一律計入。
// 應付帳款＝上述合計；現金應收＝應付帳款扣掉扣入金、其他付款方式、紅利點數折抵。
// 2026/10/21 前明細彈窗與收據的這兩個數字從未被計算、永遠顯示 0（A5 補測試時發現，Jason 同意修正）。
const isThirdPartyCoupon = order => typeof order.thirdPartyCouponMerchantId === 'string'

const billPaymentSummary = bill => {
  const sum = (orders, amount) => orders.reduce((total, order) => total + amount(order), 0)
  const shouldPay =
    sum(bill.serviceOrders, d => (isThirdPartyCoupon(d) ? 0 : d.price)) +
    sum(bill.productOrders, d => (isThirdPartyCoupon(d) ? 0 : d.price * d.count)) +
    sum(bill.membershipOrders, d => (isThirdPartyCoupon(d) ? 0 : d.price)) +
    sum(bill.ticketOrders, d => d.price * d.count)
  const cashDue = shouldPay - bill.walletPay - bill.amountByOtherPay - bill.bonusDecount
  return { shouldPay, cashDue }
}

export default billPaymentSummary
