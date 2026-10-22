// 保護「設計師排行榜」：
// - 進頁查本月 1 日到今天結束（台灣時間）、虛業績、總業績不含店販與會員卡、店家不限；選店家按「搜尋」才送出店家並顯示排行；
//   沒選店家按搜尋時隱藏排行；已選店家時改日期自動沿用；清除店家時隱藏排行
// - 業績依據（虛／實）、總業績含店販、含會員卡（店家啟用會員卡或區間有會員卡業績才出現）切換時送出對應參數；再按一次已選的不改變
// - 欄位依設定增減：服務業績月平均（店家設定）、業績年預估值與客次數（報表設定）、指定／不指定（顯示切換）、會員卡；匯出欄位一致
// - 名次依後端順序、數字四捨五入；卡券販賣＝指定＋不指定；合計列（服務業績月平均用後端的合計）
// - 跨店合併的設計師可展開各店明細
// - 查詢失敗（排行、報表設定）時不整頁錯誤
// 店家多選換成替身；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { csvRows, headerTexts, rowCells } from '../../__tests__/staffReportKit.test'
import DesignerPerformBasic from '..'

jest.mock('components/MerchantListAutocpmplete', () => require('../../__tests__/staffReportKit.test').merchantListModule)
jest.mock('react-csv', () => require('../../__tests__/staffReportKit.test').csvModule)
jest.setTimeout(20000)

const numbers = (extra = {}) => ({
  serviceTotal: 10000.4,
  designateServiceTotal: 6000.4,
  nonDesignateServiceTotal: 4000,
  usedTicketTotal: 1000.6,
  productTotal: 500.4,
  membershipTotal: 0,
  helperPaidPoint: 3.4,
  helperPaidPrice: 100.6,
  monthlyAveragePerformance: 9000.4,
  ticketSellIntoPerformanceDesignate: 200.3,
  ticketSellIntoPerformanceNonDesignate: 100.3,
  businessPerformanceTotal: 11501,
  orderCount: 12,
  performanceEV: 120000.4,
  ...extra,
})
const AMY = {
  userName: '小美',
  storeName: '總店',
  ...numbers(),
  mergedDetails: [
    { storeName: '總店', ...numbers({ serviceTotal: 8000 }) },
    { storeName: '分店', ...numbers({ serviceTotal: 2000.4 }) },
  ],
}
const MING = { userName: '阿明', storeName: '分店', ...numbers({ serviceTotal: 5000, businessPerformanceTotal: 6000 }), mergedDetails: [] }
const leaderboard = (list = [AMY, MING]) => ({ designerLeaderboard: { designerLeaderBoard: list, monthlyAveragePerformanceTotal: 15000.6 } })

const setup = (extra = {}) =>
  renderPage(<DesignerPerformBasic />, {
    route: '/designer-perform-basic',
    fixtures: {
      FETCH_DESIGNERS_LEADERBOARD: leaderboard(),
      GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: { getMonthlyAverageDisplayForDesignerLeaderBoard: false },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      GET_DRR_DATA_DISPLAY: { getParameterReportSetting: { isDRROCDisplay: false, isDRRPEVDisplay: false } },
      ...extra,
    },
  })
