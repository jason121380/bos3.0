// 保護顧客「服務評價」連結頁（/customer/rating/:orderId/:rank）：打開即以網址的帳單 id 與星等（轉數字）記錄評分；
// 已評論過顯示已完成、連結有誤顯示錯誤；可改星等（再點同一顆不會清成 0）與留言後送出，送出內容為目前星等與留言，
// 成功顯示感謝畫面，後端回 false 或錯誤時提示並可再送。GraphQL 全由 testkit 的模擬 link 回應，不寫入真實評價。
import React from 'react'
import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf } from '../../../__tests__/testkit.test'
import CustomerRating from '..'
import Status from '../Status'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const RANKING = { designerName: '王小美', avatar: 'https://example.com/a.png', rank: 4, comment: null, isCommented: false }

const setup = (fixtures = {}) =>
  renderPage(<CustomerRating />, {
    fixtures: {
      SET_ORDER_RANKING: { setOrderRanking: RANKING },
      SET_ORDER_RANKING_AND_COMMENT: { setOrderRankingAndComment: true },
      ...fixtures,
    },
    path: '/customer/rating/:orderId/:rank',
    route: '/customer/rating/order-1/4',
  })

beforeEach(() => openSnackbar.mockClear())
afterEach(cleanup)

describe('顧客服務評價', () => {
  it('打開連結即以帳單 id 與數字星等記錄評分，顯示設計師與目前星等', async () => {
    const utils = setup()
    await screen.findByText('設計師: 王小美')
    expect(callsOf(utils.calls, 'SET_ORDER_RANKING')[0].variables).toEqual({ input: { orderId: 'order-1', rank: 4 } })
    expect(document.querySelector('img')).toHaveAttribute('src', RANKING.avatar)
    expect(screen.getByText('對於王小美的服務，您給幾顆星呢？')).toBeInTheDocument()
    expect(screen.getByLabelText('4 星')).toBeChecked()
  })

  it('改星等、留言後送出，送出目前內容並顯示感謝畫面', async () => {
    const utils = setup()
    await screen.findByText('設計師: 王小美')
    fireEvent.click(screen.getByLabelText('2 星'))
    expect(screen.getByLabelText('2 星')).toBeChecked()
    // 再點目前星等：MUI 會回傳 null，頁面忽略，星等不變
    fireEvent.click(screen.getByLabelText('2 星'))
    expect(screen.getByLabelText('2 星')).toBeChecked()
    fireEvent.change(screen.getByPlaceholderText('留下您的評論'), { target: { value: '很專業' } })
    fireEvent.click(screen.getByText('送出'))
    await screen.findByText('感謝您的評論，可關閉本視窗。')
    expect(callsOf(utils.calls, 'SET_ORDER_RANKING_AND_COMMENT')[0].variables).toEqual({
      input: { orderId: 'order-1', rank: 2, comment: '很專業' },
    })
  })

  it('後端回 false：提示送出失敗、按鈕可再按；發生錯誤以錯誤訊息提示', async () => {
    setup({ SET_ORDER_RANKING_AND_COMMENT: { setOrderRankingAndComment: false } })
    await screen.findByText('設計師: 王小美')
    fireEvent.click(screen.getByText('送出'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '送出失敗' }))
    expect(screen.getByText('送出')).not.toBeDisabled()
    cleanup()
    setup({ SET_ORDER_RANKING_AND_COMMENT: new Error('評論已關閉') })
    await screen.findByText('設計師: 王小美')
    fireEvent.click(screen.getByText('送出'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '評論已關閉' }))
  })

  it('沒有大頭照、星等為 0 時不顯示圖片與星等，只留留言欄', async () => {
    setup({ SET_ORDER_RANKING: { setOrderRanking: { ...RANKING, avatar: null, rank: 0, comment: '舊留言' } } })
    await screen.findByText('設計師: 王小美')
    expect(document.querySelector('img')).toBeNull()
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByPlaceholderText('留下您的評論')).toHaveValue('舊留言')
  })

  it('已評論過：顯示已完成評論', async () => {
    setup({ SET_ORDER_RANKING: { setOrderRanking: { ...RANKING, isCommented: true } } })
    expect(await screen.findByText('本次服務已完成評論，可關閉本視窗。')).toBeInTheDocument()
  })

  it('連結有誤（記錄評分失敗）：顯示連結有誤', async () => {
    setup({ SET_ORDER_RANKING: new Error('查無帳單') })
    expect(await screen.findByText('連結有誤')).toBeInTheDocument()
  })
})

describe('評價結果畫面（Status）', () => {
  it('未開啟或狀態為 null／未知時不顯示訊息', () => {
    const { container, rerender } = render(<Status isComment="complete" />)
    expect(container.innerHTML).toBe('')
    rerender(<Status open isComment={null} />)
    expect(container.textContent).toBe('')
    rerender(<Status open isComment="other" />)
    expect(container.textContent).toBe('')
  })
})

it('鍵盤改星等後送出數字值，清空回呼仍由頁面忽略', async () => {
  const utils = setup()
  await screen.findByText('設計師: 王小美')
  const four = screen.getByRole('radio', { name: '4 星' })
  four.focus()
  fireEvent.keyDown(four, { key: 'ArrowRight' })
  const five = screen.getByRole('radio', { name: '5 星' })
  expect(five).toBeChecked()
  fireEvent.keyDown(five, { key: ' ' })
  expect(five).toBeChecked()
  fireEvent.click(screen.getByText('送出'))
  await wait(() => expect(callsOf(utils.calls, 'SET_ORDER_RANKING_AND_COMMENT')).toHaveLength(1))
  expect(callsOf(utils.calls, 'SET_ORDER_RANKING_AND_COMMENT')[0].variables).toEqual({
    input: { orderId: 'order-1', rank: 5, comment: null },
  })
})
