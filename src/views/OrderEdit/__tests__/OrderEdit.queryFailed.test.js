// 帳單詳細：帳單查詢失敗、查無此帳單（已刪除／他店 id）或掛單設定查詢失敗時，不能整頁拋錯（2026/10/28 稽核 B-01、B-02）。
// 查無帳單要顯示可重試的「無法載入帳單」；設定失敗時頁面照常呈現、掛單維持保守停用。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import OrderEdit from '..'

jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

const render = fixtures => renderPage(<OrderEdit match={{ params: { id: 'order-1' } }} />, { fixtures, route: '/order/order-1' })

it('帳單查詢失敗：顯示「無法載入帳單」與重新查詢，不是整頁錯誤', async () => {
  const utils = render({ FETCH_ORDER: new Error('模擬 API 失敗') })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入帳單')).toBeInTheDocument()
  const before = callsOf(utils.calls, 'FETCH_ORDER').length
  fireEvent.click(screen.getByRole('button', { name: '重新查詢' }))
  await utils.settle()
  expect(callsOf(utils.calls, 'FETCH_ORDER').length).toBeGreaterThan(before)
})

it('查無此帳單（order 為 null）：顯示「無法載入帳單」，不是整頁錯誤', async () => {
  const utils = render({ FETCH_ORDER: { order: null } })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入帳單')).toBeInTheDocument()
})

it('掛單設定查詢失敗：頁面不整頁拋錯', async () => {
  const utils = render({ GET_DISBLE_PENDING_ORDER: new Error('模擬 API 失敗'), FETCH_ORDER: { order: null } })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
})
