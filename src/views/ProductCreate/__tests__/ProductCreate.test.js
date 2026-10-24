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

// 商品類別、庫存單位、抽成方式改為 ui/form-control 的原生 select（2026/10/20 MUI 移除），
// 依欄位上方標籤找到下拉、以選項文字選取（只改「怎麼選」，斷言不變）
const SELECT_LABEL = { category: '商品類別', stockUnit: '庫存單位', commissionWay: '抽成方式' }
const chooseOption = (container, which, optionText) => {
  const select = within(container).getByLabelText(SELECT_LABEL[which])
  const option = Array.from(select.options).find(o => o.textContent === optionText)
  fireEvent.change(select, { target: { value: option.value } })
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
    localStorage.setItem('userMerchant', JSON.stringify({
      id: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
    }))
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

    // 產品決策（2026-10-19 Jason 拍版）：店販售價可以低於成本，不做 sellPrice >= cost 驗證。
    // 註：AboutProduct.js 的 min.value=watchList.cost 因 react-hook-form v6 不會重新註冊而停在初始成本 0，
    // 實際只擋 sellPrice < 0（錯誤訊息沿用該 min 的文字）。該設定視為過時，本批不改元件，只在文件標註。
    fireEvent.change(getByTestId('cost'), { target: { value: '9' } })
    fireEvent.change(getByTestId('sellPrice'), { target: { value: '5' } })
    await settle()
    expect(queryByText('店販售價 必須至少等於「成本價格」')).toBeNull()

    // 負數仍會被擋
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
