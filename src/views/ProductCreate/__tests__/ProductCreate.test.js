import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react'
import {
  GET_CUSTOMER_CATEGORY,
  mockedMerchantCustomerCategory,
} from 'hooks/useFetchMerchantCustomerCategory'
import { mockedProducts, GET_PRODUCT } from 'hooks/useFetchProducts'
import { mockedProductCateResp, GET_PRODUCT_CATEGORIES } from 'hooks/useFetchProductCategories'
import userEvent from '@testing-library/user-event'
import { mockedCreateProduct, CREATE_PRODUCT } from 'hooks/useFetchCreateProduct'

import ProductCreate from '../ProductCreate'

const createWrapper = mocks =>
  render(
    <CustomMockedProvider mocks={mocks}>
      <ProductCreate />
    </CustomMockedProvider>
  )

describe('<ProductCreate />', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    cleanup()
    localStorage.clear()
    localStorage.setItem(
      'userMerchant',
      JSON.stringify({
        id: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
      })
    )
  })
  it('should submit successful', async () => {
    const mocks = [
      {
        request: {
          query: GET_CUSTOMER_CATEGORY,
        },
        result: mockedMerchantCustomerCategory,
      },
      {
        request: {
          query: GET_PRODUCT,
        },
        result: mockedProducts,
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
          query: CREATE_PRODUCT,
        },
        result: mockedCreateProduct,
      },
    ]
    const { getByTestId, container, getByText, getAllByRole } = createWrapper(mocks)

    const no = getByTestId('no')
    fireEvent.change(no, { target: { value: 'no' } })

    expect(no.value).toBe('no')

    const name = getByTestId('name')
    fireEvent.change(name, { target: { value: 'name' } })

    expect(name.value).toBe('name')

    const ProductCategoryId = getByTestId('ProductCategoryId')
    fireEvent.click(ProductCategoryId)
    userEvent.click(getAllByRole('button')[0])
    await waitForElement(() => getByText('哥德式'), { container })
    const productCategoryItem = getByText('哥德式')
    userEvent.click(productCategoryItem)

    expect(productCategoryItem).toBeInTheDocument()

    const cost = getByTestId('cost')
    fireEvent.change(cost, { target: { value: '100' } })

    expect(cost.value).toBe('100')

    const sellPrice = getByTestId('sellPrice')
    fireEvent.change(sellPrice, { target: { value: '110' } })

    expect(sellPrice.value).toBe('110')

    const employeePrice = getByTestId('employeePrice')
    fireEvent.change(employeePrice, { target: { value: '105' } })

    expect(employeePrice.value).toBe('105')

    userEvent.click(getAllByRole('button')[1])
    await waitForElement(() => getByText('瓶'), { container })
    const stockUnitItem = getByText('瓶')
    userEvent.click(stockUnitItem)

    expect(stockUnitItem).toBeInTheDocument()

    const safeHigh = getByTestId('safeHigh')
    fireEvent.change(safeHigh, { target: { value: '110' } })

    expect(safeHigh.value).toBe('110')

    const safeLow = getByTestId('safeLow')
    fireEvent.change(safeLow, { target: { value: '110' } })

    expect(safeLow.value).toBe('110')

    userEvent.click(getAllByRole('button')[2])
    await waitForElement(() => getByText('固定金額'), { container })
    const commissionWay = getByText('固定金額')
    userEvent.click(commissionWay)

    expect(commissionWay).toBeInTheDocument()

    const commission = getByTestId('commission')
    fireEvent.change(commission, {
      target: {
        value: '100',
      },
    })

    expect(commission.value).toBe('100')

    mockedMerchantCustomerCategory.data.merchantCustomerCategory.forEach(({ name }) => {
      const customerCategory = getByTestId(name)
      fireEvent.change(customerCategory, {
        target: {
          value: '100',
        },
      })

      expect(customerCategory.value).toBe('100')
    })
    const submit = getByTestId('submit')
    fireEvent.click(submit)
  })

  it('should shows correct errors', async () => {
    const mocks = [
      {
        request: {
          query: GET_CUSTOMER_CATEGORY,
        },
        result: mockedMerchantCustomerCategory,
      },
      {
        request: {
          query: GET_CUSTOMER_CATEGORY,
        },
        result: mockedMerchantCustomerCategory,
      },
      {
        request: {
          query: GET_PRODUCT,
        },
        result: mockedProducts,
      },
      {
        request: {
          query: GET_PRODUCT,
        },
        result: mockedProducts,
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
          query: CREATE_PRODUCT,
          variables: {
            input: {
              no: 'no',
              name: 'name',
              cost: 9,
              sellPrice: 11,
              employeePrice: 10,
              safeHigh: 0,
              safeLow: 0,
              commission: 0,
              ProductCategoryId: '2a03df30-433a-4515-b65e-e14deeee00dc',
              stockUnit: '瓶',
              commissionWay: 'fixed',
              customerSellSetting: [
                { price: 100, category: '一般' },
                { price: 100, category: '不一般' },
              ],
            },
          },
        },
        result: mockedCreateProduct,
      },
    ]

    const { getByTestId, getByText, queryByText, getAllByRole, container } = createWrapper(mocks)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    const submit = getByTestId('submit')
    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號 為必填')).toBeInTheDocument()
    expect(queryByText('名稱 為必填')).toBeInTheDocument()
    expect(queryByText('商品類別 為必填')).toBeInTheDocument()
    expect(queryByText('店販售價 必須大於「成本價格」')).toBeInTheDocument()
    expect(queryByText('抽成方式 為必填')).toBeInTheDocument()

    mockedMerchantCustomerCategory.data.merchantCustomerCategory.forEach(({ name }) => {
      expect(queryByText(`${name} 必須大於 0`)).toBeInTheDocument()
    })

    const no = getByTestId('no')
    fireEvent.change(no, {
      target: {
        value: 'no',
      },
    })

    expect(no.value).toBe('no')

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號 為必填')).toBeNull()

    const name = getByTestId('name')
    fireEvent.change(name, {
      target: { value: 'name' },
    })
    expect(name.value).toBe('name')

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('名稱 為必填')).toBeNull()

    const ProductCategoryId = getByTestId('ProductCategoryId')
    fireEvent.click(ProductCategoryId)
    userEvent.click(getAllByRole('button')[0])
    await waitForElement(() => getByText('哥德式'), { container })
    const productCategoryItem = getByText('哥德式')
    userEvent.click(productCategoryItem)

    expect(productCategoryItem).toBeInTheDocument()

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('商品類別 為必填')).toBeNull()

    const cost = getByTestId('cost')
    fireEvent.change(cost, {
      target: {
        value: '9',
      },
    })

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    const sellPrice = getByTestId('sellPrice')
    fireEvent.change(sellPrice, { target: { value: '11' } })

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('店販售價 必須大於「成本價格」')).toBeNull()

    const employeePrice = getByTestId('employeePrice')
    fireEvent.change(employeePrice, { target: { value: '10' } })

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    userEvent.click(getAllByRole('button')[1])
    await waitForElement(() => getByText('瓶'), { container })
    const stockUnitItem = getByText('瓶')
    userEvent.click(stockUnitItem)

    expect(stockUnitItem).toBeInTheDocument()

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('庫存單位 為必填')).toBeNull()

    mockedMerchantCustomerCategory.data.merchantCustomerCategory.forEach(async ({ name }) => {
      const category = getByTestId(name)
      fireEvent.change(category, { target: { value: '100' } })

      fireEvent.click(submit)
      await new Promise(resolve => setTimeout(() => resolve(), 200))
      expect(queryByText(`${name} 必須大於 0`)).toBeNull()
    })

    userEvent.click(getAllByRole('button')[2])
    await waitForElement(() => getByText('固定金額'), { container })
    const commissionWay = getByText('固定金額')
    userEvent.click(commissionWay)

    expect(commissionWay).toBeInTheDocument()

    fireEvent.click(submit)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('抽成方式 為必填')).toBeNull()
  })
})
