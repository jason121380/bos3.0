// 為什麼重要：api-base（後端位址單一來源）與 liffHelper 在模組載入時就讀 window。
// 這兩支會被建置工具、Node 腳本與日後的預先渲染（沒有 window 的環境）載入；
// 讀不到 window 時不可拋錯，且後端位址必須退回正式站（不能因為沒有網址就連到測試站、把正式店的資料寫進測試環境）。

const windowDescriptor = Object.getOwnPropertyDescriptor(global, 'window')

// 在「沒有 window」的狀態下重新載入模組（模組變數在載入當下決定）
function loadWithoutWindow(modulePath) {
  let mod
  delete global.window
  try {
    jest.isolateModules(() => {
      mod = require(modulePath)
    })
  } finally {
    Object.defineProperty(global, 'window', windowDescriptor)
  }
  return mod
}

describe('沒有 window 的環境', () => {
  it('api-base：未設定 REACT_APP_API_URL 時一律指向正式後端，不拋錯', () => {
    let result
    delete global.window
    try {
      jest.isolateModules(() => {
        const { detectApiEnv, getApiEnvironment, getApiOrigin, getGraphqlUrl, PROD_ORIGIN } = require('../api-base')
        result = {
          env: detectApiEnv(),
          graphql: getGraphqlUrl(undefined),
          origin: getApiOrigin(undefined),
          environment: getApiEnvironment(undefined),
          expectedOrigin: PROD_ORIGIN,
        }
      })
    } finally {
      Object.defineProperty(global, 'window', windowDescriptor)
    }
    expect(result.env).toBe('production')
    expect(result.graphql).toBe(`${result.expectedOrigin}/graphql`)
    expect(result.origin).toBe(result.expectedOrigin)
    expect(result.environment).toBe('production')
  })

  it('liffHelper：載入不拋錯（LINE SDK 只在瀏覽器內才會用到）', () => {
    const helper = loadWithoutWindow('helper/liffHelper').default
    expect(typeof helper.init).toBe('function')
  })
})

describe('有 window 時不傳參數：以目前網址判斷', () => {
  // 單元測試的網址是 http://localhost/（測試站關鍵字 localhost）
  it('依目前網址推得測試後端，三個函式結果一致', () => {
    const { detectApiEnv, getApiEnvironment, getApiOrigin, TEST_ORIGIN } = require('../api-base')
    expect(window.location.href).toContain('localhost')
    expect(detectApiEnv()).toBe('test')
    expect(getApiOrigin(undefined)).toBe(TEST_ORIGIN)
    expect(getApiEnvironment(undefined)).toBe('staging')
  })
})
