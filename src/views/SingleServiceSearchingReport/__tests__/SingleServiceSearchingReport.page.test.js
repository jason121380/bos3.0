// 保護「單一服務項目查詢」：
// ① 服務項目選單＝服務＋卡券，有代號顯示「代號 - 名稱」、沒有代號（空白或 null）只顯示名稱
//    （已修正：原本代號為 null 時 .trim() 整頁拋錯；服務或卡券查詢失敗時 forEach 讀 undefined 整頁拋錯）。
// ② 進頁不查詢；按「搜尋」以台灣時間本月 1 日 00:00～今天 23:59:59.999 與所選服務 id 查詢；選了服務後換日期立即重查，沒選服務換日期不查。
// ③ 報表匯出：送出目前日期、服務與排序依據，回來的網址以連結下載。
// ④ 三種排序（全店／設計師／日期）的表格：虛業績四捨五入到小數 2 位、客次，各組小計與合計列；沒有服務資料顯示「無資料」。
// 日期選擇器以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端；下載連結的 click 以 spy 攔下，不開網址。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import SingleServiceSearchingReport from '..'
import Results from '../Results'

const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ date, dateChange }) => (
    <button type="button" data-start={date.startDate} data-end={date.endDate} onClick={() => dateChange(mockNextDate.value)}>
      換日期（測試）
    </button>
  ),
}))
jest.setTimeout(20000)

const tw = (y, m, d, h = 0, mi = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h - 8, mi, s, ms)
const twToday = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
}
const SERVICES = [
  { id: 's1', no: 'S01', name: '剪髮' },
  { id: 's2', no: '  ', name: '洗髮' },
  { id: 's3', no: null, name: '染髮' },
]
const TICKETS = [
  { id: 't1', no: 'T01', name: '護髮卡' },
  { id: 't2', no: '', name: '頭皮卡' },
  { id: 't3', no: null, name: '體驗卡' },
]
const svc = (serviceId, extra) => ({ serviceId, serviceName: serviceId === 's1' ? '剪髮' : '護髮卡', serviceNo: serviceId === 's1' ? 'S01' : 'T01', ...extra })
const REPORT = {
  serviceIds: ['s1', 't1'],
  all: [
    { date: '2026/10/01', singleServices: [svc('s1', { summary: { performance: 1000.556, orderCount: 2 } }), svc('t1', { summary: { performance: 0, orderCount: 0 } })] },
    { date: '2026/10/02', singleServices: [svc('s1', { summary: { performance: 500.004, orderCount: 1 } }), svc('t1', { summary: { performance: 300, orderCount: 1 } })] },
  ],
  date: [
    {
      date: '2026/10/01',
      designerServices: [
        {
          designerId: 'u1', designerName: '小美', designerNo: 'D1',
          singleServices: [svc('s1', { singleServiceItem: [{ performance: 600.126, orderCount: 1 }] }), svc('t1', { singleServiceItem: [{ performance: 0, orderCount: 0 }] })],
        },
      ],
      summary: { singleServices: [svc('s1', { singleServiceItem: [{ performance: 600.126, orderCount: 1 }] }), svc('t1', { singleServiceItem: [] })] },
    },
    { date: '2026/10/02', designerServices: [], summary: { singleServices: [svc('s1', { singleServiceItem: [] }), svc('t1', { singleServiceItem: [] })] } },
  ],
  designer: [
    {
      designerId: 'u1', designerName: '小美', designerNo: 'D1',
      datePerformances: [
        { date: '2026/10/01', singleServices: [svc('s1', { summary: { performance: 600.126, orderCount: 1 } }), svc('t1', { summary: { performance: 0, orderCount: 0 } })] },
      ],
      summary: [{ serviceId: 's1', serviceName: '剪髮', summary: { performance: 600.126, orderCount: 1 } }, { serviceId: 't1', serviceName: '護髮卡', summary: null }],
    },
    { designerId: 'u2', designerName: '阿明', designerNo: 'D2', datePerformances: [], summary: [] },
  ],
}
const setup = (fixtures = {}) =>
  renderPage(<SingleServiceSearchingReport />, {
    fixtures: {
      GET_SERVICES_FOR_AUTOCOMPLETE: { services: { data: SERVICES } },
      GET_TICKETS: { tickets: TICKETS },
      FETCH_GET_SIMGLE_SERVICE_ITEM_V2: { singleServiceItemV2: REPORT },
      GET_SINGLE_SERVICE_EXCEL_V2: { singleServiceItemExcelV2: 'https://files.example/單一服務.xlsx' },
      ...fixtures,
    },
  })
