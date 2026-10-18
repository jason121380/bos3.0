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

  // LoginForm 目前沒有電話長度驗證（改版前 c41b604 就沒有，只有 required）。
  // 若產品要恢復 10～13 碼限制，需先在元件加入驗證再移除 skip（待 Jason 決定）。
  it.skip('shoud shows cellphone limit error', async () => {
    const { getByTestId, getByText } = createWrapper()

    const cellphone = getByTestId('cellphone')
    const submit = getByTestId('login-btn')

    fireEvent.change(cellphone, { target: { value: '091234567' } })
    fireEvent.click(submit)

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )

    expect(getByText('電話號碼最少為 10 碼')).toBeTruthy()

    fireEvent.change(cellphone, { target: { value: '09123456789012' } })
    fireEvent.click(submit)

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    expect(getByText('電話號碼最多為 13 碼')).toBeTruthy()
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

    const user = JSON.parse(localStorage.getItem('user'))
    const userLoginResp = JSON.stringify(mockedSuccessResp.data.userLoginV2)

    expect(user).toMatch(userLoginResp)
  })
})
