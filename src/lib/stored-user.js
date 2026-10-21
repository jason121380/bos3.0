// 存進 localStorage 的登入者資料只留畫面用得到的欄位（2026/10/21，Jason 選「不動後端」的減量方案）：
// 登入 API 回傳的 user 含手機號碼、uid、userCode、各店 solmateKey 等，原本整包存進 localStorage，
// 任何同網域腳本都讀得到、關閉瀏覽器也不會清除。全站讀 localStorage 'user' 的地方只用 id（另有切換密碼時
// 寫回 isNeedChangePassword），因此只保留下列欄位；手機號碼等需要時由 API（profile）查詢。
const STORED_USER_FIELDS = ['id', 'name', 'isAdmin', 'isNeedChangePassword']

export function storableUser(user) {
  if (!user || typeof user !== 'object') return user
  return STORED_USER_FIELDS.reduce((picked, key) => {
    if (user[key] !== undefined) picked[key] = user[key]
    return picked
  }, {})
}

export function saveStoredUser(user) {
  localStorage.setItem('user', JSON.stringify(storableUser(user)))
}

// 已登入的使用者（改版前存了完整資料）在開啟頁面時就地瘦身一次；格式不對就不動，交給原本的登入檢查處理
export function sanitizeStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const user = JSON.parse(raw)
    if (!user || typeof user !== 'object') return
    const slim = JSON.stringify(storableUser(user))
    if (slim !== raw) localStorage.setItem('user', slim)
  } catch (e) {
    // 無法讀寫 localStorage（無痕模式等）時略過
  }
}
