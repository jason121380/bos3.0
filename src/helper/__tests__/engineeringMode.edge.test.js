// 工程模式的邊界情況：隱私模式擋 sessionStorage、localStorage 內容壞掉、資料缺漏時，
// 頁面不能拋錯，也不能因此誤判成「已解鎖」或把機密值帶進畫面；缺資料的檢查項一律顯示 FAIL 與原因。
import {
  ENGINEERING_GATE_PASSWORD,
  ENGINEERING_UNLOCK_KEY,
  buildEngineeringChecks,
  clearEngineeringUnlock,
  engineeringRouteDecision,
  graphqlHostname,
  isEngineeringUnlocked,
  readMerchantSummary,
  readStorageKeyPresence,
  readStoredUserName,
  tryUnlockEngineering,
} from '../engineeringMode'

const throwingStorage = () => ({
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
  removeItem: () => {
    throw new Error('SecurityError')
  },
})

// 隱私模式下連讀 window.sessionStorage 都會拋 SecurityError
const withBlockedSessionStorage = run => {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError')
    },
  })
  try {
    run()
  } finally {
    Object.defineProperty(window, 'sessionStorage', descriptor)
  }
}

beforeEach(() => {
  clearEngineeringUnlock()
  sessionStorage.clear()
})

describe('密碼閘：儲存不可用', () => {
  it('讀不到 sessionStorage 時視為未解鎖；解鎖後這次頁面仍保持解鎖', () => {
    withBlockedSessionStorage(() => {
      expect(isEngineeringUnlocked()).toBe(false)
      expect(tryUnlockEngineering(ENGINEERING_GATE_PASSWORD)).toBe(true)
      expect(isEngineeringUnlocked()).toBe(true)
      expect(() => clearEngineeringUnlock()).not.toThrow()
      expect(isEngineeringUnlocked()).toBe(false)
    })
  })

  it('儲存讀寫拋錯：讀取視為未解鎖、寫入失敗仍解鎖、清除失敗也關閉記憶體旗標', () => {
    const storage = throwingStorage()
    expect(isEngineeringUnlocked(storage)).toBe(false)
    expect(tryUnlockEngineering(ENGINEERING_GATE_PASSWORD, storage)).toBe(true)
    expect(isEngineeringUnlocked(storage)).toBe(true)
    clearEngineeringUnlock(storage)
    expect(isEngineeringUnlocked(storage)).toBe(false)
  })

  it('指定的儲存裡有解鎖標記才算解鎖（重新整理後沿用同分頁的解鎖）', () => {
    const store = { [ENGINEERING_UNLOCK_KEY]: '1' }
    expect(isEngineeringUnlocked({ getItem: key => store[key] })).toBe(true)
    expect(isEngineeringUnlocked({ getItem: () => 'true' })).toBe(false)
  })
})

describe('路由守衛預設值', () => {
  it('什麼都沒傳時拒絕（不可預設成可進入）', () => {
    expect(engineeringRouteDecision()).toBe('deny')
  })
})

