// 打帳單「結帳／掛單／明細」按鈕可以按下去的前提，用來在畫面上說明「還缺什麼」。
// 只用於顯示，不參與任何啟用／停用的判斷。
//
// 判斷依據（必須與下列程式碼一致；改了其中一處，另一處要同步）：
//   1. Header.js 的 `valid`：日期、服務人員、顧客（customerId、不留客資或手機號碼三者之一）、至少一項消費
//   2. helper/billVerify.js：送出時逐列檢查——店販每列要有服務人員與商品（兩者皆空的列會被略過）、
//      會員卡每列要有服務人員、會員卡與到期日（兩者皆空的列會被略過）
// 對照測試：__tests__/orderRequirements.test.js

export const hasAnyItem = bill =>
  bill.serviceOrders.length > 0 ||
  bill.productOrders.length > 0 ||
  bill.ticketOrders.length > 0 ||
  bill.useTicketOrders.length > 0 ||
  bill.membershipOrders.length > 0

export const hasCustomer = bill => bill.customerId !== undefined || !!bill.withoutCustomerData || bill.customerCellphone.length > 0

export const getMissingForOrder = bill => {
  const missing = []
  if (!bill.date) missing.push('帳單日期')
  if (!bill.designerId) missing.push('服務人員')
  if (!hasCustomer(bill)) missing.push('顧客（或勾選「不留客資」）')
  if (!hasAnyItem(bill)) missing.push('至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）')
  return missing
}
