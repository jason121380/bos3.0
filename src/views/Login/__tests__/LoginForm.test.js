import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { LOGIN, mockedSuccessResp } from 'hooks/useFetchLogin'
import { mockedProfile, FETCH_PROFILE } from 'hooks/useFetchProfile'

import LoginFrom from '../LoginForm'

const createWrapper = () => {
  const mocks = [
    {
      request: {
        query: LOGIN,
        variables: {
          input: {
            cellphone: '0912345678',
            password: '123456',
          },
        },
      },
      result: mockedSuccessResp,
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

  it('shoud shows cellphone limit error', async () => {
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

    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 2)
    )

    const user = JSON.parse(localStorage.getItem('user'))
    const userLoginResp = JSON.stringify(mockedSuccessResp.data.userLogin)

    expect(user).toMatch(userLoginResp)
  })
})
