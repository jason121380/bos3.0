import React from 'react'
import { gql } from '@apollo/client'
import { GET_PRODUCT_CATEGORIES } from 'hooks/useFetchProductCategories'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent } from '@testing-library/react'
import { mockedProducts, GET_PRODUCT } from 'hooks/useFetchProducts'
import { mockedDeleteProduct, DEL_PRODUCTS } from 'hooks/useFetchDeleteProducts'

import Results from '../Results'

// Results 載入時會查廠商清單，測試未提供該 query 的 mock（查詢失敗時 data 為 undefined 會讓畫面報錯），直接 mock hook
jest.mock('hooks/useFetchGetVendor', () => ({
  __esModule: true,
  default: () => ({ loading: false, data: {} }),
  useFetchGetMerchantVendorList: () => ({
    loading: false,
    data: { getMerchantVendorList: [] },
  }),
}))

const GET_MERCHANT_PASSWORD = gql`
  query GET_MERCHANT_PASSWORD {
    merchantPassword {
      superPassword
      reCheckoutOrder {
        password
        isUsing
      }
      deleteOrder {
        password
        isUsing
      }
      restoreCheckout {
        password
        isUsing
      }
      deleteProduct {
        password
        isUsing
      }
      deleteCustomer {
        password
        isUsing
      }
      deleteService {
        password
        isUsing
      }
      editMoneyFlow {
        password
        isUsing
      }
      purchaseStockIn {
        password
        isUsing
      }
      purchaseStockInUndo {
        password
        isUsing
      }
      cancelReservation {
        password
        isUsing
      }
    }
  }
`
const GET_PRODUCT_COST_IS_DISPLAY = gql`
  query GET_PRODUCT_COST_IS_DISPLAY {
    getIsProductCostDisplay
  }
`

const mockedRefetch = jest.fn()

const createWrapper = mocks => {
  return render(
    <CustomMockedProvider mocks={[...mocks,
      { request: { query: GET_MERCHANT_PASSWORD }, result: { data: { merchantPassword: {
        superPassword: '', ...Object.fromEntries(['reCheckoutOrder', 'deleteOrder', 'restoreCheckout', 'deleteProduct', 'deleteCustomer', 'deleteService', 'editMoneyFlow', 'purchaseStockIn', 'purchaseStockInUndo', 'cancelReservation'].map(key => [key, { password: '', isUsing: false }]))
      } } } },
      { request: { query: GET_PRODUCT_COST_IS_DISPLAY }, result: { data: { getIsProductCostDisplay: false } } },
      { request: { query: GET_PRODUCT_CATEGORIES, variables: { input: { paranoid: true } } }, result: { data: { productCategories: [] } } },
    ]}>
      <Results
        products={{
          data: mockedProducts.data.products,
          totalCount: mockedProducts.data.products.length,
          pageOffset: 0,
          pageLimit: 10,
        }}
        refetchProducts={mockedRefetch}
      />
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
    const { getByTestId, getByRole } = createWrapper(mocks)

    const rowDataPick = getByTestId('product-JuliArt 控油洗髮精-checkbox')
    expect(rowDataPick.checked).toEqual(false)

    fireEvent.click(rowDataPick)

    expect(rowDataPick.checked).toEqual(true)

    // 批次操作列的「刪除」按鈕沒有 data-testid（改版前也沒有），且勾選前列是 hidden，勾選後以角色與文字取得
    const deleteButton = getByRole('button', { name: '刪除' })
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(mockedRefetch).toHaveBeenCalled()
  })
})
