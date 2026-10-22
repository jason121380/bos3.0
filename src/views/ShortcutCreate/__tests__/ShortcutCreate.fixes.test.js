// 修正（Jason 2026/10/22 長期授權）：服務／店販／預收卡／會員卡任一清單查詢失敗時讀 undefined 整頁進入錯誤畫面；
// 改為該清單當成空的，其他清單照常可選、可新增。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel, TRANSFER_FIXTURES } from '../../__tests__/settingsPageKit.test'
import ShortcutCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it('四個清單都查詢失敗時不整頁壞，仍可新增', async () => {
  const { settle, calls } = renderPage(<ShortcutCreate />, { fixtures: { CREATE_SHORTCUT: { createShortcut: true } }, fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  fireEvent.change(fieldByLabel('名稱'), { target: { value: '套餐' } })
  fireEvent.click(screen.getByText('新增').closest('button'))
  await wait(() => expect(callsOf(calls, 'CREATE_SHORTCUT')).toHaveLength(1))
})

it('只有服務清單查詢失敗時，其他清單照常顯示', async () => {
  const { GET_SERVICES_FOR_TRANSFERLIST, ...others } = TRANSFER_FIXTURES
  const { settle } = renderPage(<ShortcutCreate />, { fixtures: others, fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('G1 - 洗髮精 - 450')).toBeInTheDocument()
  expect(GET_SERVICES_FOR_TRANSFERLIST).toBeTruthy()
})
