import React from 'react'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent, cleanup, wait } from '@testing-library/react'
import { REGISTER } from 'hooks/useFetchRegister'
import { Router } from 'react-router-dom'

import RegisterForm from '../RegisterForm'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }
const createWrapper = () => {
  const mocks = [
    {
      request: {
        query: REGISTER,
        variables: {
          input: {
            cellphone: '0912345678',
          },
        },
      },
      result: {
        data: {
          userSignup: true,
        },
      },
    },
  ]

  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <RegisterForm />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<RegisterForm />', () => {
  beforeEach(() => {
    cleanup()
  })
  it('should shows cellphone error', async () => {
    const { getByText, getByTestId } = createWrapper()
    const cellphone = getByTestId('cellphone')
    const submit = getByTestId('submit')

    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )

    const requirePhone = getByText('電話號碼為必填')

    expect(requirePhone).toBeTruthy()

    fireEvent.change(cellphone, {
      target: {
        value: '091234567',
      },
    })
    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    const moreThenTen = getByText('電話號碼最少為 10 碼')
    expect(moreThenTen).toBeTruthy()

    fireEvent.change(cellphone, {
      target: {
        value: '09123456789012',
      },
    })
    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    const lessThenTen = getByText('電話號碼最多為 13 碼')
    expect(lessThenTen).toBeTruthy()
  })

  it('should signup successful', async () => {
    const { getByTestId } = createWrapper()

    const cellphone = getByTestId('cellphone')
    const submit = getByTestId('submit')

    fireEvent.change(cellphone, {
      target: {
        value: '0912345678',
      },
    })

    fireEvent.click(submit)

    // 原本只等固定 2 毫秒：送出（驗證 → mutation → 導頁）比 2 毫秒慢時會誤判失敗，改為等到導頁發生（最久 4.5 秒）
    await wait(() => expect(historyMock.push).toBeCalled())
  })
})
