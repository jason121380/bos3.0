// 讀 localStorage 'userMerchant'（目前店家）的單一入口：格式壞掉、沒有值或無法存取 localStorage 時回 null，
// 呼叫端用 storedMerchantId()／storedMerchantName() 取欄位，不會因 `.id` 在 null 上拋錯（2026/10/28 稽核 B-12）。
export function storedMerchant() {
  try {
    const raw = localStorage.getItem('userMerchant')
    if (!raw) return null
    const merchant = JSON.parse(raw)
    return merchant && typeof merchant === 'object' ? merchant : null
  } catch (e) {
    return null
  }
}

export function storedMerchantId() {
  const merchant = storedMerchant()
  return merchant && merchant.id !== undefined ? merchant.id : null
}

export function storedMerchantName() {
  const merchant = storedMerchant()
  return merchant && merchant.name !== undefined ? merchant.name : ''
}
