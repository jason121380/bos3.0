// 帳單詳細（OrderEdit）按鈕停用時，在畫面上說明「還缺什麼」。只用於顯示，不參與任何啟用／停用的判斷。
//
// 判斷依據（必須與 Footer.js 的程式碼一致；改了其中一處，另一處要同步）：
//   1. 「掛單」「結帳／重新結帳」：disabled={open || vaild || !enable}
//      vaild = !(A || B)
//        A：訂單日期 && 顧客（customerId、不留客資或手機號碼） && 服務人員 && 帳單未結算 && 至少一項消費
//        B：訂單總金額為 0 且至少一項消費（此時不需滿足 A 也可以按）
//      vaild 為 true 代表 A 不成立，所以 getMissingForCheckout 列出的就是 A 中不成立的條件（至少一項）。
//   2. 「儲存」：disabled={open || updateVaild}
//      updateVaild = !(訂單日期 && customerId && 服務人員 && 帳單未結算)
// 停用原因一律以 Footer 算好的 vaild／updateVaild／open／enable 為開關，說明文字只在按鈕真的停用時出現。
// 對照測試：__tests__/orderRequirements.test.js

const hasAnyItem = bill =>
  bill.serviceOrders.length > 0 ||
  bill.productOrders.length > 0 ||
  bill.ticketOrders.length > 0 ||
  bill.useTicketOrders.length > 0 ||
  bill.membershipOrders.length > 0

// 對應 vaild 的 A 條件（不含「帳單未結算」，已結算另外說明）
export const getMissingForCheckout = bill => {
  const missing = []
  if (!bill.date) missing.push('帳單日期')
  if (!(bill.customerId || bill.withoutCustomerData || bill.customerCellphone)) missing.push('顧客（或勾選「不留客資」）')
  if (!bill.designerId) missing.push('服務人員')
  if (!hasAnyItem(bill)) missing.push('至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）')
  return missing
}

// 對應 updateVaild（不含「帳單未結算」，已結算另外說明）
export const getMissingForSave = bill => {
  const missing = []
  if (!bill.date) missing.push('帳單日期')
  if (!bill.customerId) missing.push('顧客')
  if (!bill.designerId) missing.push('服務人員')
  return missing
}

// busy＝open（處理中）、invalid＝vaild／updateVaild、loading＝!enable（只有掛單／結帳有）
export const getDisabledReason = ({ busy, invalid, isCloseAccount, missing, loading = false }) => {
  if (busy) return '處理中，請稍候'
  if (invalid) {
    if (isCloseAccount) return '帳單已結算'
    return missing.length > 0 ? `尚缺：${missing.join('、')}` : ''
  }
  if (loading) return '資料載入中，請稍候'
  return ''
}
