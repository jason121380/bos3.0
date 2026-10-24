// 保護顧客前台「消費記錄」：未登入或登入資料缺 userCode 時導到顧客登入頁並帶回跳網址（含店家 merchantid）；
// 登入後每筆消費顯示帳單編號、日期、消費項目、金額（服務＋店販＋卡券販賣＋卡券使用的金額加總）、設計師、付款方式；
// 換頁送出 pageOffset、改每頁筆數時回到第一頁。GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import ConsumptionRecords from '..'

jest.setTimeout(20000)

const ORDER = {
  id: 'o1',
  no: 'A001',
  date: new Date(2026, 9, 21, 23, 50).getTime(),
  previewItem: ['精緻剪髮', '洗髮精'],
  serviceOrders: [{ id: 's1', price: 800 }],
  productOrders: [{ id: 'p1', price: 300 }, { id: 'p2', price: 200 }],
  ticketOrders: [{ id: 't1', price: 1000 }],
  useTicketOrders: [{ id: 'u1', price: 0 }],
  designer: { id: 'd1', name: '王小美' },
  payType: ['現金', 'LINE Pay'],
}

const ordersFixture = (orders = [ORDER], extra = {}) => ({
  viewer: { customer: { orders: { orders, totalCount: 120, pageLimit: 50, pageOffset: 0, ...extra } } },
})

const setup = (fixtures = {}) =>
  renderPage(<Route />, {
    fixtures: { FETCH_CUSTOMER_ORDERS: ordersFixture(), ...fixtures },
    path: '/customer/consumption/records',
    route: '/customer/consumption/records?merchantid=m-9',
  })

// 頁面以 location prop 讀 merchantid（路由給的），這裡用 Route 的 render 傳入
function Route() {
  const { useLocation } = require('react-router')
  const location = useLocation()
  return <ConsumptionRecords location={location} />
}

// 原生下拉以選項索引為值：依顯示文字選取
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}

beforeEach(() => {
  localStorage.clear()
})
afterEach(cleanup)

describe('顧客消費記錄', () => {
  it('未登入：導到顧客登入頁，登入後回到本頁（帶店家 id）', async () => {
    setup()
    await wait(() => expect(currentLocation()).toMatch(/^\/customer\/login\?/))
    expect(decodeURIComponent(currentLocation())).toBe(
      '/customer/login?merchantid=m-9&redirect=/customer/consumption/records?merchantid=m-9'
    )
  })

  it('登入資料沒有 userCode 也視為未登入', async () => {
    localStorage.setItem('customer', JSON.stringify({ name: '陳小姐' }))
    setup()
    await wait(() => expect(currentLocation()).toMatch(/^\/customer\/login\?/))
  })

  it('顯示每筆消費的編號、日期、項目、金額加總、設計師與付款方式', async () => {
    localStorage.setItem('customer', JSON.stringify({ userCode: 'code-1' }))
    const utils = setup()
    await utils.settle()
    expect(currentLocation()).toBe('/customer/consumption/records?merchantid=m-9')
    expect(callsOf(utils.calls, 'FETCH_CUSTOMER_ORDERS')[0].variables).toEqual({ input: { pageLimit: 50, pageOffset: 0 } })
    expect(screen.getByText('A001')).toBeInTheDocument()
    expect(screen.getByText('2026/10/21')).toBeInTheDocument()
    expect(screen.getByText('精緻剪髮、洗髮精')).toBeInTheDocument()
    // 800 + (300 + 200) + 1000 + 0
    expect(screen.getByText('2,300')).toBeInTheDocument()
    expect(screen.getByText('王小美')).toBeInTheDocument()
    expect(screen.getByText('現金、LINE Pay')).toBeInTheDocument()
    expect(screen.queryByText('目前沒有資料')).toBeNull()
  })

  it('換頁送出下一頁；改每頁筆數時回到第一頁', async () => {
    localStorage.setItem('customer', JSON.stringify({ userCode: 'code-1' }))
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(callsOf(utils.calls, 'FETCH_CUSTOMER_ORDERS').pop().variables).toEqual({ input: { pageLimit: 50, pageOffset: 1 } }))
    await utils.settle()
    choose(screen.getByLabelText('每頁筆數'), '10')
    await wait(() => expect(callsOf(utils.calls, 'FETCH_CUSTOMER_ORDERS').pop().variables).toEqual({ input: { pageLimit: 10, pageOffset: 0 } }))
  })

  it('沒有消費時顯示空狀態；後端沒回清單時不顯示列表也不壞頁', async () => {
    localStorage.setItem('customer', JSON.stringify({ userCode: 'code-1' }))
    const utils = setup({ FETCH_CUSTOMER_ORDERS: ordersFixture([], { totalCount: 0 }) })
    await utils.settle()
    expect(screen.getByText('目前沒有資料')).toBeInTheDocument()
    cleanup()
    const again = setup({ FETCH_CUSTOMER_ORDERS: ordersFixture(null) })
    await again.settle()
    expect(screen.queryByText('消費記錄')).toBeNull()
  })
})
