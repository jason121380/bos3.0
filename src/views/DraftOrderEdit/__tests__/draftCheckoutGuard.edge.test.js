// 掛單「結帳後不可再結帳」防護的邊界情況。為什麼重要：這組判斷擋的是正式站發生過的重複結帳（同一張掛單成立兩張帳單）。
// 儲存壞掉、資料缺漏、日期無效時，判斷要往「不確定」或「什麼都不記」的安全方向，不能拋錯讓頁面停住，
// 也不能把仍是掛單的單子誤判成已結帳（使用者就無法結帳）。
import {
  checkedOutDraft,
  checkedOutDraftPath,
  clearCheckedOutDrafts,
  confirmDraftStillPending,
  confirmDraftStillPendingOnDates,
  evictCheckedOutDraft,
  isUncertainCheckoutError,
  rememberCheckedOutDraft,
} from '../draftCheckoutGuard'

const STORAGE_KEY = 'bos.checkedOutDrafts'

afterEach(() => {
  jest.restoreAllMocks()
  clearCheckedOutDrafts()
})

describe('結帳錯誤分類的邊界', () => {
  it('沒有錯誤物件不算不確定；GraphQL 錯誤本身是逾時也算不確定；沒有訊息的錯誤不算', () => {
    expect(isUncertainCheckoutError(null)).toBe(false)
    expect(isUncertainCheckoutError({ graphQLErrors: [{ message: 'upstream timed out' }] })).toBe(true)
    expect(isUncertainCheckoutError({ graphQLErrors: [null, { message: '密碼錯誤' }] })).toBe(false)
    expect(isUncertainCheckoutError({})).toBe(false)
  })
})

describe('已結帳記錄的讀寫', () => {
  it('沒有掛單 id 時不記錄、也查不到', () => {
    rememberCheckedOutDraft('', 'bill-1', '/management/orders')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(checkedOutDraft('')).toBeNull()
  })

  it('沒有帳單 id 與列表網址時存成空字串，路徑回到預設帳單列表', () => {
    rememberCheckedOutDraft('draft-1')
    const record = checkedOutDraft('draft-1')
    expect(record).toMatchObject({ orderId: '', listPath: '' })
    expect(checkedOutDraftPath(record, 'draft-1')).toBe('/management/orders')
    expect(checkedOutDraftPath(null, 'draft-1')).toBe('/management/orders')
  })

  it('新帳單 id 與掛單 id 相同時不導到帳單詳細（避免導回自己），改回列表', () => {
    expect(checkedOutDraftPath({ orderId: 'draft-1', listPath: '/management/orders?x=1' }, 'draft-1')).toBe('/management/orders?x=1')
  })

  it('只保留最近 30 筆，最舊的先移除', () => {
    const now = jest.spyOn(Date, 'now')
    for (let i = 0; i < 31; i += 1) {
      now.mockReturnValue(1000 + i)
      rememberCheckedOutDraft(`draft-${i}`, `bill-${i}`, '')
    }
    expect(checkedOutDraft('draft-0')).toBeNull()
    expect(checkedOutDraft('draft-1')).toMatchObject({ orderId: 'bill-1' })
    expect(checkedOutDraft('draft-30')).toMatchObject({ orderId: 'bill-30' })
    expect(Object.keys(JSON.parse(sessionStorage.getItem(STORAGE_KEY)))).toHaveLength(30)
  })

  it('舊記錄缺時間戳時當成最舊的先移除', () => {
    const seeded = {}
    for (let i = 0; i < 30; i += 1) seeded[`old-${i}`] = { orderId: `b-${i}`, listPath: '', at: i === 0 || i === 29 ? undefined : 5000 + i }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    rememberCheckedOutDraft('new', 'bill-new', '')
    // 31 筆超過上限 1 筆：移除一筆缺時間戳的（old-0 或 old-29），有時間戳的都保留
    expect([checkedOutDraft('old-0'), checkedOutDraft('old-29')].filter(Boolean)).toHaveLength(1)
    expect(checkedOutDraft('old-1')).toMatchObject({ orderId: 'b-1' })
    expect(checkedOutDraft('new')).toMatchObject({ orderId: 'bill-new' })
  })

  it('儲存內容壞掉（非物件、陣列、無法解析、單筆不是物件）時視為沒有記錄', () => {
    ;['5', '[]', 'null', '{壞掉'].forEach(raw => {
      sessionStorage.setItem(STORAGE_KEY, raw)
      expect(checkedOutDraft('draft-1')).toBeNull()
    })
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ 'draft-1': 'bill-1' }))
    expect(checkedOutDraft('draft-1')).toBeNull()
  })

  it('sessionStorage 寫入或清除拋錯（隱私模式）時不拋錯', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => rememberCheckedOutDraft('draft-1', 'bill-1', '')).not.toThrow()
    expect(() => clearCheckedOutDrafts()).not.toThrow()
  })
})

describe('清除帳單快取', () => {
  it('移除這張掛單與掛單清單的快取後回收', () => {
    const cache = { evict: jest.fn(), gc: jest.fn() }
    evictCheckedOutDraft(cache, 'draft-1')
    expect(cache.evict).toHaveBeenCalledWith({ id: 'ROOT_QUERY', fieldName: 'order', args: { orderId: 'draft-1' } })
    expect(cache.evict).toHaveBeenCalledWith({ id: 'ROOT_QUERY', fieldName: 'pendingOrders' })
    expect(cache.gc).toHaveBeenCalledTimes(1)
  })

  it('沒有快取或掛單 id 時不做事；清除拋錯也不影響導頁', () => {
    expect(() => evictCheckedOutDraft(null, 'draft-1')).not.toThrow()
    const cache = { evict: jest.fn(), gc: jest.fn() }
    evictCheckedOutDraft(cache, '')
    expect(cache.evict).not.toHaveBeenCalled()
    const broken = {
      evict: () => {
        throw new Error('cache gone')
      },
      gc: jest.fn(),
    }
    expect(() => evictCheckedOutDraft(broken, 'draft-1')).not.toThrow()
  })
})

describe('再查掛單清單的邊界', () => {
  it('缺 client、掛單 id、日期或日期無效時不查，回報不確定', async () => {
    const client = { query: jest.fn() }
    await expect(confirmDraftStillPending(null, 'draft-1', 1)).resolves.toBe('unknown')
    await expect(confirmDraftStillPending(client, '', 1)).resolves.toBe('unknown')
    await expect(confirmDraftStillPending(client, 'draft-1', undefined)).resolves.toBe('unknown')
    await expect(confirmDraftStillPending(client, 'draft-1', '')).resolves.toBe('unknown')
    await expect(confirmDraftStillPending(client, 'draft-1', 'not a date')).resolves.toBe('unknown')
    expect(client.query).not.toHaveBeenCalled()
  })

  it('查詢回傳沒有 data 時回報不確定', async () => {
    const client = { query: jest.fn(() => Promise.resolve(undefined)) }
    await expect(confirmDraftStillPending(client, 'draft-1', Date.now())).resolves.toBe('unknown')
  })

  it('單一日期（非陣列）也能查；無效日期略過', async () => {
    const client = { query: jest.fn(() => Promise.resolve({ data: { pendingOrders: { totalCount: 1, orders: [{ id: 'draft-1' }] } } })) }
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', Date.now())).resolves.toBe('open')
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', ['not a date'])).resolves.toBe('unknown')
    expect(client.query).toHaveBeenCalledTimes(1)
  })
})
