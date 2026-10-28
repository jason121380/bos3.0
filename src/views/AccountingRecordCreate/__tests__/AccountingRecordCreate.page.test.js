// 新增收借支紀錄：原 __test__/index.test.js 整檔被註解、只剩一個空的 it（永遠綠的假測試，2026/10/28 稽核 B-11）。
// 改成真正的煙霧測試：後端回空資料與全部失敗時都要顯示頁面標題、不進錯誤畫面（與 views/__tests__/pages.smoke 同一口徑）。
import React from 'react'
import { screen, cleanup } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AccountingRecordCreate from '..'

const renderCreate = fallback =>
  renderPage(<AccountingRecordCreate match={{ params: {} }} location={{ pathname: '/accounting-record/create', search: '' }} />, {
    fallback,
    route: '/accounting-record/create',
  })

beforeEach(() => loginAs())
afterEach(cleanup)

it.each([
  ['後端回空資料', 'empty'],
  ['API 全部失敗', 'error'],
])('%s：顯示「新增收借支紀錄」標題且不進錯誤畫面', async (_, fallback) => {
  const utils = renderCreate(fallback)
  expect((await screen.findAllByText('新增收借支紀錄', { exact: false }))[0]).toBeInTheDocument()
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
})
