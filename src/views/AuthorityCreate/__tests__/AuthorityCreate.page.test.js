// 保護「新增角色」：名稱空白時不能新增；輸入名稱後送出的 SET_CREATE_NEW_AUTHORITY 以名稱為 input，成功後回角色列表並提示。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實角色。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import AuthorityCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

it('名稱空白時停用新增；輸入名稱後送出名稱並回到角色列表', async () => {
  const { calls } = renderPage(<AuthorityCreate />, {
    route: '/role/create',
    fixtures: { SET_CREATE_NEW_AUTHORITY: { createNewAuthority: true } },
  })
  const submit = screen.getByRole('button', { name: '新增' })
  expect(submit).toBeDisabled()
  fireEvent.change(screen.getByTestId('name'), { target: { value: '助理' } })
  expect(submit).toBeEnabled()
  fireEvent.click(submit)
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
  expect(callsOf(calls, 'SET_CREATE_NEW_AUTHORITY')[0].variables).toEqual({ input: '助理' })
  expect(currentLocation()).toBe('/authority')
})
