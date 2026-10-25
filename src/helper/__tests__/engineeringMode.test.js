import {
  ENGINEERING_GATE_PASSWORD,
  ENGINEERING_MENU_TITLE,
  ENGINEERING_PATH,
  ENGINEERING_UNLOCK_KEY,
  EXECUTIVE_AUTHORITY_NAME,
  buildEngineeringChecks,
  clearEngineeringUnlock,
  engineeringRouteDecision,
  graphqlHostname,
  isEngineeringUnlocked,
  isExecutiveAuthority,
  readStorageKeyPresence,
  shouldBypassPageAuthority,
  tryUnlockEngineering,
} from '../engineeringMode'

beforeEach(() => {
  clearEngineeringUnlock()
  sessionStorage.clear()
})

describe('高階主管可見性', () => {
  test('只有角色名稱恰好為高階主管', () => {
    expect(EXECUTIVE_AUTHORITY_NAME).toBe('高階主管')
    expect(isExecutiveAuthority('高階主管')).toBe(true)
  })

  test('其他角色、空白、isAdmin 字串都不是高階主管', () => {
    ;['設計師', '店長', '主管', '高階主管 ', ' 高階主管', 'admin', 'true', '', null, undefined].forEach(name => {
      expect(isExecutiveAuthority(name)).toBe(false)
    })
  })

  test('選單標題與路徑', () => {
    expect(ENGINEERING_MENU_TITLE).toBe('工程模式')
    expect(ENGINEERING_PATH).toBe('/engineering')
    expect(shouldBypassPageAuthority('/engineering')).toBe(true)
    expect(shouldBypassPageAuthority('/engineering/extra')).toBe(false)
    expect(shouldBypassPageAuthority('/authority')).toBe(false)
  })
})

describe('密碼閘', () => {
  test('正確密碼解鎖，sessionStorage 只存標記、不存密碼', () => {
    expect(ENGINEERING_GATE_PASSWORD).toBe('0000')
    expect(tryUnlockEngineering(ENGINEERING_GATE_PASSWORD)).toBe(true)
    expect(isEngineeringUnlocked()).toBe(true)
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).toBe('1')
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).not.toBe(ENGINEERING_GATE_PASSWORD)
  })

  test('錯誤密碼不解鎖，也不寫入標記', () => {
    expect(tryUnlockEngineering('1234')).toBe(false)
    expect(tryUnlockEngineering('')).toBe(false)
    expect(tryUnlockEngineering(null)).toBe(false)
    expect(isEngineeringUnlocked()).toBe(false)
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).toBeNull()
  })

  test('清除解鎖後必須再輸入密碼', () => {
    tryUnlockEngineering(ENGINEERING_GATE_PASSWORD)
    clearEngineeringUnlock()
    expect(isEngineeringUnlocked()).toBe(false)
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).toBeNull()
  })
})

describe('路由守衛', () => {
  test('角色載入中不顯示內容', () => {
    expect(engineeringRouteDecision({ loading: true, authorityName: '', unlocked: true })).toBe('loading')
  })

  test('非高階主管即使已解鎖也拒絕', () => {
    expect(engineeringRouteDecision({ loading: false, authorityName: '設計師', unlocked: true })).toBe('deny')
    expect(engineeringRouteDecision({ loading: false, authorityName: '', unlocked: false })).toBe('deny')
  })

  test('高階主管未解鎖只到密碼閘，深連結也不會直接進內容', () => {
    expect(engineeringRouteDecision({ loading: false, authorityName: '高階主管', unlocked: false })).toBe('gate')
  })

  test('高階主管已解鎖才進內容', () => {
    expect(engineeringRouteDecision({ loading: false, authorityName: '高階主管', unlocked: true })).toBe('content')
  })

  test('角色曾確認過，之後查詢失敗仍留在已解鎖的內容', () => {
    expect(engineeringRouteDecision({ loading: false, authorityName: '', unlocked: true, roleConfirmed: true })).toBe('content')
    expect(engineeringRouteDecision({ loading: true, authorityName: '', unlocked: false, roleConfirmed: true })).toBe('gate')
  })
})

describe('健康檢查', () => {
  test('只報告鍵是否存在，不讀 token 的值', () => {
    const storage = {
      length: 2,
      key: index => ['token', 'user'][index],
    }
    const presence = readStorageKeyPresence(storage)
    expect(presence).toEqual({
      readable: true,
      keyCount: 2,
      known: [
        { key: 'user', present: true },
        { key: 'userMerchant', present: false },
        { key: 'token', present: true },
        { key: 'keepLogin', present: false },
      ],
    })
    expect(JSON.stringify(presence)).not.toContain('secret')
  })

  test('只有 getItem 的儲存仍能判斷已知鍵，且不把值放進結果', () => {
    const store = { token: 'secret-token-value', user: '{"id":"u1"}' }
    const presence = readStorageKeyPresence({
      getItem: key => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    })
    expect(presence.readable).toBe(true)
    expect(presence.known.find(item => item.key === 'token').present).toBe(true)
    expect(presence.known.find(item => item.key === 'keepLogin').present).toBe(false)
    expect(JSON.stringify(presence)).not.toContain('secret-token-value')
  })

  test('主機名稱不含帳密與路徑', () => {
    expect(graphqlHostname('https://user:pass@api.example.com/graphql?token=abc')).toBe('api.example.com')
    expect(graphqlHostname('not a url')).toBe('')
  })

  test('資料齊全為 PASS；GraphQL 失敗與缺少店家為 FAIL', () => {
    const base = {
      appVersion: 'v3.10251829',
      nodeEnv: 'production',
      apiEnvironment: 'staging',
      apiHostname: 'api.example.com',
      graphqlStatus: 'pass',
      merchant: { id: 'm-1', name: '測試店' },
      roleName: '高階主管',
      userName: '店長小林',
      storage: readStorageKeyPresence({ length: 1, key: () => 'user' }),
      userAgent: 'TestAgent',
      viewport: { width: 1280, height: 720 },
    }
    const ok = buildEngineeringChecks(base)
    expect(ok.map(check => check.status)).toEqual(['pass', 'pass', 'pass', 'pass', 'pass', 'pass'])
    expect(ok.find(check => check.id === 'version').detail).toContain('v3.10251829')
    expect(ok.find(check => check.id === 'api-host').detail).toBe('api.example.com')
    expect(JSON.stringify(ok)).not.toContain('0000')

    const failed = buildEngineeringChecks({ ...base, graphqlStatus: 'fail', merchant: { id: '', name: '' }, roleName: '' })
    expect(failed.find(check => check.id === 'graphql').status).toBe('fail')
    expect(failed.find(check => check.id === 'session').status).toBe('fail')
    expect(failed.find(check => check.id === 'version').status).toBe('pass')
  })

  test('讀不到 localStorage 時本機診斷為 FAIL', () => {
    const checks = buildEngineeringChecks({
      appVersion: 'v3.10251829',
      nodeEnv: 'test',
      apiEnvironment: 'staging',
      apiHostname: 'api.example.com',
      graphqlStatus: 'pending',
      merchant: { id: 'm-1', name: '測試店' },
      roleName: '高階主管',
      storage: readStorageKeyPresence(null),
      userAgent: 'TestAgent',
      viewport: { width: 800, height: 600 },
    })
    expect(checks.find(check => check.id === 'diagnostics').status).toBe('fail')
    expect(checks.find(check => check.id === 'graphql').status).toBe('pending')
  })
})
