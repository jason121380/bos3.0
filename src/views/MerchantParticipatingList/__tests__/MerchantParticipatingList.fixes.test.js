// 修正（Jason 2026/10/22 長期授權）：查詢失敗時 events 被設成 undefined、讀 .length 整頁進入錯誤畫面；改為當成沒有資料。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MerchantParticipatingList from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('查詢失敗時顯示無法載入資料與重新查詢，不整頁壞', async () => {
  const { settle } = renderPage(<MerchantParticipatingList />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
