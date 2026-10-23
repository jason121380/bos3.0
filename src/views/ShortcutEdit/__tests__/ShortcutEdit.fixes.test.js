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

it('全部查詢失敗時不整頁壞，表單空白', async () => {
  const { settle } = renderPage(<ShortcutEdit match={{ params: { id: 'sc1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('名稱')).toHaveValue('')
})

it('查無組合（null）時不整頁壞，挑選清單照常顯示', async () => {
  const { settle } = renderPage(<ShortcutEdit match={{ params: { id: 'sc1' } }} />, {
    fixtures: { ...TRANSFER_FIXTURES, GET_SHORTCUT: { shortcut: null } },
  })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('S1 - 燙髮 - 2000')).toBeInTheDocument()
})
