import React from 'react'
import { GET_SERVICE_CATEGORY, mockedServiceCategoryResp } from 'hooks/useFetchServiceCategory'
import { UPDATE_SERVICE_CATEGORY, updateServiceCategory } from 'hooks/useFetchUpdateServiceCategory'
import CustomMockedProvider from '__tests__/CustomMockedProvider.test'
import { render, fireEvent, within } from '@testing-library/react'
import { Router } from 'react-router-dom'

import ServiceCategoryEdit from '../ServiceCategoryEdit'

// 頁面載入時會查「服務歸屬」選項；測試未提供該 query 的 mock，直接 mock hook 回傳選項
jest.mock('hooks/useFetchGetAttribution', () => ({
  __esModule: true,
  default: () => ({
    loading: false,
    data: { getAttribution: [{ name: '燙', value: '燙' }] },
  }),
}))

// 服務歸屬改為 ui/form-control 的原生 select（2026/10/20 MUI 移除），依標籤找到下拉、以選項文字選取（斷言不變）
const chooseAttribution = (container, optionText) => {
  const select = within(container).getByLabelText('服務歸屬')
  const option = Array.from(select.options).find(o => o.textContent === optionText)
  fireEvent.change(select, { target: { value: option.value } })
}

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

const createWrapper = (mocks = []) => {
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <ServiceCategoryEdit match={{ params: { id: 'id' } }} />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<ServiceCategoryEdit />', () => {
  it('Should update service category successful', async () => {
    const mocks = [
      {
        request: {
          query: GET_SERVICE_CATEGORY,
          variables: { categoryId: 'id' },
        },
        result: mockedServiceCategoryResp,
      },
      {
        request: {
          query: UPDATE_SERVICE_CATEGORY,
          variables: {
            category: {
              itemId: '9f5db918-9af4-47a4-a9b2-cac7d96cfe30',
              no: 'test222',
              name: 'cdc222',
              attribution: '燙',
              remark: 'cd',
              isUsing: true,
            },
          },
        },
        result: updateServiceCategory,
      },
    ]

    const { getByTestId, container } = createWrapper(mocks)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    const no = getByTestId('no')
    const name = getByTestId('name')
    const save = getByTestId('save')

    fireEvent.change(no, {
      target: { value: 'test222' },
    })
    fireEvent.change(name, {
      target: { value: 'cdc222' },
    })
    chooseAttribution(container, '燙')

    expect(no.value).toEqual('test222')
    expect(name.value).toEqual('cdc222')
    fireEvent.click(save)

    await new Promise(resolve => setTimeout(() => resolve(), 200))
    expect(historyMock.push).toBeCalled()
  })

  it('should shows correct error', async () => {
    const mocks = [
      {
        request: {
          query: GET_SERVICE_CATEGORY,
          variables: { categoryId: 'id' },
        },
        result: mockedServiceCategoryResp,
      },
      {
        request: {
          query: UPDATE_SERVICE_CATEGORY,
          variables: {
            category: {
              itemId: '9f5db918-9af4-47a4-a9b2-cac7d96cfe30',
              no: 'test222',
              name: 'test222',
              attribution: '燙',
              remark: 'cd',
              isUsing: true,
            },
          },
        },
        result: updateServiceCategory,
      },
    ]

    const { getByTestId, getByText, queryByText, container } = createWrapper(mocks)
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
    chooseAttribution(container, 'None')

    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(getByText('代號為必填')).toBeTruthy()
    expect(getByText('類別為必填')).toBeTruthy()
    expect(getByText('請選擇服務')).toBeTruthy()

    fireEvent.change(no, {
      target: { value: 'test222' },
    })
    expect(no.value).toEqual('test222')
    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號為必填')).not.toBeInTheDocument()
    expect(getByText('類別為必填')).toBeInTheDocument()
    expect(getByText('請選擇服務')).toBeInTheDocument()

    fireEvent.change(name, {
      target: { value: 'test222' },
    })
    expect(name.value).toEqual('test222')
    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號為必填')).not.toBeInTheDocument()
    expect(queryByText('類別為必填')).not.toBeInTheDocument()
    expect(getByText('請選擇服務')).toBeInTheDocument()

    chooseAttribution(container, '燙')
    fireEvent.click(save)
    await new Promise(resolve => setTimeout(() => resolve(), 200))

    expect(queryByText('代號為必填')).not.toBeInTheDocument()
    expect(queryByText('類別為必填')).not.toBeInTheDocument()
    expect(queryByText('請選擇服務')).not.toBeInTheDocument()
  })
})
