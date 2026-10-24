import { detectApiEnv, getApiEnvironment, getApiOrigin, getGraphqlUrl, PROD_ORIGIN, TEST_ORIGIN } from '../api-base'

// 為什麼重要：GraphQL、WebSocket、REST 原本各自判斷環境，部署時只設 REACT_APP_API_URL 會讓 GraphQL 連測試站、
// WebSocket 卻連正式站（正式店的即時事件被推到測試站）。這些測試確保三者永遠由同一個規則推得同一個後端。
describe('api-base：後端位址單一來源', () => {
  describe('沒有設定 REACT_APP_API_URL 時依網址判斷環境', () => {
    it.each([
      ['https://app.beautyos.co/order/create', 'production'],
      ['https://beautyos-dev.example.com/', 'test'],
      ['https://beautyos2.example.com/', 'test'],
      ['http://localhost:3000/', 'test'],
      // 路徑或查詢含 dev／beautyos2，主機不是測試站
      ['https://bos.lure.com.tw/device/list', 'production'],
      ['https://bos.lure.com.tw/orders?note=dev', 'production'],
      ['https://bos.lure.com.tw/beautyos2/orders', 'production'],
      ['https://app.beautyos.co/order/create#device', 'production'],
    ])('%s → %s', (href, env) => {
      expect(detectApiEnv(href)).toBe(env)
    })

    it('正式站的 GraphQL 與 WebSocket／REST 指向同一個正式後端', () => {
      const href = 'https://app.beautyos.co/order/create'
      expect(getGraphqlUrl(undefined, href)).toBe(`${PROD_ORIGIN}/graphql`)
      expect(getApiOrigin(undefined, href)).toBe(PROD_ORIGIN)
    })

    it('測試站的 GraphQL 與 WebSocket／REST 指向同一個測試後端', () => {
      const href = 'http://localhost:3000/'
      expect(getGraphqlUrl(undefined, href)).toBe(`${TEST_ORIGIN}/graphql`)
      expect(getApiOrigin(undefined, href)).toBe(TEST_ORIGIN)
    })
  })

  describe('有設定 REACT_APP_API_URL 時一律以它為準（不看網址）', () => {
    const envUrl = 'https://my-staging-api.example.com/graphql'

    it('GraphQL 直接使用設定值', () => {
      expect(getGraphqlUrl(envUrl, 'https://app.beautyos.co/')).toBe(envUrl)
    })

    it('WebSocket／REST 使用同一台主機，即使網址看起來是正式站', () => {
      expect(getApiOrigin(envUrl, 'https://app.beautyos.co/')).toBe('https://my-staging-api.example.com')
    })
  })

  // 為什麼重要：Sentry 依這個標記區分正式與測試的錯誤。若只看前端網址，用 REACT_APP_API_URL 指向測試站的部署
  // （例如 Zeabur）會被標成正式環境，污染正式站的錯誤監控
  describe('getApiEnvironment：依實際連線的後端標記環境', () => {
    it('正式網域且未設定變數：production', () => {
      expect(getApiEnvironment(undefined, 'https://app.beautyos.co/')).toBe('production')
    })

    it('網址看起來是正式站，但變數指向測試 API：staging', () => {
      expect(getApiEnvironment(`${TEST_ORIGIN}/graphql`, 'https://app.beautyos.co/')).toBe('staging')
    })

    it('測試網址但變數指向正式 API：production', () => {
      expect(getApiEnvironment(`${PROD_ORIGIN}/graphql`, 'http://localhost:3000/')).toBe('production')
    })
  })
})
