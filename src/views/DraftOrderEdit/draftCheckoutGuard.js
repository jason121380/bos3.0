// 掛單結帳之後，草稿路由不能繼續結帳。
// 正式站曾發生：reCheckoutOrder 在客戶端逾時（或稍後才成功），但後端已成立另一張帳單；
// 掛單列表不再列出原 UUID，order(原 UUID) 仍回 200，掛單詳細就繼續顯示儲存／結帳。
// 這裡用三件事擋住第二次結帳（都不改後端）：
// 1. 同一次瀏覽記住「這張掛單已結帳」與新帳單 id（重新整理後直接改去帳單詳細）
// 2. 用既有的 pendingOrders 再查當天完整清單；確定不在清單裡就當成已結帳
// 3. 連線不確定（逾時、斷線）時，先做 2，確認仍是掛單才允許再送一次
import { gql } from '@apollo/client'
import { endOfDay, startOfDay } from 'date-fns'

const STORAGE_KEY = 'bos.checkedOutDrafts'
const STORAGE_LIMIT = 30

export const DRAFT_STILL_PENDING = gql`
  query DRAFT_STILL_PENDING($input: PendingOrderInput!) {
    pendingOrders(input: $input) {
      totalCount
      orders {
        id
      }
    }
  }
`

const NETWORK_MESSAGE = /網路連線異常|Failed to fetch|NetworkError|Network error|timeout|timed out|Load failed|ECONNRESET|ECONNABORTED|socket hang up|status code 504|status code 502|status code 408|\b504\b|\b502\b|\b408\b/i

function isNetworkMessage(message) {
  return NETWORK_MESSAGE.test(String(message || ''))
}

// 業務錯誤（密碼錯誤、庫存不足）代表這次沒成立，可以立刻再試。
// 沒有 GraphQL 業務錯誤、或錯誤本身是逾時／斷線，代表後端可能已經結帳成功。
export function isUncertainCheckoutError(error) {
  if (!error) return false
  if (error.networkError) return true
  const graphQLErrors = error.graphQLErrors
  if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
    return graphQLErrors.some(item => isNetworkMessage(item && item.message))
  }
  return isNetworkMessage(error.message)
}

// 'open' 仍可結帳；'closed' 當天完整掛單清單裡已經沒有這張；'unknown' 查詢不完整或失敗，不能當成已結帳。
export function classifyDraftPending(payload, orderId) {
  const pending = payload && payload.pendingOrders
  if (!pending || !Array.isArray(pending.orders) || typeof pending.totalCount !== 'number') return 'unknown'
  if (pending.orders.length < pending.totalCount) return 'unknown'
  const wanted = String(orderId)
  if (pending.orders.some(row => row && String(row.id) === wanted)) return 'open'
  return 'closed'
}

function readAll() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch (e) {
    return {}
  }
}

function writeAll(map) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (e) {
    // 隱私模式寫不進 sessionStorage 時，仍靠當次導頁與掛單清單再查
  }
}

export function clearCheckedOutDrafts() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // 忽略
  }
}

export function rememberCheckedOutDraft(draftId, orderId, listPath) {
  if (!draftId) return
  const all = readAll()
  all[draftId] = {
    orderId: orderId || '',
    listPath: listPath || '',
    at: Date.now(),
  }
  const ids = Object.keys(all)
  if (ids.length > STORAGE_LIMIT) {
    ids.sort((a, b) => (all[a].at || 0) - (all[b].at || 0))
    ids.slice(0, ids.length - STORAGE_LIMIT).forEach(id => {
      delete all[id]
    })
  }
  writeAll(all)
}

export function checkedOutDraft(draftId) {
  if (!draftId) return null
  const record = readAll()[draftId]
  if (!record || typeof record !== 'object') return null
  return record
}

export function checkedOutDraftPath(record, draftId) {
  if (record && record.orderId && record.orderId !== draftId) return `/order/${record.orderId}`
  if (record && record.listPath) return record.listPath
  return '/management/orders'
}

export function evictCheckedOutDraft(cache, draftId) {
  if (!cache || !draftId) return
  try {
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'order', args: { orderId: draftId } })
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'pendingOrders' })
    cache.gc()
  } catch (e) {
    // 清快取失敗不影響導頁；下次進入仍會依網路結果判斷
  }
}

export async function confirmDraftStillPending(client, orderId, date) {
  if (!client || !orderId || date === undefined || date === null || date === '') return 'unknown'
  const time = new Date(date).getTime()
  if (!Number.isFinite(time)) return 'unknown'
  try {
    const result = await client.query({
      query: DRAFT_STILL_PENDING,
      fetchPolicy: 'network-only',
      variables: {
        input: {
          dateRange: {
            startDate: startOfDay(new Date(time)).getTime(),
            endDate: endOfDay(new Date(time)).getTime(),
          },
          designerId: null,
          customerId: null,
          otherPayWay: null,
          thirdPartTicketId: null,
          sources: [],
          pageLimit: 1000,
          pageOffset: 0,
        },
      },
    })
    return classifyDraftPending(result && result.data, orderId)
  } catch (e) {
    return 'unknown'
  }
}

function draftDayKey(date) {
  if (date === undefined || date === null || date === '') return null
  const time = new Date(date).getTime()
  if (!Number.isFinite(time)) return null
  return startOfDay(new Date(time)).getTime()
}

// 結帳結果不確定時，畫面上的帳單日期可能已經被改到另一天，掛單仍留在當初存下的日期。
// 只查編輯後那天、而且那天的清單完整又沒有這張，不能當成已結帳。
// 任一天還看得到這張掛單就仍可結帳；有一天查不完整就不能當成已結帳。同一天只查一次。
export async function confirmDraftStillPendingOnDates(client, orderId, dates) {
  const seen = new Set()
  const unique = []
  ;(Array.isArray(dates) ? dates : [dates]).forEach(date => {
    const key = draftDayKey(date)
    if (key === null || seen.has(key)) return
    seen.add(key)
    unique.push(date)
  })
  if (!unique.length) return 'unknown'
  let sawUnknown = false
  for (let i = 0; i < unique.length; i += 1) {
    const status = await confirmDraftStillPending(client, orderId, unique[i])
    if (status === 'open') return 'open'
    if (status !== 'closed') sawUnknown = true
  }
  return sawUnknown ? 'unknown' : 'closed'
}
