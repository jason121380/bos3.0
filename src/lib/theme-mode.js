// 深淺色模式（Jason 2026/10/21 同意「主題不閃、切換免重整」）。
//
// 原本：主題存在後端的個人資料，要等查詢回來才套用 html.dark 與舊版全域樣式（initialize／initialize-dark.scss），
// 深色使用者每次開頁先看到約 0.5 秒淺色；切換時存檔後整頁 reload（兩套舊版樣式無法同時存在）。
// 現在：
// - 依使用者記住最後一次的主題，版面掛載時（繪製前）就套用；後端回來若不同再以後端為準。
// - 舊版全域樣式改以字串載入（?inline）放進同一個 <style>，切換時替換內容即可，不必重新整理。
// - 使用者按下切換時立即套用；存檔期間忽略後端舊值，存檔失敗則還原。

const THEMES = ['DARK', 'DEFAULT']
const storageKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user && user.id ? `bosTheme:${user.id}` : null
  } catch (e) {
    return null
  }
}

export function readStoredTheme() {
  const key = storageKey()
  if (!key) return null
  try {
    const value = localStorage.getItem(key)
    return THEMES.includes(value) ? value : null
  } catch (e) {
    return null
  }
}

function storeTheme(theme) {
  const key = storageKey()
  if (!key) return
  try {
    localStorage.setItem(key, theme)
  } catch (e) {
    // 無法寫入（私密模式等）時只是下次開頁沒有記憶，不影響使用
  }
}

// 舊版全域樣式（尚未改版頁面與列印用），兩套擇一；以字串載入才能在不重新整理的情況下替換
// （?inline 是 Vite 的查詢參數：回傳編譯後的 CSS 字串、不自動插入頁面；scripts/redesign/eslint-check.json 的 import/no-unresolved 已忽略此後綴）
const legacyStyles = {
  DARK: () => import('../initialize-dark.scss?inline'),
  DEFAULT: () => import('../initialize.scss?inline'),
}

let appliedTheme = null
let pendingTheme = null
let loadSeq = 0

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return
  const dark = theme === 'DARK'
  const root = document.documentElement
  root.classList.toggle('dark', dark) // 新版介面的深色 tokens
  root.setAttribute('data-color-mode', dark ? 'dark' : 'light') // markdown 編輯器的顏色模式
  if (appliedTheme === theme) return
  appliedTheme = theme
  if (process.env.NODE_ENV === 'test') return // 單元測試不載入樣式字串
  const seq = ++loadSeq
  legacyStyles[theme]()
    .then(mod => {
      if (seq !== loadSeq) return // 已有較新的切換
      let el = document.getElementById('legacy-theme-style')
      if (!el) {
        el = document.createElement('style')
        el.id = 'legacy-theme-style'
        document.head.appendChild(el)
      }
      el.textContent = mod.default
    })
    .catch(() => {
      // 載入失敗（離線等）：保留目前的樣式；下次切換或重新整理會再載入
      appliedTheme = null
    })
}

// 版面掛載時：有記憶就先套用（不等後端）
export function applyStoredTheme() {
  const stored = readStoredTheme()
  if (stored) applyTheme(stored)
  return stored
}

// 後端個人資料回來時：以後端為準並記住；使用者剛按切換、還在存檔時略過（避免被舊值蓋回）
export function syncThemeFromServer(theme) {
  if (!THEMES.includes(theme) || pendingTheme) return
  applyTheme(theme)
  storeTheme(theme)
}

// 使用者按下切換：立即套用並記住，回傳存檔結束時要呼叫的函式（成功 true／失敗 false，失敗會還原）
export function switchThemeByUser(nextTheme) {
  const previous = appliedTheme || (nextTheme === 'DARK' ? 'DEFAULT' : 'DARK')
  pendingTheme = nextTheme
  applyTheme(nextTheme)
  storeTheme(nextTheme)
  return saved => {
    pendingTheme = null
    if (!saved) {
      applyTheme(previous)
      storeTheme(previous)
    }
  }
}

// 測試用：重設模組狀態
export function __resetThemeModeForTest() {
  appliedTheme = null
  pendingTheme = null
  loadSeq = 0
}
