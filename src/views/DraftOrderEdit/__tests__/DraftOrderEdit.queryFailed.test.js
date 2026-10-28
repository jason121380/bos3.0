// 掛單詳細：查無此掛單（已刪除／他店 id）或查詢失敗時顯示可重試的「無法載入掛單」，不能整頁拋錯（2026/10/28 稽核 B-02）。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import DraftOrderEdit from '..'

jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

it('查詢失敗：顯示「無法載入掛單」與重新查詢，不是整頁錯誤', async () => {
  const utils = renderPage(<DraftOrderEdit match={{ params: { id: 'order-1' } }} />, {
    fixtures: { FETCH_ORDER: new Error('模擬 API 失敗') },
    route: '/draft-order/order-1',
  })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入掛單')).toBeInTheDocument()
  const before = callsOf(utils.calls, 'FETCH_ORDER').length
  fireEvent.click(screen.getByRole('button', { name: '重新查詢' }))
  await utils.settle()
  expect(callsOf(utils.calls, 'FETCH_ORDER').length).toBeGreaterThan(before)
})

it('查無此掛單（order 為 null）：顯示「無法載入掛單」', async () => {
  const utils = renderPage(<DraftOrderEdit match={{ params: { id: 'order-1' } }} />, {
    fixtures: { FETCH_ORDER: { order: null } },
    route: '/draft-order/order-1',
  })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入掛單')).toBeInTheDocument()
})
