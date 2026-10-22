// 帳單列表、掛單列表「報表匯出」是否遮罩客戶姓名與手機（傳入遮罩設定查詢 useQuery 的結果）。
// 只有「這次查詢成功、且設定確定為 false」才匯出完整資料；載入中、查詢失敗（即使快取裡還留著上次的 false）一律遮罩。
// 匯出檔會被下載、轉寄，個資寧可多遮（2026/10/21，Codex review PR #254 兩輪指出設定晚到、查詢失敗、快取舊值三種漏洞）。
const isExportCustomerMasked = queryResult => {
  if (!queryResult || queryResult.loading || queryResult.error) return true
  const setting = queryResult.data ? queryResult.data.getCustomerDataMarkedDefault : undefined
  return setting !== false
}

// 遮罩格式與帳單列表、掛單列表的「報表匯出」相同：
// 姓名 1～2 字留第 1 字＋*；3 字留頭尾、中間 *；4 字以上留前 2 字＋*＋第 3～5 字；手機留前 4 碼＋***＋第 8～10 碼
const maskName = n => (n.length < 3
  ? `${n.substring(0, 1)}*`
  : n.length < 4
    ? `${n.substring(0, 1)}*${n.substring(2, 3)}`
    : `${n.substring(0, 2)}*${n.substring(2, 5)}`)
const maskPhone = phone => `${phone.substring(0, 4)}***${phone.substring(7, 10)}`

// 卡券管理匯出：「姓名 手機」一欄
export const maskCustomerForExport = (name, cellphone) => `${maskName(name || '')} ${maskPhone(cellphone || '')}`

// 卡券餘額表、入金紀錄、入金使用的匯出：姓名、手機分欄，沒有值為空字串（Jason 2026/10/22 同意比照列表匯出遮罩）
export const maskCustomerName = name => (name ? maskName(name) : '')
export const maskCellphone = cellphone => (cellphone ? maskPhone(cellphone) : '')

export default isExportCustomerMasked
