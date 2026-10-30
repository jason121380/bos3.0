import {
  detectApiEnv,
  getApiEnvironment,
  getApiOrigin,
  getGraphqlUrl,
  implicitApiNotice,
  IMPLICIT_API_NOTICE,
  PROD_ORIGIN,
  TEST_ORIGIN,
} from '../api-base'

// 為什麼重要：GraphQL、WebSocket、REST 原本各自判斷環境，部署時只設 REACT_APP_API_URL 會讓 GraphQL 連測試站、
// WebSocket 卻連正式站（正式店的即時事件被推到測試站）。這些測試確保三者永遠由同一個規則推得同一個後端。
// 未設定變數時，只有核准的正式站網域可以連正式 API；IP、預覽與認不得的網址改連測試站並應提示。
describe('api-base：後端位址單一來源', () => {
  describe('沒有設定 REACT_APP_API_URL 時依網址判斷環境', () => {
    it.each([
      ['https://app.beautyos.co/order/create', 'production', PROD_ORIGIN],
      ['https://bos.lure.com.tw/device/list', 'production', PROD_ORIGIN],
      ['https://bos.lure.com.tw/orders?note=dev', 'production', PROD_ORIGIN],
      ['https://bos.lure.com.tw/beautyos2/orders', 'production', PROD_ORIGIN],
      ['https://www.bos.lure.com.tw/', 'production', PROD_ORIGIN],
      ['https://app.beautyos.co/order/create#device', 'production', PROD_ORIGIN],
      ['https://beautyos-dev.example.com/', 'test', TEST_ORIGIN],
      ['https://beautyos2.example.com/', 'test', TEST_ORIGIN],
      ['http://localhost:3000/', 'test', TEST_ORIGIN],
      ['http://app.localhost:3000/', 'test', TEST_ORIGIN],
      // IP、預覽、Railway 預設網域、認不得的網址：不得默默連正式
      ['http://127.0.0.1:3000/', 'closed', TEST_ORIGIN],
      ['http://127.0.0.1/', 'closed', TEST_ORIGIN],
      ['http://192.168.0.180:3000/inventory', 'closed', TEST_ORIGIN],
      ['http://10.0.0.8/', 'closed', TEST_ORIGIN],
      ['http://[::1]:3000/', 'closed', TEST_ORIGIN],
      ['https://bos-preview.example.com/', 'closed', TEST_ORIGIN],
      ['https://bos-preview-pr-12.up.railway.app/', 'closed', TEST_ORIGIN],
      ['https://bos3.up.railway.app/', 'closed', TEST_ORIGIN],
      ['https://unknown-shop.example.com/orders', 'closed', TEST_ORIGIN],
      ['', 'closed', TEST_ORIGIN],
    ])('%s → %s，API %s', (href, env, origin) => {
      expect(detectApiEnv(href)).toBe(env)
      expect(getGraphqlUrl(undefined, href)).toBe(`${origin}/graphql`)
      expect(getApiOrigin(undefined, href)).toBe(origin)
      expect(getApiEnvironment(undefined, href)).toBe(env === 'production' ? 'production' : 'staging')
      if (env === 'closed') {
        expect(implicitApiNotice(undefined, href)).toBe(IMPLICIT_API_NOTICE)
      } else {
        expect(implicitApiNotice(undefined, href)).toBeNull()
      }
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

    it('127.0.0.1 與預覽網址的 GraphQL 與 WebSocket／REST 都指向測試後端', () => {
      const href = 'http://127.0.0.1:3000/'
      expect(getGraphqlUrl(undefined, href)).toBe(`${TEST_ORIGIN}/graphql`)
      expect(getApiOrigin(undefined, href)).toBe(TEST_ORIGIN)
      expect(getGraphqlUrl(undefined, 'https://bos-preview.up.railway.app/')).not.toContain(PROD_ORIGIN)
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

    it('有設變數時，IP 與預覽網址也不跳「未設定」提示', () => {
      expect(implicitApiNotice(envUrl, 'http://127.0.0.1:3000/')).toBeNull()
      expect(implicitApiNotice(envUrl, 'https://bos-preview.example.com/')).toBeNull()
      expect(getGraphqlUrl(envUrl, 'http://127.0.0.1:3000/')).toBe(envUrl)
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

    it('認不得的網址且未設定變數：staging（連的是測試 API）', () => {
      expect(getApiEnvironment(undefined, 'https://preview.example.com/')).toBe('staging')
    })
  })
})
