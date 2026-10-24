// 帳單列表、掛單列表與其他「瀏覽器自己組的 CSV」是否遮罩客戶姓名與手機。
// 前端天花板（2026/10/24）：即使店家把 getCustomerDataMarkedDefault 設成 false（不遮罩），
// 瀏覽器下載檔仍遮罩。伺服器產生的檔案網址不走這裡，改在按鈕旁停用並說明（BackendExportNotice）。
// 載入中、查詢失敗、設定不明同樣遮罩。匯出檔會被下載、轉寄，個資寧可多遮。
const isExportCustomerMasked = () => true

// 店家已明確關掉「報表匯出客資遮碼」。只有這次查詢成功且值確定為 false 才算關掉。
// 用來停用「只開啟伺服器檔案網址」的按鈕；不影響上面的前端 CSV（那些一律遮罩）。
export const isCustomerExportMaskSettingOff = queryResult => {
  if (!queryResult || queryResult.loading || queryResult.error || !queryResult.data) return false
  return queryResult.data.getCustomerDataMarkedDefault === false
}

// 遮罩格式與帳單列表、掛單列表的「報表匯出」相同：
// 姓名 1～2 字留第 1 字＋*；3 字留頭尾、中間 *；4 字以上留前 2 字、第 3 字換成 *、再留第 4～5 字；手機留前 4 碼＋***＋第 8～10 碼
// （4 字以上原本是「插入」* 而沒有遮掉任何字，歐陽小美→歐陽*小美 等於完整姓名；Codex review PR #270 P1，改為取代第 3 字）
const maskName = n => (n.length < 3
  ? `${n.substring(0, 1)}*`
  : n.length < 4
    ? `${n.substring(0, 1)}*${n.substring(2, 3)}`
    : `${n.substring(0, 2)}*${n.substring(3, 5)}`)
const maskPhone = phone => `${phone.substring(0, 4)}***${phone.substring(7, 10)}`

// 卡券管理匯出：「姓名 手機」一欄
export const maskCustomerForExport = (name, cellphone) => `${maskName(name || '')} ${maskPhone(cellphone || '')}`

// 卡券餘額表、入金紀錄、入金使用的匯出：姓名、手機分欄，沒有值為空字串（Jason 2026/10/22 同意比照列表匯出遮罩）
export const maskCustomerName = name => (name ? maskName(name) : '')
export const maskCellphone = cellphone => (cellphone ? maskPhone(cellphone) : '')

export default isExportCustomerMasked
