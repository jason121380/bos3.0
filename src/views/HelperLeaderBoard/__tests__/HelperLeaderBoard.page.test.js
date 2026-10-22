// 保護「互助排行榜」：
// - 進頁查本月 1 日到今天結束（台灣時間）、依點數排序、虛業績、店家不限；選店家後按「搜尋」才送出店家並顯示排行；
//   改日期時沿用已選的店家；清除店家立即改回不限
// - 排序依據切換送出 PRICE；再按一次已選的排序鈕不可把排序送成 null
// - 業績依據（虛／實）只在店家沒有隱藏切換鈕時出現，切到實業績時欄名改「(實)」
// - 名次依後端順序；互助點數／金額、店販、會員卡業績顯示到小數 2 位；合計列＝各列加總四捨五入
// - 會員卡欄：店家啟用會員卡，或有人會員卡業績不為 0 時才顯示（表格與匯出一致）
// - 跨店合併的設計師可展開各店明細
// - 匯出 CSV：欄名與表格一致（互助獲得(點數)、互助獲得(金額)）＋合計列
// - 列印呼叫瀏覽器列印；報表查詢失敗時不整頁錯誤
// 店家多選（MerchantListAutocpmplete）換成替身；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import { headerTexts, rowCells } from '../../__tests__/staffReportKit.test'
import HelperLeaderBoard from '..'

jest.mock('components/MerchantListAutocpmplete', () => require('../../__tests__/staffReportKit.test').merchantListModule)
jest.setTimeout(20000)

const REPORT = [
  {
    userName: '小美',
    storeName: '總店',
    productTotal: 1234.567,
    helperReceivedPoint: 10.256,
    helperReceivedPrice: 500.4,
    membershipTotal: 0,
    mergedDetails: [
      { storeName: '總店', productTotal: 1000, helperReceivedPoint: 6, helperReceivedPrice: 300, membershipTotal: 0 },
      { storeName: '分店', productTotal: 234.567, helperReceivedPoint: 4.256, helperReceivedPrice: 200.4, membershipTotal: 0 },
    ],
  },
  { userName: '阿明', storeName: '分店', productTotal: 100, helperReceivedPoint: 2, helperReceivedPrice: null, membershipTotal: 0, mergedDetails: [] },
]

const setup = (extra = {}) =>
  renderPage(<HelperLeaderBoard />, {
    route: '/helper-leaderboard',
    fixtures: {
      FETCH_HELPER_LEADERBOARD: { helperLeaderboard: REPORT },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      ...extra,
    },
  })
const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_HELPER_LEADERBOARD')
  return list[list.length - 1].variables.input
}
const search = async (calls, settle) => {
  fireEvent.click(screen.getByText('選擇店家（測試）'))
  fireEvent.click(screen.getByText('搜尋'))
  await wait(() => expect(lastInput(calls).merchantId).toEqual(['m1', 'm2']))
  await settle()
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('互助排行榜：查詢條件', () => {
  it('進頁查本月到今天、依點數、虛業績、店家不限；未選店家不顯示排行', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_HELPER_LEADERBOARD')[0].variables.input).toEqual({
      startDay: startOfMonth(new Date()).getTime(),
      endDay: endOfDay(new Date()).getTime(),
      merchantId: [],
      reference: 'FAKE',
      orderBy: 'POINT',
    })
    expect(document.querySelector('table')).toBeNull()
  })

  it('選店家後搜尋送出店家並顯示排行；改日期沿用店家；清除店家改回不限並隱藏排行', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(screen.getByText('小美')).toBeInTheDocument()
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastInput(calls)).toMatchObject({
        startDay: startOfDay(subDays(new Date(), 1)).getTime(),
        endDay: endOfDay(subDays(new Date(), 1)).getTime(),
        merchantId: ['m1', 'm2'],
      })
    )
    fireEvent.click(screen.getByText('清除店家（測試）'))
    await wait(() => expect(lastInput(calls).merchantId).toEqual([]))
    await settle()
    expect(document.querySelector('table')).toBeNull()
  })

  it('排序依據切換送出 PRICE；再按一次已選的排序鈕不改變排序（不送 null）', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('依金額'))
    await wait(() => expect(lastInput(calls).orderBy).toBe('PRICE'))
    await settle()
    const count = callsOf(calls, 'FETCH_HELPER_LEADERBOARD').length
    fireEvent.click(screen.getByText('依金額'))
    await settle()
    expect(screen.getByText('依金額').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(callsOf(calls, 'FETCH_HELPER_LEADERBOARD').slice(count).map(c => c.variables.input.orderBy)).not.toContain(null)
    expect(lastInput(calls).orderBy).toBe('PRICE')
  })

  it('業績依據切到實業績：送出 TRUTH、欄名（含明細、會員卡）與匯出欄名改「(實)」；再按一次不改變', async () => {
    const { calls, settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await search(calls, settle)
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastInput(calls).reference).toBe('TRUTH'))
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await settle()
    expect(lastInput(calls).reference).toBe('TRUTH')
    expect(headerTexts()).toEqual(expect.arrayContaining(['店販業績(實)', '會員卡業績(實)']))
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    expect(headerTexts(document.querySelector('table table'))).toEqual(['所屬店家', '互助獲得(點數)', '互助獲得(金額)', '店販業績(實)', '會員卡業績(實)'])
    await wait(() => expect(exportedCsv()).toContain('"店販業績 (實)","會員卡業績 (實)"'))
  })

  it('店家設定隱藏虛實切換鈕時不顯示業績依據', async () => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } })
    await settle()
    expect(screen.queryByText('業績依據')).toBeNull()
    expect(screen.queryByText('實業績')).toBeNull()
  })
})

