// 修正（Jason 2026/10/22 長期授權）：有停用會員卡時表頭「全選」永遠不會勾起，再按一次是「再全選」而不是取消。
// 改為與「啟用中的會員卡」比對：全部勾選後表頭勾起、再按一次全部取消。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import MemberCardRecord from '..'

jest.mock('react-csv', () => ({ CSVLink: ({ children }) => <a href="#csv">{children}</a> }))
jest.setTimeout(20000)

const card = (uuid, name, isUsing = true) => ({
  uuid, no: uuid, name, isUsing, membershipCategory: null, cost: 0, sellPrice: 0, updatedAt: 0, creator: null,
})

beforeEach(() => loginAs())
afterEach(cleanup)

it('有停用會員卡時：全選後表頭為勾選，再按一次全部取消；只勾一部分時為半選', async () => {
  renderPage(<MemberCardRecord />, {
    fixtures: { FETCH_MEMBERSHIPS: { memberships: { data: [card('m1', '年卡'), card('m2', '季卡'), card('m3', '舊卡', false)] } } },
  })
  await screen.findByText('共 3 筆')
  const all = screen.getByLabelText('全選')
  fireEvent.click(all)
  expect(all).toBeChecked()
  expect(screen.getByTestId('membership-舊卡-checkbox')).not.toBeChecked()
  fireEvent.click(all)
  expect(screen.getByTestId('membership-年卡-checkbox')).not.toBeChecked()
  fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
  expect(all).not.toBeChecked()
  expect(all.indeterminate).toBe(true)
})
