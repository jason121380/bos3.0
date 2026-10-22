// 保護「設計師抽成報表」：
// - 進頁查本月 1 日到現在（台灣時間）；快速選擇改查新區間
// - 每位設計師一張卡（列印範本 printCard，不改，只驗證內容）：標題「代號 暱稱 姓名」；服務＋卡券的各項業績、扣項、抽成以四捨五入後相加；
//   店販抽成＝依成本＋固定＋售價三種抽成；總應領薪資
// - 會員卡區塊：店家啟用會員卡，或該設計師會員卡業績／手續費／實業績／抽成任一不為 0 時才顯示
// - 沒有資料顯示「無資料」；查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import DesignerRakeReport from '..'

jest.setTimeout(20000)

const ZERO_MEMBERSHIP = {
  membershipPerformanceFakeTotal: 0,
  membershipThirdPartHandlingFeeOnSales: 0,
  membershipPerformanceTruthTotal: 0,
  membershipRakeByCost: 0,
  membershipRakeByFixed: 0,
  membershipRakeByPrice: 0,
  membershipThirdPartHandlingFeeOnSalary: 0,
}
const analytics = (extra = {}) => ({
  servicePerformanceFakeTotal: 10000.4,
  ticketUsagePerformanceFakeTotal: 2000.4,
  serviceThirdPartHandlingFeeOnSales: 100.4,
  ticketThirdPartHandlingFeeOnSales: 20.4,
  servicePerformanceDecountItem: 50,
  ticketPerformanceDecountItem: 5,
  truthPerformanceWithoutHelper: 11800,
  servicePerformanceDesignateTruthTotalBeforeHelperDecount: 6000,
  ticketDesignateTruthBeforeHelperDecount: 1000,
  servicePerformanceNonDesignateTruthTotalBeforeHelperDecount: 4000,
  ticketNonDesignateTruthBeforeHelperDecount: 800,
  servicePerformanceDecountHelperUsagePrice: 300,
  ticketPerformanceDecountHelperUsage: 30,
  servicePerformanceTruthTotal: 9700,
  ticketUsagePerformanceTruthTotal: 1770,
  servicePerformanceDesignateTruthTotal: 5800,
  ticketUsagePerformanceDesignateTruthTotal: 970,
  servicePerformanceNonDesignateTruthTotal: 3900,
  ticketUsagePerformanceNonDesignateTruthTotal: 800,
  servicePerformanceRake: 3880,
  ticketPerformanceRake: 708,
  servicePerformanceDesignateRake: 2320,
  ticketPerformanceDesignateRake: 388,
  servicePerformanceNonDesignateRake: 1560,
  ticketPerformanceNonDesignateRake: 320,
  specialRake: 150.6,
  serviceThirdPartHandlingFeeOnSalary: 10,
  ticketThirdPartHandlingFeeOnSalary: 2,
  serviceSalaryDecountItem: 40,
  ticketSalaryDecountItem: 4,
  serviceSalaryDecountHelperUsagePrice: 60.3,
  ticketSalaryDecountHelperUsagePrice: 6.3,
  serviceSalaryShouldBePaid: 3700.2,
  ticketSalaryShouldBePaid: 690.4,
  productPerformanceFakeTotal: 5000,
  productThirdPartHandlingFeeOnSales: 50,
  productPerformanceTruthTotal: 4950,
  productRakeByCost: 100.2,
  productRakeByFixed: 200.2,
  productRakeByPrice: 195.2,
  productThirdPartHandlingFeeOnSalary: 5,
  helperRetrievePriceNoPoint: 800,
  helperRetrievePoint: 12.4,
  helperRetrievePriceOnlyPoint: 124,
  helperPointPaid: 3,
  helperPricePaid: 30,
  walletDepositHandlingFeeByDesigner: 25,
  totalSalaryShouldBePaid: 30000.5,
  ...ZERO_MEMBERSHIP,
  ...extra,
})
const designer = (id, user = {}, extra = {}) => ({
  user: { id, name: `設計師${id}`, nickName: '', designerNo: '', ...user },
  salesAnalytics: analytics(extra),
})
const REPORT = [designer('d1', { name: '王小美', nickName: 'Amy', designerNo: 'A01' }), designer('d2')]

const setup = (extra = {}) =>
  renderPage(<DesignerRakeReport />, {
    route: '/designer-rake-report',
    fixtures: {
      FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: REPORT },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      ...extra,
    },
  })