const searches = calls => callsOf(calls, 'FETCH_GET_SIMGLE_SERVICE_ITEM_V2').map(c => c.variables.input)
const serviceInput = () => screen.getAllByLabelText('服務項目').find(el => el.tagName === 'INPUT')
const openFilters = () => fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
const pickServices = (...labels) => {
  fireEvent.click(serviceInput())
  labels.forEach(label => fireEvent.click(screen.getByRole('option', { name: label })))
}
// 每個服務欄位左右兩半：虛業績｜客次
const cellText = cell => {
  const parts = cell.querySelectorAll(':scope > div > div')
  return cell.tagName === 'TD' && parts.length ? [...parts].map(p => p.textContent).join('|') : cell.textContent
}
const tableRows = () =>
  within(screen.getByRole('table')).getAllByRole('row').map(r => [...r.querySelectorAll('th, td')].map(cellText))

let anchorClick
beforeEach(() => {
  loginAs()
  mockNextDate.value = null
  anchorClick = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  anchorClick.mockRestore()
})

describe('單一服務項目查詢：條件與查詢', () => {
  it('服務項目選單＝服務＋卡券；沒有代號只顯示名稱', async () => {
    const { settle } = setup()
    await settle()
    openFilters()
    fireEvent.click(serviceInput())
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
      'S01 - 剪髮', '洗髮', '染髮', 'T01 - 護髮卡', '頭皮卡', '體驗卡',
    ])
  })

  it('進頁不查；按搜尋以台灣時間本月與所選服務查詢；選了服務後換日期立即重查', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(searches(calls)).toHaveLength(0)
    // 沒選服務時換日期不查
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(searches(calls)).toHaveLength(0)
    mockNextDate.value = null
    cleanup()

    const second = setup()
    await second.settle()
    openFilters()
    pickServices('S01 - 剪髮', 'T01 - 護髮卡')
    await second.settle()
    expect(searches(second.calls)).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await second.settle()
    const [y, m, d] = twToday()
    expect(searches(second.calls)[0]).toEqual({
      dateRange: { startDate: tw(y, m, 1), endDate: tw(y, m, d, 23, 59, 59, 999) },
      serviceIds: ['s1', 't1'],
    })
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await second.settle()
    expect(searches(second.calls).pop()).toEqual({
      dateRange: { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) },
      serviceIds: ['s1', 't1'],
    })
  })

  it('報表匯出送出日期、服務與排序依據，回來的網址以連結下載', async () => {
    const { calls, settle } = setup()
    await settle()
    openFilters()
    pickServices('S01 - 剪髮')
    fireEvent.click(screen.getByRole('button', { name: '設計師' }))
    fireEvent.click(screen.getByRole('button', { name: /報表匯出/ }))
    await settle()
    const [y, m, d] = twToday()
    expect(callsOf(calls, 'GET_SINGLE_SERVICE_EXCEL_V2')[0].variables).toEqual({
      input: { dateRange: { startDate: tw(y, m, 1), endDate: tw(y, m, d, 23, 59, 59, 999) }, serviceIds: ['s1'] },
      sortBy: 'BYDESIGNER',
    })
    expect(anchorClick).toHaveBeenCalledTimes(1)
    expect(anchorClick.mock.instances[0].href).toBe('https://files.example/%E5%96%AE%E4%B8%80%E6%9C%8D%E5%8B%99.xlsx')
  })

  // 已修正：服務或卡券查詢失敗時 data 為 undefined，原本 forEach 讀 undefined 整頁拋錯
  it.each([
    ['服務', { GET_SERVICES_FOR_AUTOCOMPLETE: new Error('壞了') }, ['T01 - 護髮卡', '頭皮卡', '體驗卡']],
    ['卡券', { GET_TICKETS: new Error('壞了') }, ['S01 - 剪髮', '洗髮', '染髮']],
  ])('%s查詢失敗不整頁錯誤，選單只列另一種', async (_, fixtures, expected) => {
    const { settle } = setup(fixtures)
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openFilters()
    fireEvent.click(serviceInput())
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(expected)
  })
})

