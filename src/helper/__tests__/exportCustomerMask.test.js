import isExportCustomerMasked from '../exportCustomerMask'

// 為什麼重要：匯出檔會被下載、轉寄；只要無法確定店家選了「不遮罩」，就必須遮罩姓名與手機。

const result = (overrides = {}) => ({ loading: false, error: undefined, data: { getCustomerDataMarkedDefault: false }, ...overrides })

test('店家設定不遮罩、且這次查詢成功時，才匯出完整資料', () => {
  expect(isExportCustomerMasked(result())).toBe(false)
})

test('店家設定遮罩時遮罩', () => {
  expect(isExportCustomerMasked(result({ data: { getCustomerDataMarkedDefault: true } }))).toBe(true)
})

test('設定還在載入時遮罩', () => {
  expect(isExportCustomerMasked(result({ loading: true, data: undefined }))).toBe(true)
})

test('查詢失敗時遮罩——即使快取裡還留著上次的「不遮罩」', () => {
  expect(isExportCustomerMasked(result({ error: new Error('設定查詢失敗') }))).toBe(true)
})

test('沒有資料或值不明時遮罩', () => {
  expect(isExportCustomerMasked(result({ data: undefined }))).toBe(true)
  expect(isExportCustomerMasked(result({ data: { getCustomerDataMarkedDefault: null } }))).toBe(true)
  expect(isExportCustomerMasked(undefined)).toBe(true)
})
