import isPasswordRequired from '../passwordRequired'

// 為什麼重要：店家開啟「刪除帳單／取消預約」密碼保護時，讀不到設定就不能當成「沒開」直接送出；
// 只有查詢成功且設定確定為 false 才跳過密碼（Codex review PR #270 P1）。
const result = (overrides = {}) => ({ loading: false, error: undefined, data: undefined, ...overrides })
const setting = isUsing => ({ merchantPassword: { deleteOrder: { isUsing } } })

test('查詢成功且設定為 false 才不需要密碼', () => {
  expect(isPasswordRequired(result({ data: setting(false) }), 'deleteOrder')).toBe(false)
})

test('設定為 true 需要密碼', () => {
  expect(isPasswordRequired(result({ data: setting(true) }), 'deleteOrder')).toBe(true)
})

test('載入中、查詢失敗（即使快取留著 false）、值不明、沒有結果一律需要密碼', () => {
  expect(isPasswordRequired(result({ loading: true }), 'deleteOrder')).toBe(true)
  expect(isPasswordRequired(result({ error: new Error('x'), data: setting(false) }), 'deleteOrder')).toBe(true)
  expect(isPasswordRequired(result({ data: setting(null) }), 'deleteOrder')).toBe(true)
  expect(isPasswordRequired(result({ data: {} }), 'deleteOrder')).toBe(true)
  expect(isPasswordRequired(result({ data: setting(false) }), 'cancelReservation')).toBe(true)
  expect(isPasswordRequired(undefined, 'deleteOrder')).toBe(true)
})
