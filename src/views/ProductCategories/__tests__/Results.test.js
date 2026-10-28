import React from 'react'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent } from '@testing-library/react'
import { mockedProductCateResp } from 'hooks/useFetchProductCategories'
import {
  mockedDeleteProductCategory,
  DEL_PRODUCT_CATEGORY,
} from 'hooks/useFetchDeleteProductCategory'

import Results from '../Results'

const refetchCategories = jest.fn()
const createWrapper = mocks => {
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Results
        categories={mockedProductCateResp.data.productCategories}
        refetchCategories={refetchCategories}
      />
    </CustomMockedProvider>
  )
}

describe('<Results />', () => {
  it('should render categories correctly', () => {
    const { getAllByTestId } = createWrapper()
    const categories = getAllByTestId('category-row')

    expect(categories.length).toBe(10)
  })
  it('shoud calls delete category API', async () => {
    const mocks = [
      {
        request: {
          query: DEL_PRODUCT_CATEGORY,
          variables: { itemIds: ['94fa7482-de4e-427f-b0d0-bda65a1c03e9'] },
        },
        result: {
          ...mockedDeleteProductCategory,
          refetch: refetchCategories,
        },
      },
    ]

    const { getByTestId } = createWrapper(mocks)
    const deleteButton = getByTestId('delete')
    const pickRowData = getByTestId('category-Napla-checkbox')

    expect(pickRowData.checked).toEqual(false)

    fireEvent.click(pickRowData)

    expect(pickRowData.checked).toEqual(true)

    fireEvent.click(deleteButton)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(refetchCategories).toHaveBeenCalled()
  })
})
