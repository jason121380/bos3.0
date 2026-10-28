// 工程模式的存取規則（高階主管＋本分頁密碼閘）。
// 高階主管沿用側欄「角色權限管理」的產品定義：登入者 merchantIdentity.authorityName 恰好為「高階主管」。
// 不是 isAdmin，也不是一組角色名稱；店長、設計師等其他 authorityName 都看不到。
// 密碼只放在 ENGINEERING_GATE_PASSWORD。解鎖標記寫 sessionStorage 的 '1'，不寫密碼本身。

export const ENGINEERING_PATH = '/engineering'
export const ENGINEERING_MENU_TITLE = '工程模式'
export const EXECUTIVE_AUTHORITY_NAME = '高階主管'
export const ENGINEERING_GATE_PASSWORD = '0000'
export const ENGINEERING_UNLOCK_KEY = 'bos.engineeringUnlocked'

export const KNOWN_APP_STORAGE_KEYS = ['user', 'userMerchant', 'token', 'keepLogin']

let memoryUnlocked = false

const storageOf = storage => {
  if (storage) return storage
  try {
    return sessionStorage
  } catch (e) {
    return null
  }
}

export const isExecutiveAuthority = authorityName => authorityName === EXECUTIVE_AUTHORITY_NAME

export const isEngineeringPath = pathname => pathname === ENGINEERING_PATH

// 後台的 checkPageAuthority 只認識既有頁面。工程模式沒有後端頁面權限，不能把未知網址導走，
// 否則高階主管也進不了這頁。角色改由頁面自己判斷。
export const shouldBypassPageAuthority = pathname => isEngineeringPath(pathname)

export const isEngineeringUnlocked = storage => {
  if (memoryUnlocked) return true
  const target = storageOf(storage)
  if (!target) return false
  try {
    return target.getItem(ENGINEERING_UNLOCK_KEY) === '1'
  } catch (e) {
    return false
  }
}

// 密碼正確才解鎖。回傳 false 時不寫入 sessionStorage。
export const tryUnlockEngineering = (password, storage) => {
  if (password !== ENGINEERING_GATE_PASSWORD) return false
  memoryUnlocked = true
  const target = storageOf(storage)
  if (!target) return true
  try {
    target.setItem(ENGINEERING_UNLOCK_KEY, '1')
  } catch (e) {
    // 隱私模式寫不進時，這次頁面仍保持解鎖
  }
  return true
}

export const clearEngineeringUnlock = storage => {
  memoryUnlocked = false
  const target = storageOf(storage)
  if (!target) return
  try {
    target.removeItem(ENGINEERING_UNLOCK_KEY)
  } catch (e) {
    // 清不掉儲存時，記憶體旗標已關
  }
}

// loading：角色尚未回來。deny：不是高階主管（或角色查詢失敗）。gate：高階主管但未解鎖。content：已解鎖。
export const engineeringRouteDecision = ({ loading = false, authorityName, unlocked = false, roleConfirmed = false } = {}) => {
  const executive = roleConfirmed || isExecutiveAuthority(authorityName)
  if (executive) return unlocked ? 'content' : 'gate'
  if (loading) return 'loading'
  return 'deny'
}

export const graphqlHostname = url => {
  if (!url || typeof url !== 'string') return ''
  try {
    return new URL(url).hostname
  } catch (e) {
    return ''
  }
}

export const readMerchantSummary = raw => {
  if (!raw) return { id: '', name: '' }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { id: '', name: '' }
    return {
      id: parsed.id == null ? '' : String(parsed.id),
      name: parsed.name == null ? '' : String(parsed.name),
    }
  } catch (e) {
    return { id: '', name: '' }
  }
}

export const readStoredUserName = raw => {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.name == null) return ''
    return String(parsed.name)
  } catch (e) {
    return ''
  }
}

