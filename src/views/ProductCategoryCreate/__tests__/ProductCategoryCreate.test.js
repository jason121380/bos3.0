import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent } from '@testing-library/react'
import {
  CREATE_PRODUCT_CATEGORY,
  mockedCreateProductCateResp,
} from 'hooks/useFetchCreateProductCategory'
import { GET_PRODUCT_CATEGORIES, mockedProductCateResp } from 'hooks/useFetchProductCategories'
import { Router } from 'react-router-dom'

import ProductCategoryCreate from '../ProductCategoryCreate'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }
const createWrapper = () => {
  const mocks = [
    {
      request: {
        query: CREATE_PRODUCT_CATEGORY,
        variables: { input: { no: 'no', name: 'name', OfficialBrandMerchantId: 'id' } },
      },
      result: mockedCreateProductCateResp,
    },
    {
      request: {
        query: GET_PRODUCT_CATEGORIES,
        variables: { input: { paranoid: true } },
      },
      result: mockedProductCateResp,
    },
    {
      request: {
        query: GET_PRODUCT_CATEGORIES,
        variables: { input: { paranoid: true } },
      },
      result: mockedProductCateResp,
    },
  ]
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <ProductCategoryCreate />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<ProductCategoryCreate />', () => {
  beforeEach(() => {
    localStorage.setItem('userMerchant', {
      id: 'id',
    })
  })
  it('should create product category successful', async () => {
    const { getByTestId } = createWrapper()

    const no = getByTestId('no')
    const name = getByTestId('name')
    const submitCreate = getByTestId('submit-create')

    fireEvent.change(no, {
      target: {
        value: 'no',
      },
    })
    fireEvent.change(name, {
      target: {
        value: 'name',
      },
    })
    fireEvent.click(submitCreate)

    await new Promise(resolve => setTimeout(() => resolve(), 200))
    expect(historyMock.push).toBeCalled()
  })
})
