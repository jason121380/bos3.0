import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WebOrderManagementList from '..'

// 為什麼重要：預約管理的篩選面板只有「報到狀態」一項，且只在店家開啟報到功能時出現。
// 未開啟報到的店家按「篩選」只會展開一張空白卡片（Jason 2026/10/21 截圖），因此不應出現篩選鈕。

let mockCheckinEnabled
jest.mock('hooks/useFetchGetBookingManagement', () => () => ({ loading: false, refetch: () => {}, data: { bookingManagement: { bookings: [], count: 0, pageLimit: 1000, pageOffset: 0 } } }))
jest.mock('hooks/useFetchGetMerchantCheckinSettings', () => ({
  __esModule: true,
  default: () => ({}),
  useFetchGetCheckinSettingsForManagementList: () => ({ loading: false, data: { getMerchantCheckinSettings: { isBookingCheckinEnabled: mockCheckinEnabled } } }),
}))
jest.mock('hooks/useFetchGetIsBookingCusCheckUsing', () => () => ({ loading: false, data: { getIsBookingCusCheckUsing: false } }))
jest.mock('hooks/useFetchMerchantPassword', () => ({
  __esModule: true,
  default: () => ({}),
  useFetchGetDeleteOrderUsing: () => ({ loading: false, data: { merchantPassword: { deleteOrder: { isUsing: false } } } }),
}))
jest.mock('hooks/useFetchGetCustomerDataMarkedDefault', () => () => ({ loading: false, data: { getCustomerDataMarkedDefault: true } }))
jest.mock('../Results', () => () => <div>results</div>)

beforeEach(() => localStorage.setItem('userMerchant', JSON.stringify({ id: 'm1', name: '測試店' })))

const renderPage = () => render(<MemoryRouter><WebOrderManagementList /></MemoryRouter>)

test('店家未開啟報到功能：不顯示篩選鈕', () => {
  mockCheckinEnabled = false
  renderPage()
  expect(screen.queryByRole('button', { name: /篩選/ })).toBeNull()
  expect(screen.getByText('新預約')).toBeTruthy()
})

test('店家開啟報到功能：顯示篩選鈕', () => {
  mockCheckinEnabled = true
  renderPage()
  expect(screen.getByRole('button', { name: /篩選/ })).toBeTruthy()
})
