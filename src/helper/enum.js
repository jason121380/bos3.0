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
const PaymentSymbol = {
  PERCENT: '%',
  AMOUNT: '$',
}

export { AccountingInOutType, PaymentEnum, PaymentSymbol, WalletType }
