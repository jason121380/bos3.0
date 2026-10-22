// 保護「設計師業績表」：
// - 進頁查今天 00:00～23:59:59.999（台灣時間）、虛業績；切實業績送 TRUTH（店家隱藏切換鈕時不顯示）；快速選擇改查新區間
// - 表頭依服務類別（每類「業績、人數」兩欄）；每位設計師兩列（本人、指定），合計列（全部、指定、不指定）、指定率％列、男／女／未知客列
// - 所有數字四捨五入到整數（null 保留空白）；業績客單價＝業績÷客數四捨五入，客數為 0 時顯示 0（不可顯示 Infinity）
// - 排序依「業績」時設計師依總業績高到低；依「代號」時維持後端順序；再按一次已選的排序鈕不改變
// - 會員卡欄：店家啟用會員卡，或合計列有會員卡業績時顯示
// - 報表匯出：以目前日期、業績類型、排序查詢後端 Excel，取得網址後開啟下載
// - 沒有資料顯示「無資料」；查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不產生真的檔案。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { headerTexts, spyAnchorClicks } from '../../__tests__/staffReportKit.test'
import DesignerPerformanceReport from '..'

jest.setTimeout(20000)

const category = (categoryName, extra = {}) => ({
  categoryName,
  servicePerformance: 1000.4,
  designateServicePerformance: 600.4,
  nonDesignateServicePerformance: 400,
  servicePerformanceCount: 2,
  designateCount: 1,
  nonDesignateCount: 1,
  ...extra,
})
const entry = (designerName, extra = {}) => ({
  designerName,
  serviceCategory: [category('剪髮'), category('染髮', { servicePerformance: 2000.6 })],
  totalCustomer: 4,
  totalDesignateCustomer: 2,
  totalNonDesignateCustomer: 2,
  performance: 3001,
  designatePerformance: 1200.6,
  nonDesignatePerformance: 1800.4,
  totalPerformance: 3500.5,
  designateTotalPerformance: 1500,
  nonDesignateTotalPerformance: 2000.5,
  productPerformance: 499.5,
  designateProductPerformance: 299.5,
  nonDesignateProductPerformance: 200,
  membershipPerformance: 0,
  designateMembershipPerformance: 0,
  nonDesignateMembershipPerformance: 0,
  totalPerformanceCustomerUnit: 875.1,
  designateTotalPerformanceCustomerUnit: 750,
  nonDesignateTotalPerformanceCustomerUnit: 1000.2,
  performanceDay: 1,
  designatePerformanceDay: 1,
  ...extra,
})
const report = (extra = {}) => ({
  designerPerformance: [
    {
      designerPerformanceData: [
        entry('A01 小美', { totalPerformance: 1000 }),
        entry('A02 阿明', { totalPerformance: 9000, totalDesignateCustomer: 0, designatePerformance: 500, performanceDay: null }),
      ],
      designerPerformanceSum: [entry('合計')],
      designerPerformancePercented: [entry('指定率', { serviceCategory: [category('剪髮', { designateCount: 50 }), category('染髮', { designateCount: null })], totalDesignateCustomer: 50 })],
      designerPerformanceMale: [entry('男客', { totalCustomer: 0, performance: 0 })],
      designerPerformanceFemale: [entry('女客', { performanceDay: null })],
      designerPerformanceUnknown: [entry('未知')],
      ...extra,
    },
  ],
})
const setup = (extra = {}, options = {}) =>
  renderPage(<DesignerPerformanceReport />, {
    route: '/designer-performance-report',
    fixtures: {
      GET_DESIGNER_PERFORMANCE: report(),
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      GET_DESIGNER_PERFORMANCE_EXCEL: { designerPerformanceExcel: 'https://files.example/designer.xlsx' },
      ...extra,
    },
    ...options,
  })
const lastInput = calls => {
  const list = callsOf(calls, 'GET_DESIGNER_PERFORMANCE')
  return list[list.length - 1].variables.input
}
const rows = () => Array.from(document.querySelectorAll('tbody tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
const rowOf = name => rows().find(r => r[0] === name)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師業績表：查詢條件與匯出', () => {
  it('進頁查今天、虛業績；切實業績送 TRUTH，再按一次不改變；快速選擇本月改查本月', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_DESIGNER_PERFORMANCE')[0].variables.input).toEqual({
      date: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      performanceReference: 'FAKE',
    })
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastInput(calls).performanceReference).toBe('TRUTH'))
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await settle()
    expect(lastInput(calls).performanceReference).toBe('TRUTH')
    pickQuickDate('本月')
    await wait(() =>
      expect(lastInput(calls).date).toEqual({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() })
    )
  })

  it('店家設定隱藏虛實切換鈕時不顯示業績類型', async () => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } })
    await settle()
    expect(screen.queryByText('業績類型')).toBeNull()
  })

  it('報表匯出：以目前日期、業績類型、排序查詢後端 Excel，取得網址後開啟下載', async () => {
    const clicks = spyAnchorClicks()
    try {
      const { calls, settle } = setup()
      await settle()
      fireEvent.click(screen.getByText('業績', { selector: 'button' }))
      await settle()
      fireEvent.click(screen.getByText('報表匯出'))
      await wait(() => expect(clicks.hrefs).toEqual(['https://files.example/designer.xlsx']))
      expect(callsOf(calls, 'GET_DESIGNER_PERFORMANCE_EXCEL')[0].variables.input).toEqual({
        date: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
        performanceReference: 'FAKE',
        sortType: 'PERFORMANCE',
      })
    } finally {
      clicks.restore()
    }
  })

  it('匯出查詢失敗時不開啟下載', async () => {
    const clicks = spyAnchorClicks()
    try {
      const { calls, settle } = setup({ GET_DESIGNER_PERFORMANCE_EXCEL: new Error('匯出失敗') })
      await settle()
      fireEvent.click(screen.getByText('報表匯出'))
      await wait(() => expect(callsOf(calls, 'GET_DESIGNER_PERFORMANCE_EXCEL')).toHaveLength(1))
      await settle()
      expect(clicks.hrefs).toEqual([])
    } finally {
      clicks.restore()
    }
  })
})

