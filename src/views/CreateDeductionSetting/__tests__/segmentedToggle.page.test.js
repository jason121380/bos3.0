// 為什麼重要：抽成方式設定決定設計師薪資。在全段的某個類別（非第一組）切換「指定／不指定」與「全段／分段」後回到全段，
// 畫面要回到「預設」組、可繼續新增與輸入級距，不能整頁錯誤或改到不存在的組別。
// 守住：全段第 3 組 → 勾「分指定/不指定」→ 分段 → 取消指定 → 回全段：顯示「預設」組一列級距、不進入錯誤畫面，
// 之後新增級距與輸入抽成寫入「預設」組（2026/10/22 修正前組別索引停在 2，回全段時整頁錯誤）。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實設定。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CreateDeductionSetting from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const ATTRIBUTIONS = [
  { label: '預設', value: '預設' },
  { label: '剪髮', value: '剪髮' },
  { label: '染髮', value: '染髮' },
]

it('全段第 3 組 → 指定 → 分段 → 取消指定 → 回全段：回到「預設」組，可繼續新增與輸入', async () => {
  const { settle } = renderPage(<CreateDeductionSetting />, {
    fixtures: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS } },
    route: '/createDeductionSetting',
  })
  await settle()
  // Radix 分頁在 mousedown 時切換
  fireEvent.mouseDown(await screen.findByRole('tab', { name: '剪髮' }), { button: 0 })
  fireEvent.mouseDown(screen.getByRole('tab', { name: '染髮' }), { button: 0 })
  await wait(() => expect(screen.getByRole('tab', { name: '染髮' })).toHaveAttribute('aria-selected', 'true'))
  const designate = () => screen.getByLabelText('分指定/不指定')
  fireEvent.click(designate())
  fireEvent.click(screen.getByTestId('assign-designer-true'))
  fireEvent.click(designate())
  fireEvent.click(screen.getByTestId('assign-designer-false'))

  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByRole('tab', { name: '預設' })).toHaveAttribute('aria-selected', 'true')
  const rakeInputs = () => document.querySelectorAll('input[type="number"]')
  // 「預設」組只有一列級距（門檻、抽成兩格）
  expect(rakeInputs()).toHaveLength(2)
  fireEvent.click(screen.getAllByRole('button', { name: /新增/ })[0])
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(rakeInputs()).toHaveLength(4)
})
