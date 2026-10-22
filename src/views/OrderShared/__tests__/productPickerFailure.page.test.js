// 為什麼重要：店販「從清單選擇」的商品清單在帳單頁一載入就查詢；這個查詢失敗（網路、後端錯誤）不能讓整張帳單頁進入錯誤畫面，
// 店員仍要能打服務、結帳（錯誤提示由 init-apollo 的 errorLink 統一跳出）。
// 守住：打帳單頁在商品清單／商品分類查詢失敗時照常顯示，不出現錯誤畫面（2026/10/22 修正前整頁錯誤）。
// 其他三個帳單頁用同一個 useProductPicker（OrderShared/useItemPicker），hook 層的空清單行為見 useItemPicker.test.js。
// GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import OrderCreate from 'views/OrderCreate'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

// 打帳單頁一載入就要的店家設定（其餘查詢由模擬 link 自動回空資料）
const SETTINGS = {
  GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'DESIGNATE' },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }] },
  GET_ORDER_WITHOUT_CUSTOMER_SETTING: { orderWithoutCustomerDefault: true },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
}

beforeEach(() => loginAs())
afterEach(cleanup)

it('商品清單與分類查詢失敗：打帳單頁照常顯示，不進入錯誤畫面', async () => {
  const { calls, settle } = renderPage(<OrderCreate />, {
    // 商品清單查詢沒有命名（operationName 為 undefined）
    fixtures: { ...SETTINGS, undefined: new Error('網路錯誤'), PRODUCT_CATEGORIES: new Error('網路錯誤') },
    route: '/order/create',
  })
  await wait(() => expect(calls.some(c => c.operationName === undefined && c.variables.input && 'categoryIds' in c.variables.input)).toBe(true))
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByRole('button', { name: '結帳' })).toBeInTheDocument()
})
