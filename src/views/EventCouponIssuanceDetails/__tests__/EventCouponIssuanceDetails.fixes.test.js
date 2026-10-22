// 修正（Jason 2026/10/22 長期授權）：
// ① 報表匯出含顧客姓名與手機，原本一律匯出完整資料；改為經 helper/exportCustomerMask：只有「遮罩設定查詢成功且為 false」才匯出完整資料，
//    設定為 true、載入中或查詢失敗一律遮罩（姓名、手機遮罩格式與帳單列表匯出相同）。
// ② 在第 N 頁時換日期區間，原本沿用第 N 頁查新區間（可能整頁空白）；改為換區間時回到第一頁。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import EventCouponIssuanceDetails from '..'

jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ dateChange }) => (
    <button type="button" onClick={() => dateChange({ startDate: 1000, endDate: 2000 })}>
      換日期（測試）
    </button>
  ),
}))
jest.mock('components/MainEventAutocomplete', () => ({ __esModule: true, default: () => null }))
jest.mock('react-csv', () => ({
  CSVLink: ({ data, children }) => (
    <a data-testid="csv" data-rows={JSON.stringify(data)} href="#csv">
      {children}
    </a>
  ),
}))
jest.setTimeout(20000)

const TW_1022 = Date.UTC(2026, 9, 21, 16, 30)
const RECORDS = [
  {
    number: 'V0001', eventName: '周年慶', ruleName: '滿千送券', orderDate: TW_1022, orderNo: 123, orderId: 'o1',
    customerName: '陳小美', customerCellphone: '0911222333', isCustomerSideUsing: true, isSMSSended: false,
  },
  {
    number: 'V0002', eventName: '周年慶', ruleName: '滿千送券', orderDate: TW_1022, orderNo: 124, orderId: 'o2',
    customerName: '歐陽娜娜', customerCellphone: '0922333444', isCustomerSideUsing: false, isSMSSended: true,
  },
  // 兩個字的姓名、沒有手機；沒有姓名
  { number: 'V0003', eventName: '周年慶', ruleName: '滿千送券', orderDate: TW_1022, orderNo: 125, orderId: 'o3', customerName: '王五', customerCellphone: null },
  { number: 'V0004', eventName: '周年慶', ruleName: '滿千送券', orderDate: TW_1022, orderNo: 126, orderId: 'o4', customerName: null, customerCellphone: '0933' },
]
const voucher = v => ({
  voucherIssuanceRecord: { data: RECORDS, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, totalCount: 120 },
})
const setup = (fixtures = {}, options = {}) =>
  renderPage(<EventCouponIssuanceDetails />, { fixtures: { FETCH_GET_VOUCHER_ISSUANCE_RECORD: voucher, ...fixtures }, ...options })
const exported = async settle => {
  await settle()
  fireEvent.click(screen.getByText('篩選'))
  return JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('活動發券明細匯出遮罩', () => {
  it('遮罩設定為 false 時匯出完整姓名與手機', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    const rows = await exported(settle)
    expect(rows[0]).toEqual({
      流水號: 'V0001', 活動名稱: '周年慶', 規則名稱: '滿千送券', 帳單日期: '2026/10/22', 帳單編號: '#123',
      顧客姓名: '陳小美', 顧客手機: '0911222333', 使用手機端: '是', 寄送簡訊: '否',
    })
  })

  it.each([
    ['設定為 true', { GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true } }, {}],
    ['設定查詢失敗', {}, { fallback: 'error' }],
  ])('%s時遮罩姓名與手機', async (_, fixtures, options) => {
    const { settle } = setup(fixtures, options)
    const rows = await exported(settle)
    expect(rows.map(r => [r.顧客姓名, r.顧客手機])).toEqual([
      ['陳*美', '0911***333'],
      ['歐陽*娜娜', '0922***444'],
      ['王*', '***'],
      ['*', '0933***'],
    ])
  })
})

describe('活動發券明細分頁', () => {
  it('在第 2 頁換日期區間時回到第一頁查詢', async () => {
    const { calls } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true } })
    await screen.findByText('共 120 筆資料')
    fireEvent.click(screen.getByLabelText('下一頁'))
    const inputs = () => callsOf(calls, 'FETCH_GET_VOUCHER_ISSUANCE_RECORD').map(c => c.variables.input)
    await wait(() => expect(inputs()[inputs().length - 1].pageOffset).toBe(1))
    await screen.findByText('共 120 筆資料')
    fireEvent.click(screen.getByText('換日期（測試）'))
    await wait(() =>
      expect(inputs()[inputs().length - 1]).toEqual(expect.objectContaining({ startDate: 1000, endDate: 2000, pageOffset: 0 }))
    )
    // 不會先以第 2 頁查一次新區間
    expect(inputs().filter(i => i.startDate === 1000 && i.pageOffset === 1)).toHaveLength(0)
  })
})
