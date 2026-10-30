import { startOfDay } from 'date-fns'
import {
  checkedOutDraft,
  checkedOutDraftPath,
  classifyDraftPending,
  clearCheckedOutDrafts,
  confirmDraftStillPendingOnDates,
  isUncertainCheckoutError,
  rememberCheckedOutDraft,
} from '../draftCheckoutGuard'

afterEach(() => {
  clearCheckedOutDrafts()
})

describe('掛單是否還能結帳', () => {
  it('當天清單完整且沒有這張掛單：已結帳', () => {
    expect(classifyDraftPending({ pendingOrders: { totalCount: 0, orders: [] } }, 'draft-1')).toBe('closed')
    expect(
      classifyDraftPending(
        {
          pendingOrders: { totalCount: 1, orders: [{ id: 'other' }] },
        },
        'draft-1'
      )
    ).toBe('closed')
  })

  it('清單裡還有這張掛單：仍可結帳', () => {
    expect(
      classifyDraftPending(
        {
          pendingOrders: { totalCount: 2, orders: [{ id: 'draft-1' }, { id: 'other' }] },
        },
        'draft-1'
      )
    ).toBe('open')
  })

  it('清單不完整、筆數不是數字、或沒有資料：不能當成已結帳', () => {
    expect(classifyDraftPending({ pendingOrders: { totalCount: 5, orders: [{ id: 'other' }] } }, 'draft-1')).toBe('unknown')
    expect(classifyDraftPending({ pendingOrders: { totalCount: null, orders: [] } }, 'draft-1')).toBe('unknown')
    expect(classifyDraftPending(null, 'draft-1')).toBe('unknown')
  })
})

describe('結帳錯誤能不能再送', () => {
  it('斷線、逾時當成結果不確定；密碼或庫存這類業務錯誤可以立刻再試', () => {
    expect(isUncertainCheckoutError({ networkError: new Error('Failed to fetch'), message: 'Failed to fetch' })).toBe(true)
    expect(isUncertainCheckoutError(new Error('timeout of 30000ms exceeded'))).toBe(true)
    expect(isUncertainCheckoutError(new Error('網路連線異常，請檢查網路後再試一次'))).toBe(true)
    expect(
      isUncertainCheckoutError({
        graphQLErrors: [{ message: '密碼錯誤' }],
        message: '密碼錯誤',
      })
    ).toBe(false)
    expect(isUncertainCheckoutError(new Error('庫存不足'))).toBe(false)
  })
})

describe('結帳不確定時要同時看編輯日期與原掛單日期', () => {
  const edited = new Date(2026, 9, 18, 15).getTime()
  const original = new Date(2026, 9, 21, 10, 30).getTime()
  const editedStart = startOfDay(new Date(edited)).getTime()
  const originalStart = startOfDay(new Date(original)).getTime()

  const clientFor = byStart => {
    const query = jest.fn(({ variables }) => {
      const payload = byStart(variables.input.dateRange.startDate)
      if (payload instanceof Error) return Promise.reject(payload)
      return Promise.resolve({ data: { pendingOrders: payload } })
    })
    return { client: { query }, query }
  }

  it('編輯那天的清單沒有這張，但原日期仍有：還是掛單', async () => {
    const { client, query } = clientFor(start =>
      start === editedStart ? { totalCount: 0, orders: [] } : { totalCount: 1, orders: [{ id: 'draft-1' }] }
    )
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', [edited, original])).resolves.toBe('open')
    expect(query.mock.calls.map(call => call[0].variables.input.dateRange.startDate)).toEqual([editedStart, originalStart])
  })

  it('兩天的完整清單都沒有這張：已結帳', async () => {
    const { client } = clientFor(() => ({ totalCount: 0, orders: [] }))
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', [edited, original])).resolves.toBe('closed')
  })

  it('編輯那天沒有這張，但原日期查詢失敗：不能當成已結帳', async () => {
    const { client } = clientFor(start => (start === originalStart ? new Error('Failed to fetch') : { totalCount: 0, orders: [] }))
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', [edited, original])).resolves.toBe('unknown')
  })

  it('同一天只查一次；沒有日期則不查', async () => {
    const morning = new Date(2026, 9, 21, 10).getTime()
    const evening = new Date(2026, 9, 21, 18).getTime()
    const { client, query } = clientFor(() => ({ totalCount: 0, orders: [] }))
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', [morning, evening])).resolves.toBe('closed')
    expect(query).toHaveBeenCalledTimes(1)
    query.mockClear()
    await expect(confirmDraftStillPendingOnDates(client, 'draft-1', [null, ''])).resolves.toBe('unknown')
    expect(query).not.toHaveBeenCalled()
  })
})

describe('已結帳的掛單網址', () => {
  it('記住新帳單 id，再開原掛單就前往那張帳單詳細', () => {
    rememberCheckedOutDraft('draft-1', 'closed-bill', '/management/orders?startDate=1&endDate=2')
    const record = checkedOutDraft('draft-1')
    expect(checkedOutDraftPath(record, 'draft-1')).toBe('/order/closed-bill')
  })

  it('沒有新帳單 id 時回到當時的帳單列表', () => {
    rememberCheckedOutDraft('draft-1', '', '/management/orders?startDate=1&endDate=2')
    expect(checkedOutDraftPath(checkedOutDraft('draft-1'), 'draft-1')).toBe('/management/orders?startDate=1&endDate=2')
  })
})
