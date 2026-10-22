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
  ['清單查詢失敗', { fallback: 'error' }],
  ['找不到該卡券', { fixtures: { GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: [{ id: 't1', name: '街口券', type: 'PERCENT', handlingFee: 2, isNoCash: false }] } } }],
])('%s時不整頁壞，表單空白、不能儲存', async (_, options) => {
  const { settle } = renderPage(<ThirdPartyCouponEdit match={{ params: { id: 'gone' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByTestId('name')).toHaveValue('')
  expect(screen.getByText('儲存').closest('button')).toBeDisabled()
})
