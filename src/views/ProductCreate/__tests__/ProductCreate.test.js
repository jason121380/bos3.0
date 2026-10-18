import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, cleanup, wait, within } from '@testing-library/react'
import {
  GET_CUSTOMER_CATEGORY,
  mockedMerchantCustomerCategory,
} from 'hooks/useFetchMerchantCustomerCategory'
import { mockedProductCateResp, GET_PRODUCT_CATEGORIES } from 'hooks/useFetchProductCategories'

import ProductCreate from '../ProductCreate'

const mockCreateProduct = jest.fn()

// 以下三個 hook 沒有在測試中提供 query mock（查詢失敗會讓畫面拿到 undefined），直接 mock hook
jest.mock('hooks/useFetchCreateProduct', () => ({
  __esModule: true,
  default: () => ({ createProduct: (...args) => mockCreateProduct(...args) }),
}))
jest.mock('hooks/useFetchGetVendor', () => ({
  __esModule: true,
  useFetchGetMerchantVendorList: () => ({
    loading: false,
    data: { getMerchantVendorList: [] },
  }),
}))
jest.mock('hooks/useFetchGetParameterAboutSettingFunction', () => ({
  __esModule: true,
  useFetchGetisUnlimProdEmpPrice: () => ({
    loading: false,
    data: { getParameterAboutSettingFunction: { isUnlimProdEmpPrice: false } },
  }),
}))

// 商品類別、庫存單位、抽成方式都是 MUI Select（沒有可用的 data-testid），
// 依畫面順序：0 商品類別、1 庫存單位、2 打帳單是否能更改預設價格、3 抽成方式
const SELECT_INDEX = { category: 0, stockUnit: 1, commissionWay: 3 }
const chooseOption = (container, which, optionText) => {
  const selects = container.querySelectorAll('[aria-haspopup="listbox"]')
  fireEvent.mouseDown(selects[SELECT_INDEX[which]])
  fireEvent.click(within(document.body).getByRole('option', { name: optionText }))
}

const baseMocks = () => {
  const one = [
    {
      request: {
        query: GET_CUSTOMER_CATEGORY,
        variables: { merchantId: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603' },
      },
      result: mockedMerchantCustomerCategory,
    },
    {
      request: {
        query: GET_PRODUCT_CATEGORIES,
        variables: { input: { paranoid: true } },
      },
      result: mockedProductCateResp,
    },
  ]
  // 元件重新渲染時會再查一次，多給一份
  return [...one, ...one]
}

const createWrapper = () =>
  render(
    <CustomMockedProvider mocks={baseMocks()}>
      <ProductCreate />
    </CustomMockedProvider>
  )

const firstCategory = mockedProductCateResp.data.productCategories[0]
const firstCategoryText = `${firstCategory.no} ${firstCategory.name}`

const settle = () => new Promise(resolve => setTimeout(() => resolve(), 200))

describe('<ProductCreate />', () => {
  beforeEach(() => {
    mockCreateProduct.mockReset()
    cleanup()
    localStorage.clear()
    // setupTests 的 localStorage mock 的 setItem 會自行 JSON.stringify，所以直接傳物件
    localStorage.setItem('userMerchant', {
      id: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
    })
  })

  it('should submit successful', async () => {
    mockCreateProduct.mockResolvedValue({ data: { createProduct: true } })
    const { getByTestId, container } = createWrapper()
    await settle()

    fireEvent.change(getByTestId('no'), { target: { value: 'no' } })
    fireEvent.change(getByTestId('name'), { target: { value: 'name' } })
    chooseOption(container, 'category', firstCategoryText)
    fireEvent.change(getByTestId('cost'), { target: { value: '100' } })
    fireEvent.change(getByTestId('sellPrice'), { target: { value: '110' } })
    fireEvent.change(getByTestId('employeePrice'), { target: { value: '105' } })
    chooseOption(container, 'stockUnit', '瓶')
    chooseOption(container, 'commissionWay', '固定金額')
    fireEvent.change(getByTestId('commission'), { target: { value: '100' } })

    fireEvent.click(getByTestId('submit'))
    await wait(() => expect(mockCreateProduct).toHaveBeenCalledTimes(1))

    const { input } = mockCreateProduct.mock.calls[0][0]
    expect(input).toMatchObject({
      no: 'no',
      name: 'name',
      ProductCategoryId: firstCategory.id,
      cost: 100,
      sellPrice: 110,
      employeePrice: 105,
      stockUnit: '瓶',
      commissionWay: 'fixed',
      commission: 100,
      OfficialBrandMerchantId: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
    })
  })

  it('should shows correct errors', async () => {
    const { getByTestId, queryByText, container } = createWrapper()
    await settle()

    const submit = getByTestId('submit')
    fireEvent.click(submit)
    await settle()

    // 代號、成本價格目前不是必填（原始碼中的 required 已註解，改版前即如此）
    expect(queryByText('名稱 為必填')).toBeInTheDocument()
    expect(queryByText('商品類別 為必填')).toBeInTheDocument()
    expect(queryByText('庫存單位 為必填')).toBeInTheDocument()
    expect(mockCreateProduct).not.toHaveBeenCalled()

    fireEvent.change(getByTestId('name'), { target: { value: 'name' } })
    fireEvent.click(submit)
    await settle()
    expect(queryByText('名稱 為必填')).toBeNull()

    chooseOption(container, 'category', firstCategoryText)
    fireEvent.click(submit)
    await settle()
    expect(queryByText('商品類別 為必填')).toBeNull()

    chooseOption(container, 'stockUnit', '瓶')
    fireEvent.click(submit)
    await settle()
    expect(queryByText('庫存單位 為必填')).toBeNull()

    // 店販售價的 min 驗證。注意：min 的下限是「成本價格」，但 react-hook-form v6 不會因 re-render 更新已註冊欄位的規則，
    // 實測下限停留在初始成本 0（cost=9、sellPrice=5 不會報錯）——疑似元件行為問題，已列在 PR 說明待 Jason 決定，此處不改邏輯，
    // 所以只驗證 sellPrice < 0 會報錯。
    fireEvent.change(getByTestId('cost'), { target: { value: '9' } })
    fireEvent.change(getByTestId('sellPrice'), { target: { value: '-1' } })
    await settle()
    expect(queryByText('店販售價 必須至少等於「成本價格」')).toBeInTheDocument()

    fireEvent.change(getByTestId('sellPrice'), { target: { value: '11' } })
    await settle()
    expect(queryByText('店販售價 必須至少等於「成本價格」')).toBeNull()

    // 其他欄位都通過，但沒選抽成方式：onSubmit 會擋下並以 snackbar 提示，不呼叫 API
    fireEvent.click(submit)
    await settle()
    expect(mockCreateProduct).not.toHaveBeenCalled()
  })
})
