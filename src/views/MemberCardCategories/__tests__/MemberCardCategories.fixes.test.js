// 修正（Jason 2026/10/22 長期授權）：有停用分類時表頭「全選」永遠不會勾起（已選數 ≠ 含停用的總數），再按一次是「再全選」
// 而不是取消。改為與「可勾選（啟用中）的分類」比對：全部勾選後表頭勾起、再按一次全部取消。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import MemberCardCategories from '..'

jest.setTimeout(20000)

const CATEGORIES = [
  { uuid: 'c1', no: 'A01', name: '金卡', isUsing: true, updatedAt: 0, creator: null },
  { uuid: 'c2', no: 'A02', name: '銀卡', isUsing: true, updatedAt: 0, creator: null },
  { uuid: 'c3', no: 'A03', name: '停用卡', isUsing: false, updatedAt: 0, creator: null },
]

beforeEach(() => loginAs())
afterEach(cleanup)

it('有停用分類時：全選勾起所有啟用中的分類且表頭為勾選，再按一次全部取消；只勾一部分時為半選', async () => {
  renderPage(<MemberCardCategories />, { fixtures: { FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: CATEGORIES } } })
  await screen.findByText('共 3 筆')
  const all = screen.getByLabelText('全選')
  fireEvent.click(all)
  expect(all).toBeChecked()
  expect(all.indeterminate).toBe(false)
  expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
  fireEvent.click(all)
  expect(screen.getByTestId('category-金卡-checkbox')).not.toBeChecked()
  expect(screen.getByTestId('category-銀卡-checkbox')).not.toBeChecked()
  fireEvent.click(screen.getByTestId('category-金卡-checkbox'))
  expect(all).not.toBeChecked()
  expect(all.indeterminate).toBe(true)
})
