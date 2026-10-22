// 修正（Jason 2026/10/22 長期授權）：分類查詢失敗（或查無分類回 null）時原本讀 undefined.uuid 整頁進入錯誤畫面；改為不帶入、表單維持空白。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel } from '../../__tests__/settingsPageKit.test'
import MemberCardCategoryEdit from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it.each([
  ['查詢失敗', { fallback: 'error' }],
  ['查無分類', { fixtures: { FETCH_MEMBERSHIP_CATEGORY: { membershipCategory: null } } }],
])('%s時不整頁壞，表單空白', async (_, options) => {
  const { settle } = renderPage(<MemberCardCategoryEdit match={{ params: { id: 'cat-1' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('編輯會員卡分類')).toBeInTheDocument()
  expect(fieldByLabel('名稱')).toHaveValue('')
})
