// 後端位址的單一來源：GraphQL、WebSocket、REST（outer_store）一律從這裡取，避免各自判斷而連到不同環境。
// 規則（只看主機名稱，不看路徑／查詢／hash）：
//   1. 有設定 REACT_APP_API_URL（GraphQL 端點）就用它
//   2. 已核准的正式站網域 → 正式 API
//   3. localhost、*.localhost、主機名稱含 dev／beautyos2 → 測試 API（開發用，不另外跳提示）
//   4. 其餘（IP、預覽網址、認不得的網域、沒有 window）→ 測試 API，並應顯示提示。
//      未設定環境變數時不得默默連正式 API（2026/10/24：127.0.0.1 與 bos-preview 曾因此打到正式站）。
export const PROD_ORIGIN = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
export const TEST_ORIGIN = 'https://crt-test-htlfg34mhq-de.a.run.app'

// 只有這些前端網域在「沒設 REACT_APP_API_URL」時可以連正式 API。新的正式網域要加進來，或在建置時設環境變數。
const PRODUCTION_HOSTS = new Set(['bos.lure.com.tw', 'www.bos.lure.com.tw', 'app.beautyos.co'])

export const IMPLICIT_API_NOTICE = '未設定 REACT_APP_API_URL。此網址不是已核准的正式站，已改連測試環境，不會連正式 API。'

function currentHref() {
  return typeof window !== 'undefined' ? window.location.href : ''
}

function hostnameOf(href) {
  if (!href || typeof href !== 'string') return ''
  try {
    return new URL(href).hostname.toLowerCase()
  } catch (e) {
    return ''
  }
}

function isIpHostname(hostname) {
  if (hostname.includes(':')) return true
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
}

function isPreviewHostname(hostname) {
  return hostname.includes('preview') || hostname.endsWith('.up.railway.app') || hostname.endsWith('.railway.app')
}

function isExplicitTestHostname(hostname) {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.includes('dev') || hostname.includes('beautyos2')
}

// 依網址判斷：'production'（核准正式站）、'test'（明確的開發／測試網域）、'closed'（其餘，改連測試且應提示）。
// 沒有網址（沒有 window）回 'closed'，避免建置腳本或預覽在未設定變數時連到正式站。
export function detectApiEnv(href = currentHref()) {
  const hostname = hostnameOf(href)
  if (!hostname) return 'closed'
  if (PRODUCTION_HOSTS.has(hostname)) return 'production'
  if (isExplicitTestHostname(hostname)) return 'test'
  if (isIpHostname(hostname) || isPreviewHostname(hostname)) return 'closed'
  return 'closed'
}

// GraphQL 端點（完整 URL）。closed 與 test 都連測試站。
export function getGraphqlUrl(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  if (envUrl) return envUrl
  return `${detectApiEnv(href) === 'production' ? PROD_ORIGIN : TEST_ORIGIN}/graphql`
}

// 實際連線的後端環境（Sentry 的 environment 等標記用）：以「最後解析出的 GraphQL 端點」判斷，
// 而不是看前端網址——部署時用 REACT_APP_API_URL 指向測試站，前端網址看不出來
export function getApiEnvironment(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  return getGraphqlUrl(envUrl, href).startsWith(PROD_ORIGIN) ? 'production' : 'staging'
}

// 後端 origin（WebSocket 與 REST 用），由 GraphQL 端點推得，確保與 GraphQL 同一個環境
export function getApiOrigin(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  return new URL(getGraphqlUrl(envUrl, href), href || undefined).origin
}

// 未設定環境變數、且網址不是核准正式站也不是明確測試網域時，回傳要顯示的提示；否則 null。
// 傳 null 表示「當成沒設定」（預設參數遇到 undefined 會改讀環境變數，null 不會）。
export function implicitApiNotice(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  if (envUrl) return null
  return detectApiEnv(href) === 'closed' ? IMPLICIT_API_NOTICE : null
}