const lastVariables = calls => {
  const list = callsOf(calls, 'FETCH_DESIGNERS_LEADERBOARD')
  return list[list.length - 1].variables
}
const search = async (calls, settle) => {
  fireEvent.click(screen.getByText('選擇店家（測試）'))
  fireEvent.click(screen.getByText('搜尋'))
  await wait(() => expect(lastVariables(calls).merchantId).toEqual(['m1', 'm2']))
  await settle()
}
const table = () => document.querySelector('.DesignerPerformBasicTable table') || document.querySelector('table')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師排行榜：查詢條件', () => {
  it('進頁查本月到今天、虛業績、不含店販與會員卡、店家不限；未搜尋不顯示排行', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_DESIGNERS_LEADERBOARD')[0].variables).toEqual({
      startDay: startOfMonth(new Date()).getTime(),
      endDay: endOfDay(new Date()).getTime(),
      merchantId: [],
      reference: 'FAKE',
      isIncludeProductPerformance: false,
      isIncludeMembershipPerformance: false,
    })
    expect(document.querySelector('table')).toBeNull()
  })

  it('選店家搜尋送出店家並顯示排行；改日期沿用店家；清除店家隱藏排行；沒選店家搜尋也隱藏', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(screen.getByText('小美')).toBeInTheDocument()
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastVariables(calls)).toMatchObject({
        startDay: startOfDay(subDays(new Date(), 1)).getTime(),
        endDay: endOfDay(subDays(new Date(), 1)).getTime(),
        merchantId: ['m1', 'm2'],
      })
    )
    await settle()
    fireEvent.click(screen.getByText('清除店家（測試）'))
    await wait(() => expect(document.querySelector('table')).toBeNull())
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastVariables(calls).merchantId).toEqual([]))
    await settle()
    expect(document.querySelector('table')).toBeNull()
  })

  it('沒選店家時改日期不顯示排行', async () => {
    const { calls, settle } = setup()
    await settle()
    pickQuickDate('昨天')
    await wait(() => expect(lastVariables(calls).endDay).toBe(endOfDay(subDays(new Date(), 1)).getTime()))
    await settle()
    expect(lastVariables(calls).merchantId).toEqual([])
    expect(document.querySelector('table')).toBeNull()
  })

  it('業績依據切實業績、總業績含店販送出對應參數；再按一次已選的不改變', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVariables(calls).reference).toBe('TRUTH'))
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    fireEvent.click(screen.getByText('含店販'))
    await wait(() => expect(lastVariables(calls).isIncludeProductPerformance).toBe(true))
    await settle()
    fireEvent.click(screen.getByText('含店販'))
    await settle()
    expect(lastVariables(calls)).toMatchObject({ reference: 'TRUTH', isIncludeProductPerformance: true })
    expect(headerTexts()).toContain('服務總業績(實)')
    // 未啟用會員卡且沒有會員卡業績時不顯示「含會員卡」
    expect(screen.queryByText('含會員卡')).toBeNull()
  })

  it('店家啟用會員卡時可切換總業績含會員卡；再按一次不改變', async () => {
    const { calls, settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    fireEvent.click(screen.getByText('含會員卡'))
    await wait(() => expect(lastVariables(calls).isIncludeMembershipPerformance).toBe(true))
    await settle()
    fireEvent.click(screen.getByText('含會員卡'))
    await settle()
    expect(lastVariables(calls).isIncludeMembershipPerformance).toBe(true)
  })

  it('店家未啟用但區間有會員卡業績時也可切換含會員卡', async () => {
    const { calls, settle } = setup({ FETCH_DESIGNERS_LEADERBOARD: leaderboard([{ ...MING, membershipTotal: 300 }]) })
    await settle()
    await wait(() => expect(screen.getByText('含會員卡')).toBeInTheDocument())
    fireEvent.click(screen.getByText('含會員卡'))
    await wait(() => expect(lastVariables(calls).isIncludeMembershipPerformance).toBe(true))
  })

  it('店家設定隱藏虛實切換鈕時不顯示業績依據', async () => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } })
    await settle()
    expect(screen.queryByText('實業績')).toBeNull()
  })
})