// 只回鍵名是否存在與鍵的數量，不讀值（token 等機密不進畫面、不進回傳）。
// 瀏覽器的 Storage 用 length／key 計算總數。測試替身若只有 getItem，仍用它判斷已知鍵在不在，不把值帶出來。
export const readStorageKeyPresence = storage => {
  const emptyKnown = () => KNOWN_APP_STORAGE_KEYS.map(key => ({ key, present: false }))
  if (!storage || (typeof storage.getItem !== 'function' && typeof storage.key !== 'function')) {
    return { readable: false, keyCount: 0, known: emptyKnown() }
  }
  try {
    const names = []
    const canEnumerate = typeof storage.length === 'number' && typeof storage.key === 'function'
    if (canEnumerate) {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i)
        if (key) names.push(key)
      }
    }
    const known = KNOWN_APP_STORAGE_KEYS.map(key => {
      let present = names.includes(key)
      if (!present && typeof storage.getItem === 'function') present = storage.getItem(key) !== null
      return { key, present }
    })
    const keyCount = canEnumerate ? names.length : known.filter(item => item.present).length
    return { readable: true, keyCount, known }
  } catch (e) {
    return { readable: false, keyCount: 0, known: emptyKnown() }
  }
}

const apiEnvironmentLabel = apiEnvironment => {
  if (apiEnvironment === 'production') return '正式 API'
  if (apiEnvironment === 'staging') return '測試 API'
  return ''
}

export const buildEngineeringChecks = ({
  appVersion = '',
  nodeEnv = '',
  apiEnvironment = '',
  apiHostname = '',
  graphqlStatus = 'pending',
  merchant = { id: '', name: '' },
  roleName = '',
  userName = '',
  storage = { readable: false, keyCount: 0, known: [] },
  userAgent = '',
  viewport = null,
} = {}) => {
  const apiLabel = apiEnvironmentLabel(apiEnvironment)
  const runtimeText = [nodeEnv, apiLabel].filter(Boolean).join('／')
  const merchantOk = Boolean(merchant && merchant.id && merchant.name && roleName)
  const knownText = (storage.known || []).map(item => `${item.key} ${item.present ? '有' : '無'}`).join('、')
  const storageText = storage.readable ? `鍵數量 ${storage.keyCount}。${knownText}` : '無法讀取 localStorage'
  const viewportText =
    viewport && Number.isFinite(viewport.width) && Number.isFinite(viewport.height) ? `${viewport.width} × ${viewport.height}` : ''
  const diagnosticsOk = Boolean(storage.readable && userAgent && viewportText)
  const graphql = graphqlStatus === 'pass' || graphqlStatus === 'pending' ? graphqlStatus : 'fail'

  return [
    {
      id: 'version',
      label: '應用程式版號',
      status: appVersion ? 'pass' : 'fail',
      detail: appVersion ? `${appVersion}（與側欄左上角相同，來源 src/version.js）` : '沒有版號',
    },
    {
      id: 'runtime',
      label: '建置與 API 環境',
      status: nodeEnv && apiLabel ? 'pass' : 'fail',
      detail: runtimeText || '無法判斷執行環境',
    },
    {
      id: 'api-host',
      label: 'API 主機',
      status: apiHostname ? 'pass' : 'fail',
      detail: apiHostname || '無法解析 API 主機',
    },
    {
      id: 'graphql',
      label: 'GraphQL 連線',
      status: graphql,
      detail:
        graphql === 'pass'
          ? '已用既有的登入者角色查詢連上 GraphQL'
          : graphql === 'pending'
            ? '正在確認既有的登入者角色查詢'
            : '既有的登入者角色查詢失敗',
    },
    {
      id: 'session',
      label: '登入與店家',
      status: merchantOk ? 'pass' : 'fail',
      detail: merchantOk
        ? `店家 ${merchant.name}（${merchant.id}）、角色 ${roleName}${userName ? `、登入者 ${userName}` : ''}`
        : '缺少店家或角色，無法提供支援用的工作階段摘要',
    },
    {
      id: 'diagnostics',
      label: '本機診斷',
      status: diagnosticsOk ? 'pass' : 'fail',
      detail: diagnosticsOk
        ? `${storageText}。視窗 ${viewportText}。${userAgent}`
        : [storageText, viewportText ? `視窗 ${viewportText}` : '', userAgent].filter(Boolean).join('。') || '無法讀取本機診斷',
    },
  ]
}
