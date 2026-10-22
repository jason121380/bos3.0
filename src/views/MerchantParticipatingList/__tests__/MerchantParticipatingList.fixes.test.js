// 修正（Jason 2026/10/22 長期授權）：查詢失敗時 events 被設成 undefined、讀 .length 整頁進入錯誤畫面；改為當成沒有資料。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MerchantParticipatingList from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it('查詢失敗時顯示空狀態，不整頁壞', async () => {
  const { settle } = renderPage(<MerchantParticipatingList />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('目前無活動參與資料')).toBeInTheDocument()
})
