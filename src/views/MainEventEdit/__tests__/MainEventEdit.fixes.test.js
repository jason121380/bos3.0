// 修正（Jason 2026/10/22 長期授權）：活動查詢失敗（或查無活動回 null）時表單資料被設成 undefined、整頁進入錯誤畫面；
// 改為不帶入，表單維持預設值。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel } from '../../__tests__/settingsPageKit.test'
import MainEventEdit from '..'

jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocpmpleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it.each([
  ['查無活動', { fixtures: { GET_MERCHANT_EVENT: { mainEvent: null } } }],
])('%s時不整頁壞，表單為預設值', async (_, options) => {
  const { settle } = renderPage(<MainEventEdit match={{ params: { id: 'e1' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('活動名稱')).toHaveValue('')
  expect(fieldByLabel('總張數上限')).toHaveValue('0')
})

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('查詢失敗時顯示無法載入資料與重新查詢', async () => {
  const { settle } = renderPage(<MainEventEdit match={{ params: { id: 'e1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