describe('設計師排行榜：表格與匯出', () => {
  it('預設欄位、名次、四捨五入、卡券販賣＝指定＋不指定、合計列', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(headerTexts(table())).toEqual([
      '展開', '名次', '設計師', '所屬店家', '總業績', '服務總業績(虛)', '服務業績(指)(虛)', '服務業績(不指)(虛)',
      '卡券使用業績(虛)', '卡券販賣(入業績)(虛)', '店販業績(虛)', '互助使用(點數/金額)',
    ])
    expect(rowCells('小美', table())).toEqual(['', '1', '小美', '總店', '11,501', '10,000', '6,000', '4,000', '1,001', '301', '500', '3/101'])
    expect(rowCells('阿明', table())).toEqual(['', '2', '阿明', '分店', '6,000', '5,000', '6,000', '4,000', '1,001', '301', '500', '3/101'])
    // 卡券販賣合計＝round(400.6)＋round(200.6)＝401＋201；互助點數 6.8→7、金額 201.2→201
    expect(rowCells('合計', table())).toEqual(['', '合計', '', '', '17,501', '15,000', '12,001', '8,000', '2,001', '602', '1,001', '7/201'])
  })

  it('跨店合併的設計師可展開各店明細、再收合', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    expect(screen.getAllByRole('button', { name: '展開明細' })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    const detail = document.querySelector('.multiMerchantsLeaderBoardCollapse')
    expect(headerTexts(detail)[0]).toBe('所屬店家')
    expect(within(detail).getAllByRole('row').slice(1).map(r => r.querySelector('td').textContent)).toEqual(['總店', '分店'])
    expect(detail.closest('td')).toHaveAttribute('colspan', '12')
    expect(Array.from(within(detail).getAllByRole('row')[2].querySelectorAll('td')).map(td => td.textContent)).toEqual([
      '分店', '11,501', '2,000', '6,000', '4,000', '1,001', '301', '500', '3/101',
    ])
    fireEvent.click(screen.getByRole('button', { name: '收合明細' }))
    expect(document.querySelector('.multiMerchantsLeaderBoardCollapse')).toBeNull()
  })

  it('匯出（虛業績）：每人一列＋合計，依設定刪去月平均、預估值、客次數、會員卡欄', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    await wait(() => expect(csvRows()).toHaveLength(3))
    expect(csvRows()[0]).toEqual({
      設計師: '小美',
      所屬店家: '總店',
      總業績: 11501,
      '服務總業績(虛)': 10000,
      '服務業績(指)(虛)': 6000,
      '服務業績(不指)(虛)': 4000,
      '卡券使用業績(虛)': 1001,
      '卡券販賣(入業績)(虛)': 301,
      '店販業績 (虛)': 500,
      '互助使用(點數)/互助使用(金額)': '3/101',
    })
    expect(csvRows()[2]).toEqual({
      設計師: '合計',
      所屬店家: '',
      總業績: 17501,
      '服務總業績(虛)': 15000,
      '服務業績(指)(虛)': 12001,
      '服務業績(不指)(虛)': 8000,
      '卡券使用業績(虛)': 2001,
      '卡券販賣(入業績)(虛)': 602,
      '店販業績 (虛)': 1001,
      '互助使用(點數)/互助使用(金額)': '7/201',
    })
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '設計師排行榜.csv')
  })

  it('全部欄位：月平均、年預估值、客次數、會員卡（實業績）；合計的月平均用後端合計；匯出含對應欄', async () => {
    const { calls, settle } = setup({
      GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: { getMonthlyAverageDisplayForDesignerLeaderBoard: true },
      GET_DRR_DATA_DISPLAY: { getParameterReportSetting: { isDRROCDisplay: true, isDRRPEVDisplay: true } },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
    })
    await settle()
    await search(calls, settle)
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(headerTexts(table())).toContain('會員卡業績(實)'))
    await settle()
    expect(headerTexts(table())).toEqual([
      '展開', '名次', '設計師', '所屬店家', '總業績', '服務業績月平均', '業績年預估值', '服務總業績(實)', '服務業績(指)(實)', '服務業績(不指)(實)',
      '卡券使用業績(實)', '卡券販賣(入業績)(實)', '店販業績(實)', '會員卡業績(實)', '互助使用(點數/金額)', '客次數',
    ])
    expect(rowCells('阿明', table())).toEqual(['', '2', '阿明', '分店', '6,000', '9,000', '120,000', '5,000', '6,000', '4,000', '1,001', '301', '500', '0', '3/101', '12'])
    expect(rowCells('合計', table()).slice(4, 7)).toEqual(['17,501', '15,001', '240,001'])
    expect(rowCells('合計', table()).slice(-1)).toEqual(['24'])
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    expect(within(document.querySelector('.multiMerchantsLeaderBoardCollapse')).getAllByRole('row')[1].lastChild.textContent).toBe('12')
    await wait(() => expect(csvRows()[0]).toHaveProperty('會員卡業績(實)', 0))
    expect(csvRows()[0]).toMatchObject({ 服務業績月平均: 9000, 業績預估值: 120000, 客次數: 12, '服務業績(指)(實)': 6000 })
    // 已知缺口（待 Jason 決定）：表格合計的月平均用後端的 monthlyAveragePerformanceTotal（15,001），匯出合計則是各列加總（18001）
    expect(csvRows()[2]).toMatchObject({ 服務業績月平均: 18001, 業績預估值: 240001, 客次數: 24, '會員卡業績(實)': 0 })
  })

  it('指定／不指定切換為不顯示：表格與匯出都不含指定、不指定欄；再按一次不改變', async () => {
    const { calls, settle } = setup()
    await settle()
    await search(calls, settle)
    fireEvent.click(screen.getByText('不顯示'))
    await wait(() => expect(headerTexts(table())).not.toContain('服務業績(指)(虛)'))
    fireEvent.click(screen.getByText('不顯示'))
    expect(headerTexts(table())).not.toContain('服務業績(不指)(虛)')
    fireEvent.click(screen.getByRole('button', { name: '展開明細' }))
    const detail = document.querySelector('.multiMerchantsLeaderBoardCollapse')
    expect(Array.from(within(detail).getAllByRole('row')[1].querySelectorAll('td')).map(td => td.textContent)).toEqual([
      '總店', '11,501', '8,000', '1,001', '301', '500', '3/101',
    ])
    await wait(() => expect(csvRows()[0]).not.toHaveProperty('服務業績(指)(虛)'))
    expect(csvRows()[0]).not.toHaveProperty('服務業績(不指)(虛)')
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(csvRows()[0]).toHaveProperty('服務總業績(實)'))
    expect(csvRows()[0]).not.toHaveProperty('服務業績(指)(實)')
  })

  it('沒有跨店資料時不顯示展開欄', async () => {
    const { calls, settle } = setup({ FETCH_DESIGNERS_LEADERBOARD: leaderboard([MING]) })
    await settle()
    await search(calls, settle)
    expect(headerTexts(table())[0]).toBe('名次')
    expect(rowCells('合計', table())[0]).toBe('合計')
  })

  it('列印呼叫瀏覽器列印；排行、報表設定查詢失敗時不整頁錯誤', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    cleanup()
    const failed = setup({ FETCH_DESIGNERS_LEADERBOARD: new Error('查詢失敗'), GET_DRR_DATA_DISPLAY: new Error('查詢失敗') })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    fireEvent.click(screen.getByText('搜尋'))
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
