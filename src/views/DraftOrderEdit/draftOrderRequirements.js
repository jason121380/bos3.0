// 草稿帳單「儲存／結帳」按鈕停用時，在畫面上說明「還缺什麼」。
// 只用於顯示，不參與任何啟用／停用的判斷。
//
// 判斷依據：Footer.js 的 `vaild`（true＝缺東西、儲存與結帳停用）逐條對照，
// 這裡每一條都是 vaild 內同一個子條件取反，所以「有缺項」⇔ vaild 為 true：
//   1. bill.date
//   2. bill.customerId || bill.withoutCustomerData || bill.customerCellphone
//   3. bill.designerId
//   4. 服務、店販、預收卡、使用預收卡、會員卡至少一項
// 注意：本頁的顧客判斷（truthy）與打帳單 orderRequirements.js（customerId !== undefined、customerCellphone.length）不同，
// 草稿的 customerCellphone 可能是 null，所以不能共用打帳單的函式。
// 對照測試：__tests__/draftOrderRequirements.test.js

export const getMissingForDraftOrder = bill => {
  const missing = []
  if (!bill.date) missing.push('帳單日期')
  if (!(bill.customerId || bill.withoutCustomerData || bill.customerCellphone)) missing.push('顧客（或勾選「不留客資」）')
  if (!bill.designerId) missing.push('服務人員')
  if (!(
    bill.serviceOrders.length > 0 ||
    bill.productOrders.length > 0 ||
    bill.ticketOrders.length > 0 ||
    bill.useTicketOrders.length > 0 ||
    bill.membershipOrders.length > 0
  )) {
    missing.push('至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）')
  }
  return missing
}
