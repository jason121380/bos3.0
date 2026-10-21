// 保護「服務項目設定」：列出服務（代號、分類、名稱、價格千分位）、未設定扣項／互助的服務以「無扣項／無設定」提醒、
// 停用的服務不可勾選；刪除時店家若開啟刪除密碼要先輸入密碼，送出的是勾選的服務 id。
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不刪真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, MERCHANT_ID } from '../../../__tests__/testkit.test'
import Services from '..'

jest.setTimeout(20000)

const service = (overrides = {}) => ({
  id: 's1',
  no: 'S01',
  name: '精緻剪髮',
  price: 1200,
  isUsing: true,
  serviceDeductionCount: 2,
  helperDeductionCount: 1,
  serviceCategory: { id: 'c1', name: '剪髮' },
  helperDeductionSetting: [],
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: false,
  updatedAt: new Date(2026, 9, 1).getTime(),
  isLocked: false,
  isNoCash: false,
  ...overrides,
})

const SERVICES = [
  service(),
  service({ id: 's2', no: 'S02', name: '頭皮護理', price: 2500, serviceDeductionCount: 0, helperDeductionCount: 0, serviceCategory: null }),
  service({ id: 's3', no: 'S03', name: '舊方案', isUsing: false }),
]

const fixtures = ({ passwordOn = false } = {}) => ({
  FETCH_SERVICES: { services: { totalCount: SERVICES.length, pageOffset: 0, pageLimit: 50, data: SERVICES } },
  ServiceCategories: { serviceCategories: [{ id: 'c1', no: 'C1', name: '剪髮' }] },
  MERCHANT_COMMISSION_WAY: { merchantCommissionWay: [] },
  GET_MERCHANT_PASSWORD: { merchantPassword: { deleteService: { password: '', isUsing: passwordOn } } },
  DEL_COUPONS: { deleteService: true },
})

const setup = options => renderPage(<Services />, { fixtures: fixtures(options), route: '/services' })
const row = name => screen.getByText(name).closest('tr')

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('服務項目設定：列表', () => {
  it('列出服務的代號、分類、名稱與價格（千分位），並顯示總筆數', async () => {
    setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    const r = within(row('精緻剪髮'))
    expect(r.getByText('S01')).toBeInTheDocument()
    expect(r.getByText('剪髮')).toBeInTheDocument()
    expect(r.getByText('1,200')).toBeInTheDocument()
  })

  it('沒有分類顯示「無分類」；未設定扣項／互助的服務標示「無扣項」「無設定」提醒補設定', async () => {
    setup()
    await screen.findByText('共 3 筆')
    const r = within(row('頭皮護理'))
    expect(r.getByText('無分類')).toBeInTheDocument()
    expect(r.getByText('無扣項')).toHaveClass('text-danger')
    expect(r.getByText('無設定')).toHaveClass('text-danger')
  })

  it('停用的服務不可勾選', async () => {
    setup()
    await screen.findByText('共 3 筆')
    expect(screen.getByLabelText('選取 舊方案')).toBeDisabled()
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeDisabled()
  })

  it('查詢條件帶目前店家', async () => {
    const { calls } = setup()
    await screen.findByText('共 3 筆')
    expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')[0].variables).toEqual({ merchantId: MERCHANT_ID })
  })
})

describe('服務項目設定：刪除', () => {
  it('未開啟刪除密碼：勾選後按刪除直接送出勾選的服務', async () => {
    const { calls } = setup()
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(screen.getByLabelText('選取 頭皮護理'))
    fireEvent.click(await screen.findByText('刪除', { selector: 'button, button *' }))
    await wait(() => expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(1))
    expect(callsOf(calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['s1', 's2'] })
  })

  it('開啟刪除密碼：先輸入密碼，送出時帶密碼', async () => {
    const { calls } = setup({ passwordOn: true })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(await screen.findByText('刪除', { selector: 'button, button *' }))
    const pwd = await screen.findByTestId('delete-password')
    expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(0)
    fireEvent.change(pwd, { target: { value: 'secret' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(1))
    expect(callsOf(calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['s1'], password: 'secret' })
  })
})
