// 後端位址的單一來源：GraphQL、WebSocket、REST（outer_store）一律從這裡取，避免各自判斷而連到不同環境。
// 規則（與原 init-apollo 相同，但只看主機名稱）：
//   1. 有設定 REACT_APP_API_URL（GraphQL 端點）就用它
//   2. 否則看目前網址的 hostname：含 dev／beautyos2，或是 localhost → 測試環境；其餘 → 正式環境
// 路徑、查詢、hash 裡的 "dev"（例如 /device、?note=dev）不算測試環境。整段 href 用 indexOf('dev') 會誤判。
export const PROD_ORIGIN = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
export const TEST_ORIGIN = 'https://crt-test-htlfg34mhq-de.a.run.app'

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

// 依網址判斷的環境：'test' 或 'production'。沒有網址（沒有 window）視為正式，避免建置腳本連到測試站。
export function detectApiEnv(href = currentHref()) {
  const hostname = hostnameOf(href)
  if (!hostname) return 'production'
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost')
  const isTestName = hostname.includes('dev') || hostname.includes('beautyos2')
  return isLocal || isTestName ? 'test' : 'production'
}

// GraphQL 端點（完整 URL）
export function getGraphqlUrl(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  if (envUrl) return envUrl
  return `${detectApiEnv(href) === 'test' ? TEST_ORIGIN : PROD_ORIGIN}/graphql`
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