describe('讀取本機資料', () => {
  it('API 網址不是字串或為空時主機名稱為空', () => {
    expect(graphqlHostname(null)).toBe('')
    expect(graphqlHostname(123)).toBe('')
    expect(graphqlHostname('')).toBe('')
  })

  it('店家摘要：只取 id 與名稱，內容缺漏或壞掉時回空字串', () => {
    expect(readMerchantSummary(JSON.stringify({ id: 7, name: '中山店', solmateKey: 'secret' }))).toEqual({ id: '7', name: '中山店' })
    expect(readMerchantSummary(JSON.stringify({ id: 'm-1' }))).toEqual({ id: 'm-1', name: '' })
    expect(readMerchantSummary(JSON.stringify({ name: '中山店' }))).toEqual({ id: '', name: '中山店' })
    expect(readMerchantSummary('')).toEqual({ id: '', name: '' })
    expect(readMerchantSummary(null)).toEqual({ id: '', name: '' })
    expect(readMerchantSummary('null')).toEqual({ id: '', name: '' })
    expect(readMerchantSummary('5')).toEqual({ id: '', name: '' })
    expect(readMerchantSummary('{壞掉')).toEqual({ id: '', name: '' })
  })

  it('登入者名稱：只取 name，缺漏或壞掉時回空字串', () => {
    expect(readStoredUserName(JSON.stringify({ id: 'u1', name: '小林' }))).toBe('小林')
    expect(readStoredUserName(JSON.stringify({ name: 42 }))).toBe('42')
    expect(readStoredUserName(JSON.stringify({ id: 'u1' }))).toBe('')
    expect(readStoredUserName('null')).toBe('')
    expect(readStoredUserName('')).toBe('')
    expect(readStoredUserName('{壞掉')).toBe('')
  })

  it('儲存鍵：沒有 getItem 也沒有 key 時無法讀取；列舉時略過空鍵；讀取拋錯時回報無法讀取', () => {
    expect(readStorageKeyPresence({}).readable).toBe(false)
    const sparse = readStorageKeyPresence({ length: 3, key: i => [null, 'token', ''][i] })
    expect(sparse.keyCount).toBe(1)
    expect(sparse.known.find(item => item.key === 'token').present).toBe(true)
    const broken = readStorageKeyPresence({
      length: 1,
      key: () => 'other',
      getItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(broken).toEqual({
      readable: false,
      keyCount: 0,
      known: [
        { key: 'user', present: false },
        { key: 'userMerchant', present: false },
        { key: 'token', present: false },
        { key: 'keepLogin', present: false },
      ],
    })
  })
})

describe('健康檢查缺資料', () => {
  it('什麼都沒傳：每一項都 FAIL 並寫出原因（不可空白或誤判 PASS）', () => {
    const checks = buildEngineeringChecks()
    expect(checks.map(check => check.status)).toEqual(['fail', 'fail', 'fail', 'pending', 'fail', 'fail'])
    expect(checks.find(c => c.id === 'version').detail).toBe('沒有版號')
    expect(checks.find(c => c.id === 'runtime').detail).toBe('無法判斷執行環境')
    expect(checks.find(c => c.id === 'api-host').detail).toBe('無法解析 API 主機')
    expect(checks.find(c => c.id === 'graphql').detail).toBe('正在確認既有的登入者角色查詢')
    expect(checks.find(c => c.id === 'diagnostics').detail).toBe('無法讀取 localStorage')
  })

  it('正式 API 標示正式；未知環境不標示且建置環境項 FAIL', () => {
    const prod = buildEngineeringChecks({ nodeEnv: 'production', apiEnvironment: 'production' })
    expect(prod.find(c => c.id === 'runtime')).toMatchObject({ status: 'pass', detail: 'production／正式 API' })
    const unknown = buildEngineeringChecks({ nodeEnv: 'production', apiEnvironment: 'other' })
    expect(unknown.find(c => c.id === 'runtime')).toMatchObject({ status: 'fail', detail: 'production' })
  })

  it('GraphQL 狀態不是 pass／pending 時一律當失敗', () => {
    expect(buildEngineeringChecks({ graphqlStatus: 'timeout' }).find(c => c.id === 'graphql')).toMatchObject({
      status: 'fail',
      detail: '既有的登入者角色查詢失敗',
    })
  })

  it('登入與店家：沒有登入者名稱時摘要不帶登入者；merchant 為 null 時 FAIL', () => {
    const ok = buildEngineeringChecks({ merchant: { id: 'm-1', name: '測試店' }, roleName: '高階主管' })
    expect(ok.find(c => c.id === 'session').detail).toBe('店家 測試店（m-1）、角色 高階主管')
    expect(buildEngineeringChecks({ merchant: null, roleName: '高階主管' }).find(c => c.id === 'session').status).toBe('fail')
  })

  it('本機診斷缺一部分時列出已知的部分；視窗尺寸不是數字時不顯示', () => {
    const partial = buildEngineeringChecks({
      storage: { readable: true, keyCount: 0 },
      viewport: { width: 390, height: 844 },
    })
    expect(partial.find(c => c.id === 'diagnostics')).toMatchObject({ status: 'fail', detail: '鍵數量 0。。視窗 390 × 844' })
    const badViewport = buildEngineeringChecks({ userAgent: 'UA', viewport: { width: NaN, height: 1 } })
    expect(badViewport.find(c => c.id === 'diagnostics').detail).toBe('無法讀取 localStorage。UA')
  })
})
