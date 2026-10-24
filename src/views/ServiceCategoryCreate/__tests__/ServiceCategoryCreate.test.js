import React from 'react'
import CustomMockedProvider from 'components/CustomMockedProvider'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { CREATE_SERVICE_CATEGORY, mockServiceCreateRes } from 'hooks/useFetchServiceCategoryCreate'
import { Router } from 'react-router-dom'

import ServiceCategoryCreate from '../ServiceCategoryCreate'

// 頁面載入時會查「服務歸屬」選項；測試未提供該 query 的 mock，直接 mock hook 回傳選項
jest.mock('hooks/useFetchGetAttribution', () => ({
  __esModule: true,
  default: () => ({
    loading: false,
    data: { getAttribution: [{ name: '燙', value: '燙' }] },
  }),
}))

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }
const createWrapper = () => {
  const merchantId = window.localStorage.getItem('userMerchant')
    ? JSON.parse(window.localStorage.getItem('userMerchant')).id
    : null

  const mocks = [
    {
      request: {
        query: CREATE_SERVICE_CATEGORY,
        variables: {
          input: {
            no: 'testNo',
            name: 'testName',
            attribution: '燙',
            remark: '',
            OfficialBrandMerchantId: merchantId,
          },
        },
      },
      result: mockServiceCreateRes,
    },
  ]
  return render(
    <CustomMockedProvider mocks={mocks}>
      <Router history={historyMock}>
        <ServiceCategoryCreate />
      </Router>
    </CustomMockedProvider>
  )
}

describe('<ServiceCategoryCreate />', () => {
  beforeEach(() => {
    cleanup()
  })

  it('Should display no, name, attribution is required', async () => {
    const { getByText, getAllByText, getByTestId } = createWrapper()

    const submit = getByTestId('submit')

    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 0)
    )
    const requireNo = getByText('請填入代號')
    const requireName = getByText('請填入類別')
    // 預設歸屬「燙」同時出現在按鈕與選項清單
    expect(getAllByText('燙').length).toBeGreaterThan(0)

    expect(requireNo).toBeTruthy()
    expect(requireName).toBeTruthy()
  })

  it('Should create new service successful', async () => {
    const { getByTestId } = createWrapper()
    const submit = getByTestId('submit')
    const no = getByTestId('no')
    fireEvent.change(no, {
      target: {
        value: 'testNo',
      },
    })

    const name = getByTestId('name')
    fireEvent.change(name, {
      target: {
        value: 'testName',
      },
    })

    // 服務歸屬是 MUI Select（沒有 data-testid="attribution"），預設值即為 '燙'，不必操作

    fireEvent.click(submit)
    await new Promise(resolve =>
      setTimeout(() => {
        resolve()
      }, 200)
    )

    expect(historyMock.push).toBeCalled()
  })
})
