// 保護顧客端「會員卡」頁：未登入導到顧客登入並帶回跳網址（含店家 id）；已登入時依會員等級顯示卡面與折扣文字；
// 資料未填完（性別 UNKNOW）導到建立會員資料；送出推薦碼更新會員等級後清空輸入。
// GraphQL 全由 testkit 的模擬 link 回應（顧客資料查詢沒有名稱，fixture 鍵為 undefined），不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import MemberCard from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const ROUTE = '/customer/member/card?merchantid=m-77'
const location = { search: '?merchantid=m-77' }
const customer = overrides => ({ id: 'cu1', no: '1', name: '陳小姐', cellphone: '0911222333', gender: 'FEMALE', type: 'GOLD', ...overrides })
const setup = fixtures => renderPage(<MemberCard location={location} />, { fixtures, route: ROUTE })
const cardImage = () => document.querySelector('img')

beforeEach(() => {
  localStorage.clear()
})
afterEach(cleanup)

describe('顧客端會員卡', () => {
  it('未登入：提示尚未登入並導到顧客登入，登入後回到本頁（帶店家 id）', async () => {
    const { calls } = setup()
    await wait(() =>
      expect(currentLocation()).toBe('/customer/login?merchantid=m-77&redirect=/customer/member/card?merchantid=m-77')
    )
    expect(openSnackbar).toHaveBeenCalledWith({ message: '尚未登入', variant: 'warning' })
    expect(calls).toHaveLength(0)
  })

  it.each([
    ['GOLD', 'https://i.imgur.com/KKJv0TM.jpg', ''],
    ['PLATINUM', 'https://i.imgur.com/bYYLUme.jpg', '10% off'],
    ['DIAMOND', 'https://i.imgur.com/P84SfZc.jpg', '20% off'],
  ])('會員等級 %s 顯示對應卡面與折扣', async (type, src, text) => {
    localStorage.setItem('customer', { id: 'cu1' })
    setup({ undefined: { viewer: { customer: customer({ type }) } } })
    expect(await screen.findByText(`0911222333 | ${type}`)).toBeInTheDocument()
    expect(cardImage()).toHaveAttribute('src', src)
    if (text) expect(screen.getByText(text)).toBeInTheDocument()
    expect(currentLocation()).toBe(ROUTE)
  })

  it('其他等級（一般會員）沒有卡面圖片與折扣文字', async () => {
    localStorage.setItem('customer', { id: 'cu1' })
    setup({ undefined: { viewer: { customer: customer({ type: 'NORMAL' }) } } })
    expect(await screen.findByText('0911222333 | NORMAL')).toBeInTheDocument()
    expect(cardImage().getAttribute('src')).toBe('')
    expect(screen.queryByText(/% off/)).toBeNull()
  })

  it('會員資料未填完（性別 UNKNOW）導到建立會員資料', async () => {
    localStorage.setItem('customer', { id: 'cu1' })
    setup({ undefined: { viewer: { customer: customer({ gender: 'UNKNOW' }) } } })
    await wait(() => expect(currentLocation()).toBe('/customer/member/create'))
  })

  it('送出推薦碼更新會員等級，成功後提示並清空輸入', async () => {
    localStorage.setItem('customer', { id: 'cu1' })
    const { calls } = setup({
      undefined: { viewer: { customer: customer() } },
      UpdateCustomerType: { updateCustomerType: { id: 'cu1', type: 'PLATINUM' } },
    })
    await screen.findByText('0911222333 | GOLD')
    const input = screen.getByLabelText('推薦碼')
    fireEvent.change(input, { target: { value: 'VIP2026' } })
    fireEvent.click(screen.getByText('送出'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已更新會員級別', variant: 'success' }))
    expect(callsOf(calls, 'UpdateCustomerType')[0].variables).toEqual({ recommandCode: 'VIP2026' })
    expect(input).toHaveValue('')
  })
})
