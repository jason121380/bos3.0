import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { GET_PRODUCT_CATEGORY, mockedProductCategoryResp } from 'hooks/useFetchProductCategory'
import { GET_PRODUCT_CATEGORIES, mockedProductCateResp } from 'hooks/useFetchProductCategories'
import {
  UPDATE_PRODUCT_CATEGORY,
  mockedUpdateProductCategory,
} from 'hooks/useFetchUpdateProductCategory'
import { Router } from 'react-router-dom'

import ProductCategoryEdit from '../ProductCategoryEdit'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

const createWrapper = (mocks = []) => {
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <ProductCategoryEdit match={{ params: { id: 'id' } }} />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<ProductCategory />', () => {
  beforeEach(() => {
    cleanup()
  })
  it('should update product category successful', async () => {
    const mocks = [
      {
        request: {
          query: GET_PRODUCT_CATEGORY,
          variables: { categoryId: 'id' },
        },
        result: mockedProductCategoryResp,
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
      {
        request: {
          query: GET_PRODUCT_CATEGORIES,
          variables: { input: { paranoid: true } },
        },
        result: mockedProductCateResp,
      },
      {
        request: {
          query: UPDATE_PRODUCT_CATEGORY,
          variables: { input: { itemId: 'id', no: 'no', name: 'name' } },
        },
        result: mockedUpdateProductCategory,
      },
    ]
    const { getByTestId } = createWrapper(mocks)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    const no = getByTestId('no')
    const name = getByTestId('name')
    const save = getByTestId('save')

    fireEvent.change(no, {
      target: { value: 'no' },
    })
    fireEvent.change(name, {
      target: { value: 'name' },
    })

    expect(no.value).toEqual('no')
    expect(name.value).toEqual('name')
    fireEvent.click(save)

    await new Promise(resolve => setTimeout(() => resolve(), 200))
    expect(historyMock.push).toBeCalled()
  })

  it('should shows correct error', async () => {
    const mocks = [
      {
        request: {
          query: GET_PRODUCT_CATEGORY,
          variables: { categoryId: 'id' },
        },
        result: mockedProductCategoryResp,
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
      {
        request: {
          query: GET_PRODUCT_CATEGORIES,
          variables: { input: { paranoid: true } },
        },
        result: mockedProductCateResp,
      },
      {
        request: {
          query: UPDATE_PRODUCT_CATEGORY,
          variables: { input: { itemId: 'id', no: 'no', name: 'name' } },
        },
        result: mockedUpdateProductCategory,
      },
      {
        request: {
          query: UPDATE_PRODUCT_CATEGORY,
          variables: { input: { itemId: 'id', no: 'nooo', name: 'nameee' } },
        },
        result: mockedUpdateProductCategory,
      },
    ]
    const { getByTestId, getByText, queryByText } = createWrapper(mocks)
    await new Promise(resolve => setTimeout(() => resolve(), 200))
    const no = getByTestId('no')
    const name = getByTestId('name')
    const save = getByTestId('save')

    fireEvent.change(no, {
      target: { value: '' },
    })
    fireEvent.change(name, {
      target: { value: '' },
    })
    fireEvent.click(save)

    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(getByText('代號 為必填')).toBeTruthy()
    expect(getByText('名稱 為必填')).toBeTruthy()

    fireEvent.change(no, {
      target: { value: 'nooo' },
    })
    expect(no.value).toEqual('nooo')

    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號 為必填')).not.toBeInTheDocument()
    expect(getByText('名稱 為必填')).toBeInTheDocument()

    fireEvent.change(name, {
      target: { value: 'nameee' },
    })

    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號 為必填')).not.toBeInTheDocument()
    expect(queryByText('名稱 為必填')).not.toBeInTheDocument()
  })
})
