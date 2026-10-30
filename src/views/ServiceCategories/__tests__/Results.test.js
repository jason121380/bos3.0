import React from 'react'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent } from '@testing-library/react'
import { mockedServiceCateResp } from 'hooks/useFetchServiceCategories'
import { DEL_SERVICE_CATEGORIES, mockedDeleteServiceCategory } from 'hooks/useFetchDeleteServiceCategories'

import Results from '../Results'

const refetchCategories = jest.fn()

const createWrapper = mocks => {
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Results categories={mockedServiceCateResp.data.serviceCategories} refetchCategories={refetchCategories} />
    </CustomMockedProvider>
  )
}

describe('<Results />', () => {
  it('should render categories correctly', () => {
    const { getAllByTestId } = createWrapper()
    const categories = getAllByTestId('category-row')

    expect(categories.length).toBe(4)
  })

  it('shoud calls delete category API', async () => {
    const mocks = [
      {
        request: {
          query: DEL_SERVICE_CATEGORIES,
          variables: { categories: ['bc676423-4aae-4d65-9286-49728490a9af'] },
        },
        result: {
          ...mockedDeleteServiceCategory,
          refetch: refetchCategories,
        },
      },
    ]
    const { getByTestId } = createWrapper(mocks)
    const deleteButton = getByTestId('delete')
    const pickRowData = getByTestId('category-ㄑ-checkbox')

    expect(pickRowData.checked).toEqual(false)

    fireEvent.click(pickRowData)

    expect(pickRowData.checked).toEqual(true)

    fireEvent.click(deleteButton)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(refetchCategories).toHaveBeenCalled()
  })
})
