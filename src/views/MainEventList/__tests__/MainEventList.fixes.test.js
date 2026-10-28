// 修正（Jason 2026/10/22 長期授權）：活動查詢失敗時 events 被設成 undefined、讀 .length 整頁進入錯誤畫面；改為當成沒有活動。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MainEventList from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

// 2026/10/28 稽核 C-1：查詢失敗改顯示 QueryFailed（「無法載入資料」＋「重新查詢」），不再當成沒有活動
it('活動查詢失敗時顯示無法載入資料與重新查詢，不整頁壞', async () => {
  const { settle } = renderPage(<MainEventList />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
})
