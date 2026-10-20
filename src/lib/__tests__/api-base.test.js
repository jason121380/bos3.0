import { detectApiEnv, getApiOrigin, getGraphqlUrl, PROD_ORIGIN, TEST_ORIGIN } from '../api-base'

// 為什麼重要：GraphQL、WebSocket、REST 原本各自判斷環境，部署時只設 REACT_APP_API_URL 會讓 GraphQL 連測試站、
// WebSocket 卻連正式站（正式店的即時事件被推到測試站）。這些測試確保三者永遠由同一個規則推得同一個後端。
describe('api-base：後端位址單一來源', () => {
  describe('沒有設定 REACT_APP_API_URL 時依網址判斷環境', () => {
    it.each([
      ['https://app.beautyos.co/order/create', 'production'],
      ['https://beautyos-dev.example.com/', 'test'],
      ['https://beautyos2.example.com/', 'test'],
      ['http://localhost:3000/', 'test'],
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
})