describe('互助排行榜：表格與匯出', () => {
  it('名次依後端順序、數字到小數 2 位、合計列；未啟用會員卡且業績皆 0 時不顯示會員卡欄', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(headerTexts()).toEqual(['展開', '名次', '設計師', '所屬店家', '互助獲得(點數)', '互助獲得(金額)', '店販業績(虛)'])
    expect(rowCells('小美')).toEqual(['', '1', '小美', '總店', '10.26', '500.4', '1,234.57'])
    expect(rowCells('阿明')).toEqual(['', '2', '阿明', '分店', '2', '0', '100'])
    // 合計：12.256→12、500.4→500、1334.567→1,335
    expect(rowCells('合計')).toEqual(['', '合計', '', '', '12', '500', '1,335'])
  })

  it('跨店合併的設計師可展開各店明細、再收合', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(screen.queryByText('分店', { selector: 'table table td' })).toBeNull()
    expect(screen.getAllByRole('button', { name: '展開明細' })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    const detail = document.querySelector('table table')
    expect(within(detail).getAllByRole('row').map(r => r.textContent)).toEqual([
      '所屬店家互助獲得(點數)互助獲得(金額)店販業績(虛)',
      '總店63001,000',
      '分店4.26200.4234.57',
    ])
    fireEvent.click(screen.getByRole('button', { name: '收合明細' }))
    expect(document.querySelector('table table')).toBeNull()
  })

  it('沒有跨店資料時不顯示展開欄', async () => {
    const { calls, settle } = setup({ FETCH_HELPER_LEADERBOARD: { helperLeaderboard: [REPORT[1], { ...REPORT[1], userName: '老王', mergedDetails: null }] } })
    await settle()
    await search(calls, settle)
    expect(headerTexts()[0]).toBe('名次')
    expect(rowCells('合計')[0]).toBe('合計')
  })

  it('匯出：欄名與表格一致（互助獲得(金額)）、每人一列＋合計列；未顯示會員卡時不含會員卡欄', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    await wait(() => expect(exportedCsv()).toContain('"設計師","所屬店家","互助獲得(點數)","互助獲得(金額)","店販業績 (虛)"'))
    expect(exportedCsv()).toContain('"小美","總店","10","500","1235"')
    expect(exportedCsv()).toContain('"合計","","12","500","1335"')
    expect(exportedCsv()).not.toContain('會員卡')
  })

  it('有人會員卡業績不為 0 時顯示會員卡欄（含明細、匯出）', async () => {
    const report = [{ ...REPORT[0], membershipTotal: 800.5, mergedDetails: REPORT[0].mergedDetails.map(d => ({ ...d, membershipTotal: 400.25 })) }, REPORT[1]]
    const { calls, settle } = setup({ FETCH_HELPER_LEADERBOARD: { helperLeaderboard: report } })
    await settle()
    await search(calls, settle)
    expect(headerTexts()).toContain('會員卡業績(虛)')
    expect(rowCells('小美').pop()).toBe('800.5')
    expect(rowCells('合計').pop()).toBe('801')
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    expect(within(document.querySelector('table table')).getAllByText('400.25')).toHaveLength(2)
    expect(document.querySelector('table table').closest('td')).toHaveAttribute('colspan', '8')
    await wait(() => expect(exportedCsv()).toContain('"小美","總店","10","500","1235","801"'))
    expect(exportedCsv()).toContain('"合計","","12","500","1335","801"')
  })

  it('未顯示會員卡時展開明細列的跨欄數與表格欄數相同', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    const columns = headerTexts().length
    expect(columns).toBe(7)
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    expect(document.querySelector('table table').closest('td')).toHaveAttribute('colspan', String(columns))
  })

  it('店家啟用會員卡時即使業績皆 0 也顯示會員卡欄', async () => {
    const { calls, settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await search(calls, settle)
    expect(headerTexts()).toContain('會員卡業績(虛)')
    await wait(() => expect(exportedCsv()).toContain('會員卡業績 (虛)'))
  })

  it('列印呼叫瀏覽器列印；報表查詢失敗、回傳 null 時不整頁錯誤', async () => {
    window.print = jest.fn()
    const { calls, settle } = setup({ FETCH_HELPER_LEADERBOARD: new Error('查詢失敗') })
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(calls).merchantId).toEqual(['m1', 'm2']))
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('table')).toBeNull()
    cleanup()
    const nulled = setup({ FETCH_HELPER_LEADERBOARD: { helperLeaderboard: null } })
    await nulled.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
