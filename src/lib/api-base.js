// 後端位址的單一來源：GraphQL、WebSocket、REST（outer_store）一律從這裡取，避免各自判斷而連到不同環境。
// 規則（與原 init-apollo 相同）：
//   1. 有設定 REACT_APP_API_URL（GraphQL 端點）就用它
//   2. 否則看目前網址：含 dev／beautyos2／localhost → 測試環境；其餘 → 正式環境
export const PROD_ORIGIN = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
export const TEST_ORIGIN = 'https://crt-test-htlfg34mhq-de.a.run.app'

const TEST_HOST_KEYWORDS = ['dev', 'beautyos2', 'localhost']

function currentHref() {
  return typeof window !== 'undefined' ? window.location.href : ''
}

// 依網址判斷的環境：'test' 或 'production'
export function detectApiEnv(href = currentHref()) {
  return TEST_HOST_KEYWORDS.some(keyword => href.indexOf(keyword) !== -1) ? 'test' : 'production'
}

// GraphQL 端點（完整 URL）
export function getGraphqlUrl(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  if (envUrl) return envUrl
  return `${detectApiEnv(href) === 'test' ? TEST_ORIGIN : PROD_ORIGIN}/graphql`
}

// 後端 origin（WebSocket 與 REST 用），由 GraphQL 端點推得，確保與 GraphQL 同一個環境
export function getApiOrigin(envUrl = process.env.REACT_APP_API_URL, href = currentHref()) {
  return new URL(getGraphqlUrl(envUrl, href), href || undefined).origin
}
