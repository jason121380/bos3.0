import isExportCustomerMasked, { isCustomerExportMaskSettingOff, maskCustomerForExport, maskCustomerName, maskCellphone } from '../exportCustomerMask'

// 為什麼重要：匯出檔會被下載、轉寄。瀏覽器自己組的 CSV 一律遮罩，即使店家把遮罩關掉。

const result = (overrides = {}) => ({ loading: false, error: undefined, data: { getCustomerDataMarkedDefault: false }, ...overrides })

test('店家設定不遮罩時，前端 CSV 仍遮罩', () => {
  expect(isExportCustomerMasked(result())).toBe(true)
  expect(isCustomerExportMaskSettingOff(result())).toBe(true)
})

test('只有查詢成功且設定確定為 false，才視為店家關閉遮罩', () => {
  expect(isCustomerExportMaskSettingOff(result({ data: { getCustomerDataMarkedDefault: true } }))).toBe(false)
  expect(isCustomerExportMaskSettingOff(result({ loading: true, data: undefined }))).toBe(false)
  expect(isCustomerExportMaskSettingOff(result({ error: new Error('設定查詢失敗') }))).toBe(false)
  expect(isCustomerExportMaskSettingOff(result({ data: undefined }))).toBe(false)
  expect(isCustomerExportMaskSettingOff(result({ data: { getCustomerDataMarkedDefault: null } }))).toBe(false)
  expect(isCustomerExportMaskSettingOff(undefined)).toBe(false)
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

// 卡券管理匯出（2026/10/22 起遮罩）沿用帳單列表的遮罩格式
test('遮罩格式：姓名依長度保留部分字、手機留前 4 碼與第 8～10 碼', () => {
  expect(maskCustomerForExport('王', '0912345678')).toBe('王* 0912***678')
  expect(maskCustomerForExport('王美', '0912345678')).toBe('王* 0912***678')
  expect(maskCustomerForExport('陳小姐', '0912345678')).toBe('陳*姐 0912***678')
  expect(maskCustomerForExport('歐陽小美', '0912345678')).toBe('歐陽*美 0912***678')
})

test('姓名或手機缺漏時不拋錯', () => {
  expect(maskCustomerForExport(null, undefined)).toBe('* ***')
})

// 卡券餘額表、入金紀錄、入金使用的匯出遮罩格式與帳單列表一致（Jason 2026/10/22）
test('姓名遮罩：2 字以下留第 1 字、3 字留頭尾、4 字以上留前 2 字、第 3 字換成 *、留第 4～5 字；沒有姓名為空字串', () => {
  expect(maskCustomerName('陳')).toBe('陳*')
  expect(maskCustomerName('小陳')).toBe('小*')
  expect(maskCustomerName('陳小姐')).toBe('陳*姐')
  expect(maskCustomerName('歐陽小美')).toBe('歐陽*美')
  expect(maskCustomerName('歐陽小美美')).toBe('歐陽*美美')
  expect(maskCustomerName('')).toBe('')
  expect(maskCustomerName(null)).toBe('')
})

test('手機遮罩：留前 4 碼與第 8～10 碼；沒有手機為空字串', () => {
  expect(maskCellphone('0912345678')).toBe('0912***678')
  expect(maskCellphone('')).toBe('')
  expect(maskCellphone(undefined)).toBe('')
})

// Codex review PR #270 P1：4 字以上原本只插入 * 而不遮任何字（歐陽小美→歐陽*小美），去掉 * 就是完整姓名
test('遮罩後一定有字被遮掉：去掉 * 不會還原出完整姓名', () => {
  ['王美', '陳小姐', '歐陽小美', '歐陽小美美', '司馬小美美美'].forEach(name => {
    expect(maskCustomerName(name).replace(/\*/g, '')).not.toBe(name)
    expect(maskCustomerForExport(name, '0912345678').split(' ')[0].replace(/\*/g, '')).not.toBe(name)
  })
})
