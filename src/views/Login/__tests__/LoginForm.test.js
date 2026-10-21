import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, wait } from '@testing-library/react'
import React from 'react'
import { LOGINV2, mockedSuccessResp } from 'hooks/useFetchLoginV2'
import { mockedProfile, FETCH_PROFILE } from 'hooks/useFetchProfile'

import LoginFrom from '../LoginForm'

const createWrapper = () => {
  const mocks = [
    {
      request: {
        query: LOGINV2,
        variables: {
          input: {
            cellphone: '0912345678',
            password: '123456',
            isKeepLogin: false,
          },
        },
      },
      result: {
        data: {
          userLoginV2: {
            token: 'token',
            user: mockedSuccessResp.data.userLoginV2,
            officialBrandMerchantId: 'merchantId',
            officialBrandMerchantName: 'merchantName',
          },
        },
      },
    },
    {
      request: {
        query: FETCH_PROFILE,
        variables: {
          orders: {},
        },
      },
      result: mockedProfile,
    },
  ]
  return render(
    <CustomMockedProvider mocks={mocks}>
      <LoginFrom
        location={{
          search: '?q=qqq',
        }}
      />
    </CustomMockedProvider>
  )
}

describe('<Login />', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should shows cellphone and password is required', async () => {
    const { getByTestId, getByText } = createWrapper()

    const submit = getByTestId('login-btn')

    fireEvent.click(submit)

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )

    expect(getByText('電話號碼為必填')).toBeTruthy()
    expect(getByText('密碼為必填')).toBeTruthy()
  })

  // 產品決策（2026-10-19 Jason 拍版）：電話不一定要 10 碼，LoginForm 不做 10～13 碼長度限制，只有 required。
  // 因此不再期待「電話號碼最少為 10 碼／最多為 13 碼」，改驗證非 10 碼的電話不會被長度規則擋下。
  it('should not limit cellphone length', async () => {
    const { getByTestId, queryByText } = createWrapper()

    const cellphone = getByTestId('cellphone')
    const submit = getByTestId('login-btn')

    fireEvent.change(cellphone, { target: { value: '091234567' } })
    fireEvent.click(submit)

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )

    expect(queryByText('電話號碼最少為 10 碼')).toBeNull()
    expect(queryByText('電話號碼為必填')).toBeNull()

    fireEvent.change(cellphone, { target: { value: '09123456789012' } })
    fireEvent.click(submit)

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    expect(queryByText('電話號碼最多為 13 碼')).toBeNull()
    expect(queryByText('電話號碼為必填')).toBeNull()
  })

  it('should login successful', async () => {
    const { getByTestId } = createWrapper()

    const cellphone = getByTestId('cellphone')
    const password = getByTestId('password')

    const submit = getByTestId('login-btn')

    fireEvent.change(cellphone, { target: { value: '0912345678' } })
    expect(cellphone.value).toEqual('0912345678')

    fireEvent.change(password, { target: { value: '123456' } })
    expect(password.value).toEqual('123456')

    fireEvent.click(submit)

    // 等 mutation 回應寫入 localStorage（固定 2ms 太短且不穩）
    await wait(() => expect(localStorage.getItem('user')).not.toBeNull())

    // setupTests 的 localStorage 假物件會再 JSON.stringify 一次，所以 parse 出來仍是字串
    const user = JSON.parse(localStorage.getItem('user'))
    // 登入成功後要留下 id（全站用它判斷登入、查個人資料），但手機號碼、uid、各店 solmateKey 不可存進 localStorage
    expect(JSON.parse(user)).toEqual({ id: 'id', name: 'name', isAdmin: false, isNeedChangePassword: false })
    expect(user).not.toMatch(/0912345678|solmateKey|userCode/)
  })
})
