// 修正（Jason 2026/10/22 長期授權）：組合查詢失敗時讀 undefined.shortcuts 整頁進入錯誤畫面；改為當成沒有組合。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import Shortcut from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it('查詢失敗時顯示無資料，不整頁壞', async () => {
  const { settle } = renderPage(<Shortcut />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無資料')).toBeInTheDocument()
})
