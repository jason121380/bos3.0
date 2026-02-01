import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { CREATE_SERVICE_CATEGORY, mockServiceCreateRes } from 'hooks/useFetchServiceCategoryCreate'
import { Router } from 'react-router-dom'

import ServiceCategoryCreate from '../ServiceCategoryCreate'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }
const createWrapper = () => {
  const merchantId = window.localStorage.getItem('userMerchant')
    ? JSON.parse(window.localStorage.getItem('userMerchant')).id
    : null

  const mocks = [
    {
      request: {
        query: CREATE_SERVICE_CATEGORY,
        variables: {
          input: {
            no: 'testNo',
            name: 'testName',
            attribution: '燙',
            remark: '',
            OfficialBrandMerchantId: merchantId,
          },
        },
      },
      result: mockServiceCreateRes,
    },
  ]
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <ServiceCategoryCreate />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<ServiceCategoryCreate />', () => {
  beforeEach(() => {
    cleanup()
  })

  it('Should display no, name, attribution is required', async () => {
    const { getByText, getByTestId } = createWrapper()

    const submit = getByTestId('submit')

    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    const requireNo = getByText('請填入代號')
    const requireName = getByText('請填入類別')
    const requireAttribution = getByText('燙')

    expect(requireNo).toBeTruthy()
    expect(requireName).toBeTruthy()
    expect(requireAttribution).toBeTruthy()
  })

  it('Should create new service successful', async () => {
    const { getByTestId } = createWrapper()
    const submit = getByTestId('submit')
    const no = getByTestId('no')
    fireEvent.change(no, {
      target: {
        value: 'testNo',
      },
    })

    const name = getByTestId('name')
    fireEvent.change(name, {
      target: {
        value: 'testName',
      },
    })

    const attribution = getByTestId('attribution')
    fireEvent.change(attribution, {
      target: {
        value: '燙',
      },
    })

    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 200)
    )

    expect(historyMock.push).toBeCalled()
  })
})
