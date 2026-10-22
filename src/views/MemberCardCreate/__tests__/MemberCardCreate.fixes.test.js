// 修正（Jason 2026/10/22 長期授權）：送出時若「是否可販售」關閉，原本以 setSubmitValue 把抽成清回固定 0，
// 但送出用的仍是同一次 render 的舊值，先開販售填了抽成再關掉會把舊的抽成方式與數字送出。改為送出時直接帶清除後的抽成。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption } from '../../__tests__/settingsPageKit.test'
import MemberCardCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

it('開販售填了抽成再關掉：送出不販售、抽成固定 0', async () => {
  const { calls } = renderPage(<MemberCardCreate />, {
    fixtures: {
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'cat-1', no: 'A01', name: '儲值卡' }] },
      createMembership: { createMembership: true },
    },
  })
  await wait(() => expect(fieldByLabel('會員卡類別').options.length).toBeGreaterThan(1))
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'M01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '儲值卡' } })
  pickOption(fieldByLabel('會員卡類別'), 'A01 / 儲值卡')
  const sale = screen.getByRole('switch')
  fireEvent.click(sale)
  pickOption(fieldByLabel('抽成方式'), '依售價-成本(%)')
  fireEvent.change(fieldByLabel('抽成數字%'), { target: { value: '10' } })
  fireEvent.click(sale)
  fireEvent.click(screen.getByTestId('submit'))
  await wait(() => expect(callsOf(calls, 'createMembership')).toHaveLength(1))
  expect(callsOf(calls, 'createMembership')[0].variables.input).toEqual(
    expect.objectContaining({ isAvailableForSale: false, commissionWay: 'fixed', commission: 0 })
  )
})
