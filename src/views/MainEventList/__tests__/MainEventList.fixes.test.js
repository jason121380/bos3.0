// 修正（Jason 2026/10/22 長期授權）：活動查詢失敗時 events 被設成 undefined、讀 .length 整頁進入錯誤畫面；改為當成沒有活動。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MainEventList from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it('活動查詢失敗時顯示無活動資料，不整頁壞', async () => {
  const { settle } = renderPage(<MainEventList />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('共 0 筆資料')).toBeInTheDocument()
  expect(screen.getByText('無活動資料')).toBeInTheDocument()
})
