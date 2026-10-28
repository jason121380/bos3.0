// 修正（Jason 2026/10/22 長期授權）：網址的卡券 id 不在清單中（已刪除或打錯）或清單查詢失敗時，原本讀 undefined 整頁進入錯誤畫面；
// 改為不帶入，表單維持空白、不能儲存。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ThirdPartyCouponEdit from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it.each([
  ['找不到該卡券', { fixtures: { GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: [{ id: 't1', name: '街口券', type: 'PERCENT', handlingFee: 2, isNoCash: false }] } } }],
])('%s時不整頁壞，表單空白、不能儲存', async (_, options) => {
  const { settle } = renderPage(<ThirdPartyCouponEdit match={{ params: { id: 'gone' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByTestId('name')).toHaveValue('')
  expect(screen.getByText('儲存').closest('button')).toBeDisabled()
})

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('查詢失敗時顯示無法載入資料與重新查詢', async () => {
  const { settle } = renderPage(<ThirdPartyCouponEdit match={{ params: { id: 'gone' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