const card = title => screen.getByText(title).closest('.printCard')
const value = (cardEl, label, index = 0) => within(cardEl).getAllByText(label)[index].closest('tr').querySelectorAll('td')[1].textContent

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師抽成報表', () => {
  it('進頁查本月 1 日到現在；快速選擇昨天改查昨天整天', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const { input } = callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')[0].variables
    expect(input.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(input.endDate).toBeGreaterThanOrEqual(before)
    pickQuickDate('昨天')
    await wait(() => {
      const list = callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')
      expect(list[list.length - 1].variables.input).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    })
  })

  it('卡片標題與各項金額（服務＋卡券四捨五入後相加）；未啟用會員卡且皆為 0 時不顯示會員卡', async () => {
    const { settle } = setup()
    await settle()
    const amy = card('A01 Amy 王小美')
    expect(screen.getByText('設計師d2', { exact: false }).textContent.trim()).toBe('設計師d2')
    expect(value(amy, '服務虛業績')).toBe('12001') // round(10000.4 + 2000.4)
    expect(value(amy, '扣業績 - 付款手續費', 0)).toBe('120') // 100 + 20
    expect(value(amy, '扣業績 - 扣項')).toBe('55')
    expect(value(amy, '服務實業績')).toBe('11800')
    expect(value(amy, '實業績 - 指定')).toBe('7000')
    expect(value(amy, '實業績 - 不指定')).toBe('4800')
    expect(value(amy, '扣業績 - 使用互助')).toBe('330')
    expect(value(amy, '服務實業績 扣使用互助')).toBe('11470')
    expect(value(amy, '指定(實) - 扣互助')).toBe('6770')
    expect(value(amy, '不指定(實) - 扣互助')).toBe('4700')
    expect(value(amy, '服務換算抽成')).toBe('4588')
    expect(value(amy, '指定抽成')).toBe('2708')
    expect(value(amy, '不指定抽成')).toBe('1880')
    expect(value(amy, '特殊抽成')).toBe('151')
    expect(value(amy, '扣薪水 - 付款手續費', 0)).toBe('12')
    expect(value(amy, '扣薪水 - 扣項')).toBe('44')
    expect(value(amy, '扣薪水 - 使用互助')).toBe('67') // round(60.3 + 6.3)
    expect(value(amy, '服務應領金額')).toBe('4391') // round(3700.2 + 690.4)
    expect(value(amy, '店販業績')).toBe('5000')
    expect(value(amy, '扣業績 - 付款手續費', 1)).toBe('50')
    expect(value(amy, '店販業績 扣手續費')).toBe('4950')
    expect(value(amy, '店販抽成')).toBe('496') // round(100.2 + 200.2 + 195.2)
    expect(value(amy, '扣薪水 - 付款手續費', 1)).toBe('5')
    expect(value(amy, '互助獲得 - 金額')).toBe('800')
    expect(value(amy, '互助獲得 - 點數/換算金額')).toBe('12/124')
    expect(value(amy, '互助使用 - 點數')).toBe('3')
    expect(value(amy, '互助使用 - 金額')).toBe('30')
    expect(value(amy, '扣入金手續費')).toBe('25')
    expect(value(amy, '總應領薪資')).toBe('30001')
    expect(within(amy).queryByText('會員卡業績')).toBeNull()
  })

  it('會員卡區塊：任一會員卡數字不為 0 的設計師才顯示；啟用會員卡時全部顯示', async () => {
    const report = [
      designer('m1', {}, { membershipPerformanceFakeTotal: 1000.4 }),
      designer('m2', {}, { membershipThirdPartHandlingFeeOnSales: 12 }),
      designer('m3', {}, { membershipPerformanceTruthTotal: 900 }),
      designer('m4', {}, { membershipRakeByCost: 10, membershipRakeByFixed: 20.3, membershipRakeByPrice: 30.3, membershipThirdPartHandlingFeeOnSalary: 3 }),
      designer('m5'),
    ]
    const { settle } = setup({ FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: report } })
    await settle()
    expect(value(card('設計師m1'), '會員卡業績')).toBe('1000')
    expect(value(card('設計師m2'), '扣業績 - 付款手續費', 2)).toBe('12')
    expect(value(card('設計師m3'), '會員卡業績 扣手續費')).toBe('900')
    expect(value(card('設計師m4'), '會員卡抽成')).toBe('61')
    expect(value(card('設計師m4'), '扣薪水 - 付款手續費', 2)).toBe('3')
    expect(within(card('設計師m5')).queryByText('會員卡業績')).toBeNull()
    cleanup()
    const active = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true }, FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: [designer('m5')] } })
    await active.settle()
    await wait(() => expect(within(card('設計師m5')).getByText('會員卡業績')).toBeInTheDocument())
  })

  it('沒有資料顯示無資料；查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup({ FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const failed = setup({ FETCH_DESIGNER_RAKE_REPORT: new Error('查詢失敗') })
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull()
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('.printCard')).toBeNull()
  })
})
