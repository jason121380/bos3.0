import { ApolloLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'

// 設定類查詢的快取策略（2026/10/21，Jason 同意）：
// 原本全站 410 處用 cache-and-network，每次換頁都會把「會員卡是否啟用」「商品分類」這類很少變的設定重抓一次。
// 改成：同一次開頁先用快取（cache-first）；只要有任何 mutation 成功，或距離上次清除超過 10 分鐘，就把這些設定從快取移除，
// 畫面上正在用的會自動重抓、之後進入的頁面也會重抓。切換店家與登出都會重新整理頁面，快取本來就會清空。
// 代價：別台電腦改了設定，這台最慢 10 分鐘（或下一次存檔、或重新整理）才會看到。
export const SETTINGS_FETCH_POLICY = 'cache-first'
export const SETTINGS_MAX_AGE_MS = 10 * 60 * 1000

const settingsFields = new Set()

// 換頁時自動送出、不會改到任何設定的 mutation：不觸發清除（否則每次進打帳單都會把設定快取清掉）
const NON_SETTINGS_MUTATIONS = new Set(['SET_UPDATE_USER_ORDERABLE_LIST'])

// 包住設定類查詢的 gql 文件，登記它的根欄位（之後清除快取時用）；回傳原文件，不改查詢內容
export function settingsQuery(doc) {
  const def = getMainDefinition(doc)
  def.selectionSet.selections.forEach(selection => {
    if (selection.kind === 'Field') settingsFields.add(selection.name.value)
  })
  return doc
}

export function registeredSettingsFields() {
  return [...settingsFields]
}

let boundCache = null
let expiryTimer = null

export function evictSettings(cache = boundCache) {
  if (!cache) return
  settingsFields.forEach(fieldName => cache.evict({ id: 'ROOT_QUERY', fieldName }))
  cache.gc()
}

// 綁定 App 的 cache，並每 10 分鐘清除一次設定快取（cache-first 讀快取時不會經過 link，所以用計時器，不靠請求觸發）
export function bindSettingsCache(cache, { expire = true } = {}) {
  boundCache = cache
  if (expiryTimer) clearInterval(expiryTimer)
  expiryTimer = expire ? setInterval(() => evictSettings(), SETTINGS_MAX_AGE_MS) : null
}

// 放在 link 鏈最前面：mutation 成功（沒有 GraphQL 錯誤）後清除設定快取
export const settingsCacheLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query)
  const isMutation = definition.kind === 'OperationDefinition' && definition.operation === 'mutation'
  if (!isMutation || NON_SETTINGS_MUTATIONS.has(operation.operationName)) return forward(operation)
  return forward(operation).map(result => {
    if (!result.errors || result.errors.length === 0) evictSettings()
    return result
  })
})
