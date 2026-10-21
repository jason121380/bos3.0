const WalletType = {
  COUNTER: '櫃檯',
  CASH: '零用金',
  BANKTRANSFER: '銀行轉帳',
  MONEYTRANSFER: '匯款',
}
const AccountingInOutType = {
  REVENUE: '收入',
  EXPENDITURE: '支出',
}

const PaymentEnum = {
  PERCENT: '百分比(%)',
  AMOUNT: '固定金額',
}
// 手續費顯示用的單位符號：百分比加 %；固定金額只顯示千分位數字、不加幣別（Jason 2026/10/21「全部不加 NT$」）
const PaymentSymbol = {
  PERCENT: '%',
}

export { AccountingInOutType, PaymentEnum, PaymentSymbol, WalletType }
