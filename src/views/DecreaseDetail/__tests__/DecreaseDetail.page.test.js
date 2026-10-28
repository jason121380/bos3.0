// 保護「互助點數明細」：進頁以本月 1 日到今天結束（台灣時間）查詢；選互助人送出 designerId；
// 篩選被互助的設計師時，列表、合計（金額、點數）與匯出只算該設計師的紀錄，清除後回到全部；
// 互助扣項方式文字、點數顯示（小數截短但不可把整數位數截掉）、匯出的日期以台灣時間；沒有資料顯示「無資料」、查詢失敗不白屏。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { endOfDay, startOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { clearCombo, comboOptions, exportedCsv, inputsByLabel, pickOption } from '../../__tests__/stockKit.test'
import DecreaseDetail from '..'

jest.setTimeout(30000)

const DATE = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const DESIGNERS = [
  { userId: 'd-1', userName: '王小美', userNickName: 'Amy', userNo: '01' },
  { userId: 'd-2', userName: '陳大文', userNickName: '', userNo: '02' },
]
const record = overrides => ({
  date: DATE,
  orderNo: 'A001',
  orderId: 'o-1',
  helperPoint: 1.5,
  helperFee: 100,
  helperFeeNoPoint: 0,
  helperFeeOnlyPoint: 0,
  service: { id: 's-1', name: '洗髮', helperDeductionSetting: [] },
  designer: { id: 'd-1', name: '王小美', designerNo: '01', nickName: 'Amy', nameForReport: '' },
  helper: { id: 'h-1', name: '李助理', nickName: '', designerNo: '03', deductionWay: '' },
  helperDeductionType: 'onSales',
  helperType: '洗髮',
  helperMoneyGivenWay: '固定',
  ...overrides,
})
const RECORDS = [
  record({}),
  record({ orderNo: 'A002', helperFee: 200, helperPoint: 0.3333, helperDeductionType: 'onSalary' }),
  record({
    orderNo: 'A003',
    helperFee: 50,
    helperPoint: 2,
    helperDeductionType: 'none',
    designer: { id: 'd-2', name: '陳大文', designerNo: '02', nickName: '', nameForReport: '' },
  }),
]

const renderReport = overrides =>
  renderPage(<DecreaseDetail />, {
    fixtures: {
      GET_USERS_ORDERABLE_LIST: { getUserOrderableList: DESIGNERS },
      GET_USER_HELPER_RETRIEVE: { getUserHelperRetrieve: { helperRecord: RECORDS, summary: 350, pointSummary: 12345.678 } },
      ...overrides,
    },
  })

const orderNos = () =>
  screen
    .getAllByRole('row')
    .slice(1, -1)
    .map(r => r.querySelectorAll('td')[1].textContent)
const totalRow = () => Array.from(screen.getAllByRole('row').slice(-1)[0].querySelectorAll('td')).map(td => td.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('互助點數明細', () => {
  it('以本月到今天（台灣時間）查詢；列表與扣項方式；合計點數不可截掉整數位數', async () => {
    const { settle, calls } = renderReport()
    await settle()
    const now = new Date()
    expect(callsOf(calls, 'GET_USER_HELPER_RETRIEVE')[0].variables.input).toEqual({
      startDate: startOfMonth(now).getTime(),
      endDate: endOfDay(now).getTime(),
      designerId: '',
      serviceId: '',
    })
    expect(screen.getByText('3 筆資料')).toBeInTheDocument()
    expect(orderNos()).toEqual(['#A001', '#A002', '#A003'])
    const first = screen.getByText('#A001').closest('tr')
    expect(within(first).getByText('2026/10/21')).toBeInTheDocument()
    expect(within(first).getByText('依業績')).toBeInTheDocument()
    expect(within(screen.getByText('#A002').closest('tr')).getByText('依薪水')).toBeInTheDocument()
    expect(within(screen.getByText('#A002').closest('tr')).getByText('0.33')).toBeInTheDocument()
    expect(within(screen.getByText('#A003').closest('tr')).getByText('無扣項')).toBeInTheDocument()
    // 合計：350 元、點數 12345.678 → 顯示 12,345（原本截成 1234）
    expect(totalRow()[5]).toBe('350')
    expect(totalRow()[6]).toBe('12,345')
  })

  it('匯出：全部紀錄與合計', async () => {
    const { settle } = renderReport()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"2026/10/21","#A001","洗髮(洗髮)","王小美","李助理","100(固定)","1.5","依業績"')
    expect(csv).toContain('"#A002"')
    expect(csv).toContain('"合計","","","","","350","12345.678",""')
  })

  it('選互助人：以該互助人 id 重查', async () => {
    const { settle, calls } = renderReport()
    await settle()
    pickOption('互助人編號/姓名', 'Amy-01')
    await settle()
    const list = callsOf(calls, 'GET_USER_HELPER_RETRIEVE')
    expect(list[list.length - 1].variables.input.designerId).toBe('d-1')
  })

  it('選服務：以該服務 id 重查', async () => {
    const { settle, calls } = renderReport({
      GET_SERVICES_FOR_AUTOCOMPLETE: { services: { data: [{ id: 's-1', no: 'S1', name: '洗髮', price: 300 }] } },
    })
    await settle()
    const input = inputsByLabel('服務名稱/代號')[0]
    fireEvent.focusIn(input)
    fireEvent.click(input)
    fireEvent.click(comboOptions()[0])
    await settle()
    const list = callsOf(calls, 'GET_USER_HELPER_RETRIEVE')
    expect(list[list.length - 1].variables.input.serviceId).toBe('s-1')
  })

  it('篩選被互助的設計師：列表、合計與匯出只算該設計師；清除後回到全部', async () => {
    const { settle } = renderReport()
    await settle()
    // 人員、服務、被協助設計師收在「篩選」卡片（STYLE §14，預設收合），先展開
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    pickOption('設計師編號/姓名', 'Amy-01')
    expect(orderNos()).toEqual(['#A001', '#A002'])
    expect(totalRow()[5]).toBe('300')
    expect(totalRow()[6]).toBe('1.83')
    const csv = exportedCsv()
    expect(csv).not.toContain('#A003')
    expect(csv).toContain('"合計","","","","","300","1.8333",""')
    expect(csv).toContain('"#A002","洗髮(洗髮)","王小美","李助理","200(固定)","0.3333","依薪水"')

    pickOption('設計師編號/姓名', '陳大文-02')
    expect(orderNos()).toEqual(['#A003'])
    expect(exportedCsv()).toContain('"無扣項"')

    clearCombo(inputsByLabel('設計師編號/姓名')[0])
    expect(orderNos()).toEqual(['#A001', '#A002', '#A003'])
  })

  it('沒有資料顯示「無資料」；查詢失敗不進錯誤畫面', async () => {
    const { settle } = renderReport({ GET_USER_HELPER_RETRIEVE: { getUserHelperRetrieve: { helperRecord: [], summary: 0, pointSummary: 0 } } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const failed = renderPage(<DecreaseDetail />, { fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('互助點數明細')[0]).toBeInTheDocument()
  })
})
