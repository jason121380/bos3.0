// 新增版本紀錄：「新增」停用時要說出還缺哪些欄位（STYLE.md §6），填一項少一項，都填了就不顯示。
// GraphQL 由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, typeLikeBrowser } from '../../../__tests__/testkit.test'
import SystemUpdateRecordCreate from '..'

// jsdom 沒有 Element.scrollTo（Markdown 編輯器會呼叫），比照 views/__tests__/pages.smoke
beforeAll(() => {
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})
beforeEach(() => loginAs())
afterEach(cleanup)

it('一開始列出尚缺的標題、內容、版本；填了標題與版本後只剩內容', async () => {
  const utils = renderPage(<SystemUpdateRecordCreate />, { route: '/system-update-record/create' })
  await utils.settle()
  const submit = screen.getByTestId('createSystemUpdate')
  expect(submit).toBeDisabled()
  const reason = screen.getByText('尚缺：標題、內容、版本')
  expect(reason).toHaveAttribute('role', 'status')
  expect(submit).toHaveAttribute('aria-describedby', reason.id)
  typeLikeBrowser(screen.getByLabelText('標題'), '10/30 更新')
  typeLikeBrowser(screen.getByLabelText('版本'), 'v3.10301700')
  expect(screen.getByText('尚缺：內容')).toBeInTheDocument()
  expect(submit).toBeDisabled()
})
