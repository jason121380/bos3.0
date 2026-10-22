// 修正（Jason 2026/10/22 長期授權）：設定查詢失敗（或查無設定回 null）時讀 undefined.name 整頁進入錯誤畫面；改為不帶入、維持預設值。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import HelperPointSettingEdit from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it.each([
  ['查詢失敗', { fallback: 'error' }],
  ['查無設定', { fixtures: { GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT: { getMerchantPointValueSetting: null } } }],
])('%s時不整頁壞，表單為預設值', async (_, options) => {
  const { settle } = renderPage(<HelperPointSettingEdit match={{ params: { id: 'hp1' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByLabelText('互助點數設定名稱')).toHaveValue('')
  expect(screen.getByText('固定金額')).toHaveAttribute('aria-pressed', 'true')
})