describe('單一服務項目查詢：表格', () => {
  const searchWith = async () => {
    const utils = setup()
    await utils.settle()
    openFilters()
    pickServices('S01 - 剪髮', 'T01 - 護髮卡')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await utils.settle()
    return utils
  }

  it('搜尋前與沒有服務資料時顯示「無資料」', async () => {
    const { settle } = setup({ FETCH_GET_SIMGLE_SERVICE_ITEM_V2: { singleServiceItemV2: { serviceIds: [] } } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    openFilters()
    pickServices('S01 - 剪髮')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('全店：每日各服務的虛業績｜客次，合計列', async () => {
    await searchWith()
    expect(tableRows()).toEqual([
      ['日期', 'S01 - 剪髮虛業績客次', 'T01 - 護髮卡虛業績客次'],
      ['2026/10/01', '1,000.56|2', '0|0'],
      ['2026/10/02', '500|1', '300|1'],
      ['合計', '1,500.56|3', '300|1'],
    ])
  })

  it('日期：每日各設計師一列、有設計師的日期加小計列（沒有資料的服務顯示 0），合計列', async () => {
    await searchWith()
    fireEvent.click(screen.getByRole('button', { name: '日期' }))
    // 再按一次已選的排序不變
    fireEvent.click(screen.getByRole('button', { name: '日期' }))
    expect(screen.getByRole('button', { name: '日期' })).toHaveAttribute('aria-pressed', 'true')
    expect(tableRows()).toEqual([
      ['日期', '設計師編號', '設計師名稱', 'S01 - 剪髮虛業績客次', 'T01 - 護髮卡虛業績客次'],
      ['2026/10/01', 'D1', '小美', '600.13|1', '0|0'],
      ['2026/10/01', '', '小計', '600.13|1', '0|0'],
      ['合計', '', '', '1,500.56|3', '300|1'],
    ])
  })

  it('設計師：各設計師每日一列、有資料的設計師加小計列（沒有小計的服務顯示 0），合計列', async () => {
    await searchWith()
    fireEvent.click(screen.getByRole('button', { name: '設計師' }))
    expect(tableRows()).toEqual([
      ['日期', '設計師編號', '設計師名稱', 'S01 - 剪髮虛業績客次', 'T01 - 護髮卡虛業績客次'],
      ['2026/10/01', 'D1', '小美', '600.13|1', '0|0'],
      ['', '', '小計', '600.13|1', '0|0'],
      ['合計', '', '', '1,500.56|3', '300|1'],
    ])
  })

  it('合計只加總有該服務的日期', () => {
    const report = { ...REPORT, all: [...REPORT.all, { date: '2026/10/03', singleServices: [svc('s1', { summary: { performance: 1, orderCount: 1 } })] }] }
    renderPage(<Results reportData={report} sort="BYDATE" />)
    expect(tableRows().pop()).toEqual(['合計', '', '', '1,501.56|4', '300|1'])
  })

  it('不認得的排序依據原樣顯示', () => {
    renderPage(<Results reportData={REPORT} sort="UNKNOWN" />)
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
  })

  it('查詢中顯示載入中', async () => {
    const { settle } = renderPage(<SingleServiceSearchingReport />, {
      fixtures: { GET_SERVICES_FOR_AUTOCOMPLETE: { services: { data: SERVICES } }, GET_TICKETS: { tickets: TICKETS } },
      delays: { FETCH_GET_SIMGLE_SERVICE_ITEM_V2: 50 },
    })
    await settle()
    openFilters()
    pickServices('S01 - 剪髮')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
  })
})
