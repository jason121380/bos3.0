// 修正（Jason 2026/10/22 長期授權）：組合或任一挑選清單查詢失敗時讀 undefined 整頁進入錯誤畫面；改為不帶入／清單當成空的。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel, TRANSFER_FIXTURES } from '../../__tests__/settingsPageKit.test'
import ShortcutEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('全部查詢失敗時顯示無法載入資料與重新查詢，不顯示空白表單', async () => {
  const { settle } = renderPage(<ShortcutEdit match={{ params: { id: 'sc1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})

it('查無組合（null）時不整頁壞，挑選清單照常顯示', async () => {
  const { settle } = renderPage(<ShortcutEdit match={{ params: { id: 'sc1' } }} />, {
    fixtures: { ...TRANSFER_FIXTURES, GET_SHORTCUT: { shortcut: null } },
  })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('S1 - 燙髮 - 2000')).toBeInTheDocument()
})
