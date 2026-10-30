// 保護顧客端「預約記錄」（/customer/reservation/list）：顧客看自己的預約並取消。守住：
// - 只查「預約」類的訂單（isReserved: true）；顯示日期時間、設計師（沒有設計師顯示不指定）、是否指定、狀態
// - 待審核與預約成功才能取消，取消送該筆 id，成功後提示並重新查詢；其他狀態不能取消
// - 沒有顧客登入資料（或缺 userCode）時導到顧客登入頁並帶回跳網址與店家（煙霧測試另有）
// GraphQL 全由模擬 link 回應，不連後端、不取消真實預約。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import ReservationList from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const ORDERS = [
  {
    id: 'o-1',
    date: new Date(2025, 2, 10, 10, 0).getTime(),
    status: '待審核',
    isReserved: true,
    isDesignate: true,
    designer: { id: 'd-1', name: '王小美' },
  },
  { id: 'o-2', date: new Date(2025, 2, 11, 14, 30).getTime(), status: '預約成功', isReserved: true, isDesignate: false, designer: null },
  { id: 'o-3', date: new Date(2025, 2, 1, 9, 0).getTime(), status: '已完成', isReserved: true, isDesignate: false, designer: null },
]
const setup = (search = '?merchantid=m-1') =>
  renderPage(<ReservationList location={{ search }} />, {
    route: `/customer/reservation/list${search}`,
    fixtures: {
      undefined: { viewer: { customer: { id: 'c-1', orders: { orders: ORDERS } } } },
      CustomerCancelOrder: { customerCancelOrder: true },
    },
  })

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('customer', JSON.stringify({ name: '吳小姐', userCode: 'u-1' }))
})
afterEach(cleanup)

it('只查預約類訂單；列出日期時間、設計師、指定與狀態；待審核與預約成功可取消', async () => {
  const utils = setup()
  await utils.settle()
  expect(callsOf(utils.calls, undefined)[0].variables).toEqual({ input: { isReserved: true } })
  expect(screen.getByText('2025/03/10 10:00')).toBeInTheDocument()
  expect(screen.getByText('王小美 設計師')).toBeInTheDocument()
  expect(screen.getAllByText('不指定設計師')).toHaveLength(2)
  expect(screen.getAllByText('指定設計師')).toHaveLength(1)
  expect(screen.getByText('已完成')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '取消預約' })).toHaveLength(2)
  // 已登入：不導頁
  expect(currentLocation()).toBe('/customer/reservation/list?merchantid=m-1')
})

it('取消預約：送該筆 id，成功後提示並重新查詢', async () => {
  const utils = setup()
  await utils.settle()
  const before = callsOf(utils.calls, undefined).length
  fireEvent.click(screen.getAllByRole('button', { name: '取消預約' })[1])
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '取消預約成功', variant: 'success' }))
  expect(callsOf(utils.calls, 'CustomerCancelOrder').map(c => c.variables)).toEqual([{ orderId: 'o-2' }])
  await wait(() => expect(callsOf(utils.calls, undefined).length).toBe(before + 1))
  fireEvent.click(screen.getAllByRole('button', { name: '取消預約' })[0])
  await wait(() => expect(callsOf(utils.calls, 'CustomerCancelOrder').map(c => c.variables.orderId)).toEqual(['o-2', 'o-1']))
})

it('顧客資料缺 userCode：導到顧客登入頁並帶回跳網址與店家', async () => {
  localStorage.setItem('customer', JSON.stringify({ name: '吳小姐' }))
  setup('?merchantid=m-9')
  await wait(() => expect(currentLocation()).toBe('/customer/login?merchantid=m-9&redirect=/customer/reservation/list?merchantid=m-9'))
})

it('點標題會清掉本機的登入資料（隱藏的登出入口）', async () => {
  const utils = setup()
  await utils.settle()
  fireEvent.click(screen.getByText('預約記錄'))
  expect(localStorage.getItem('customer')).toBeNull()
})
