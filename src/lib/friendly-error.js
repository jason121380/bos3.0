// 錯誤提示改成看得懂、知道下一步的中文（Jason 2026/10/21「錯誤訊息友善化」）。
//
// 全站約 170 處在 catch 裡以 openSnackbar 顯示 error.message；後端的中文業務訊息（密碼錯誤、庫存不足…）本來就看得懂，
// 但伺服器錯誤、資料格式錯誤、程式例外會原文顯示英文（例如「Response not successful: Received status code 500」），
// 櫃台不知道是自己操作錯、網路問題還是要找客服。這裡把這些技術訊息換成「發生什麼＋下一步」，
// 頁面自己加的開頭（例如「刪除訂單失敗:」）保留；無法分類的英文訊息附上原文，方便截圖給客服。
// 由 elements/snackbars 的 normalizeSnackbarMessage 在 error／warning 提示時呼叫，呼叫端不用改。

const SUPPORT_HINT = '若持續發生，請截圖並聯絡客服'
const DETAIL_MAX = 80

export const FRIENDLY_MESSAGES = {
  server: `伺服器暫時無法處理，請稍後再試；${SUPPORT_HINT}`,
  auth: '登入狀態已失效，請重新登入後再試一次',
  tooLarge: '檔案太大，請縮小後再上傳',
  tooMany: '操作太頻繁，請稍候幾秒再試',
  timeout: '連線逾時，請檢查網路後再試一次',
  badRequest: `資料格式有誤，請檢查輸入內容或重新整理頁面後再試；${SUPPORT_HINT}`,
  outdated: `系統可能剛更新，請重新整理頁面後再試；${SUPPORT_HINT}`,
  unknown: `操作沒有完成，請稍後再試；${SUPPORT_HINT}`,
}

const HTTP_STATUS = /Response not successful: Received status code (\d{3})/i
// 伺服器回了錯誤頁（HTML／純文字）而不是 JSON：多半是 5xx，原文對使用者與客服都沒有幫助，不附
const PARSE_ERROR = /Unexpected token|is not valid JSON|Unexpected end of JSON|JSON\.parse/i
const TIMEOUT = /\b(?:timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNABORTED|socket hang up)\b/i
// 前後端版本不一致（查了後端沒有的欄位／參數）：使用者改輸入沒用，重新整理載入新版前端多半就好
const SCHEMA_MISMATCH = /Cannot query field|Unknown argument|Unknown type|is not defined by type|Unknown fragment|Unknown directive|Syntax Error/i
// 輸入值的型別／必填驗證失敗（例如數字欄位填了文字）：請使用者檢查輸入
const BAD_REQUEST =
  /Variable "\$\w+"|got invalid value|Expected (?:type|value of type)|must not be null|was not provided|(?:Int|Float|String|ID|Boolean) cannot represent/i
// 伺服器或程式例外（不該給使用者看的內部訊息）
const SERVER_ERROR =
  /Internal server error|Cannot return null for non-nullable|INTERNAL_SERVER_ERROR|Unexpected error|Cannot read propert(?:y|ies)|is not a function|is not defined|Maximum call stack|out of memory|ECONNREFUSED|ER_\w+|SequelizeDatabaseError|Prisma/i
const CJK = /[㐀-鿿豈-﫿]/
const LETTERS = /[A-Za-z]{3,}/

// HTTP 狀態碼對應的說明（init-apollo 的 errorLink 也用這份，與頁面 catch 顯示的文字一致）
export function httpStatusMessage(code) {
  const status = Number(code)
  if (status === 401 || status === 403) return FRIENDLY_MESSAGES.auth
  if (status === 413) return FRIENDLY_MESSAGES.tooLarge
  if (status === 429) return FRIENDLY_MESSAGES.tooMany
  if (status === 408 || status === 504) return FRIENDLY_MESSAGES.timeout
  if (status >= 500) return `${FRIENDLY_MESSAGES.server}（${status}）`
  return FRIENDLY_MESSAGES.badRequest
}

const truncate = text => (text.length > DETAIL_MAX ? `${text.slice(0, DETAIL_MAX)}…` : text)

// 頁面在技術訊息前加的中文說明（「刪除訂單失敗: …」）保留為開頭；技術訊息本身（給客服看的原文）從比對到的位置起算
function compose(text, index, friendly, withDetail) {
  const lead = text.slice(0, index).replace(/[\s:：,，\-–]+$/, '')
  const hasLead = Boolean(lead) && CJK.test(lead)
  const detail = withDetail ? `（${truncate(hasLead ? text.slice(index) : text)}）` : ''
  return hasLead ? `${lead}：${friendly}${detail}` : `${friendly}${detail}`
}

// 單行訊息：技術訊息換成友善說明；中文業務訊息原樣
function friendlyLine(line) {
  const text = line.trim()
  if (!text) return line
  const status = text.match(HTTP_STATUS)
  if (status) return compose(text, status.index, httpStatusMessage(status[1]), false)
  const parse = text.match(PARSE_ERROR)
  if (parse) return compose(text, parse.index, FRIENDLY_MESSAGES.server, false)
  const timeout = text.match(TIMEOUT)
  if (timeout) return compose(text, timeout.index, FRIENDLY_MESSAGES.timeout, false)
  const schema = text.match(SCHEMA_MISMATCH)
  if (schema) return compose(text, schema.index, FRIENDLY_MESSAGES.outdated, true)
  const badRequest = text.match(BAD_REQUEST)
  if (badRequest) return compose(text, badRequest.index, FRIENDLY_MESSAGES.badRequest, true)
  const server = text.match(SERVER_ERROR)
  if (server) return compose(text, server.index, FRIENDLY_MESSAGES.server, true)
  // 其他沒有中文的英文訊息：看不懂，改成通用說明並附原文給客服
  if (!CJK.test(text) && LETTERS.test(text)) return compose(text, 0, FRIENDLY_MESSAGES.unknown, true)
  return line
}

export function friendlyErrorMessage(message) {
  if (typeof message !== 'string') return message
  const lines = message.split('\n').map(friendlyLine)
  // 多支查詢同時失敗時，相同的說明只留一次
  return lines.filter((line, i) => lines.indexOf(line) === i).join('\n')
}