describe('設計師業績表：表格', () => {
  it('表頭依服務類別；設計師兩列與合計、指定率、男女未知列；數字四捨五入、客數為 0 時客單價為 0', async () => {
    const { settle } = setup()
    await settle()
    expect(headerTexts()).toEqual(['設計師', '剪髮', '人數', '染髮', '人數', '業績', '業績客單價', '店販', '總業績', '天數', '總客數', '總客單價'])
    expect(rowOf('A01 小美')).toEqual(['A01 小美', '1,000', '2', '2,001', '2', '3,001', '750', '500', '1,000', '1', '4', '875'])
    const amyRows = rows()
    const designate = amyRows[amyRows.findIndex(r => r[0] === 'A01 小美') + 1]
    expect(designate).toEqual(['指定', '600', '1', '600', '1', '1,201', '601', '300', '1,500', '1', '2', '750'])
    // 阿明指定客數 0、指定業績 500：客單價顯示 0（不可顯示 Infinity）
    const ming = amyRows[amyRows.findIndex(r => r[0] === 'A02 阿明') + 1]
    expect(ming[6]).toBe('0')
    // 後端回 null 的欄位不四捨五入成 0，保留空白
    expect(rowOf('A02 阿明')[9]).toBe('')
    expect(rowOf('合計')).toEqual(['合計', '1,000', '2', '2,001', '2', '3,001', '750', '500', '3,501', '1', '4', '875'])
    const nonDesignate = rowOf('不指定')
    expect(nonDesignate).toEqual(['不指定', '400', '1', '400', '1', '1,800', '900', '200', '2,001', '', '2', '1,000'])
    expect(rowOf('指定率')).toEqual(['指定率', '', '50%', '', '', '', '', '', '', '', '50%', ''])
    // 男客：客數 0、業績 0 → 客單價 0
    expect(rowOf('男客')[6]).toBe('0')
    expect(rowOf('女客')[9]).toBe('')
    expect(rowOf('未知')[0]).toBe('未知')
  })

  it('排序依業績時設計師依總業績高到低；依代號維持後端順序；再按一次已選的排序鈕不改變', async () => {
    const { settle } = setup()
    await settle()
    const names = () => rows().map(r => r[0]).filter(n => n.startsWith('A0'))
    expect(names()).toEqual(['A01 小美', 'A02 阿明'])
    fireEvent.click(screen.getByText('業績', { selector: 'button' }))
    await wait(() => expect(names()).toEqual(['A02 阿明', 'A01 小美']))
    fireEvent.click(screen.getByText('業績', { selector: 'button' }))
    expect(names()).toEqual(['A02 阿明', 'A01 小美'])
    fireEvent.click(screen.getByText('代號', { selector: 'button' }))
    await wait(() => expect(names()).toEqual(['A01 小美', 'A02 阿明']))
  })

  it('合計列有會員卡業績時顯示會員卡欄（各列）', async () => {
    const { settle } = setup({ GET_DESIGNER_PERFORMANCE: report({ designerPerformanceSum: [entry('合計', { membershipPerformance: 300.4, designateMembershipPerformance: 100, nonDesignateMembershipPerformance: 200.4 })] }) })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡'))
    expect(rowOf('合計')[8]).toBe('300')
    expect(rowOf('不指定')[8]).toBe('200')
    expect(rowOf('指定率')).toHaveLength(13)
    expect(rowOf('A01 小美')[8]).toBe('0')
  })

  it('店家啟用會員卡時顯示會員卡欄', async () => {
    const { settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡'))
  })

  it('沒有資料顯示無資料；載入中列印停用並顯示骨架；查詢失敗時不整頁錯誤', async () => {
    window.print = jest.fn()
    const { settle } = setup({ GET_DESIGNER_PERFORMANCE: { designerPerformance: [] } }, { delays: { GET_DESIGNER_PERFORMANCE: 30 } })
    expect(screen.getByText('列印').closest('button')).toBeDisabled()
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull()
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    cleanup()
    const failed = setup({ GET_DESIGNER_PERFORMANCE: new Error('查詢失敗') })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})
