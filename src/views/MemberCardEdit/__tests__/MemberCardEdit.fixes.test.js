// 修正（Jason 2026/10/22 長期授權）：會員卡查詢失敗（或查無此卡回 null）時原本讀 undefined.uuid 整頁進入錯誤畫面；
// 改為不帶入，表單維持空白、必填未填所以不能儲存。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption } from '../../__tests__/settingsPageKit.test'
import MemberCardEdit from '..'

jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

it.each([['查無此卡', { fixtures: { FETCH_MEMBERSHIP: { membership: null } } }]])('%s時不整頁壞，表單空白、不能儲存', async (_, options) => {
  const { settle } = renderPage(<MemberCardEdit match={{ params: { id: 'm1' } }} />, options)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('名稱')).toHaveValue('')
  expect(screen.getByText('儲存').closest('button')).toBeDisabled()
})

// 修正：未分類的會員卡（membershipCategory 為 null，會員卡列表顯示「未分類」）原本讀 null.uuid 整頁進入錯誤畫面；
// 改為帶入其他欄位、類別留空（類別必填，選好類別才能儲存）。
it('未分類的會員卡可以開啟編輯，類別留空、選好類別才能儲存', async () => {
  const { settle } = renderPage(<MemberCardEdit match={{ params: { id: 'm1' } }} />, {
    fixtures: {
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'cat-1', no: 'A01', name: '儲值卡' }] },
      FETCH_MEMBERSHIP: {
        membership: { uuid: 'm1', no: 'M01', name: '舊卡', membershipCategory: null, isAvailableForSale: false, isLocked: 'UNSET', effecitveDay: 0 },
      },
    },
  })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('名稱')).toHaveValue('舊卡')
  expect(screen.getByText('儲存').closest('button')).toBeDisabled()
  pickOption(fieldByLabel('會員卡類別'), 'A01 / 儲值卡')
  expect(screen.getByText('儲存').closest('button')).toBeEnabled()
})

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('查詢失敗時顯示無法載入資料與重新查詢', async () => {
  const { settle } = renderPage(<MemberCardEdit match={{ params: { id: 'm1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
