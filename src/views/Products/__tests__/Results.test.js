import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent } from '@testing-library/react'
import { mockedProducts, GET_PRODUCT } from 'hooks/useFetchProducts'
import { mockedDeleteProduct, DEL_PRODUCTS } from 'hooks/useFetchDeleteProducts'

import Results from '../Results'

const mockedRefetch = jest.fn()

const createWrapper = mocks => {
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Results products={mockedProducts.data.products} refetchProducts={mockedRefetch} />
    </CustomMockedProvider>
  )
}

describe('<Results />', () => {
  it('should shows products correctly', () => {
    const mocks = [
      {
        request: {
          query: GET_PRODUCT,
        },
        result: mockedProducts,
      },
    ]
    const { getAllByTestId } = createWrapper(mocks)
    const produstList = getAllByTestId('product-row')

    expect(produstList.length).toEqual(5)
  })

  it('should calls delete API', async () => {
    const mocks = [
      {
        request: {
          query: DEL_PRODUCTS,
          variables: { itemIds: ['61ad4ad1-5bc7-4831-8d88-a8e1ea414fc6'] },
        },
        result: mockedDeleteProduct,
      },
    ]
    const { getByTestId } = createWrapper(mocks)

    const rowDataPick = getByTestId('product-JuliArt 控油洗髮精-checkbox')
    const deleteButton = getByTestId('delete')

    expect(rowDataPick.checked).toEqual(false)

    fireEvent.click(rowDataPick)

    expect(rowDataPick.checked).toEqual(true)

    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(mockedRefetch).toHaveBeenCalled()
  })
})
