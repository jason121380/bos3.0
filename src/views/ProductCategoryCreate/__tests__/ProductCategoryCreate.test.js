import React from 'react'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent } from '@testing-library/react'
import { CREATE_PRODUCT_CATEGORY, mockedCreateProductCateResp } from 'hooks/useFetchCreateProductCategory'
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
    localStorage.setItem(
      'userMerchant',
      JSON.stringify({
        id: 'id',
      })
    )
  })
  it('should create product category successful', async () => {
    const { getByTestId } = createWrapper()

    const no = getByTestId('no')
    const name = getByTestId('name')
    // 與編輯頁共用欄位元件後，新增頁的欄位 id 仍維持 product-category-create-*（2026/10/30 抽共用）
    expect(no).toHaveAttribute('id', 'product-category-create-no')
    expect(name).toHaveAttribute('id', 'product-category-create-name')
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
