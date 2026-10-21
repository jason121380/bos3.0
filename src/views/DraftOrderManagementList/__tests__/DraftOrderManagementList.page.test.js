// 保護「掛單列表」的報表匯出：店家設定遮罩客資時，匯出檔的姓名與手機必須遮罩——即使遮罩設定比掛單資料晚回來。
// 為什麼重要：匯出檔會被下載、轉寄；原本設定晚到時匯出的是完整姓名與手機（個資外洩，2026/10/21 修正）。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import DraftOrderManagementList from '..'

jest.setTimeout(20000)

const pendingOrder = {
  id: 'd-1',
  no: 'D001',
  date: new Date(2026, 9, 21, 11, 5).getTime(),
  isDesignate: true,
  businessCash: 1200,
  customer: { id: 'c-1', name: '陳小姐', cellphone: '0912345678', no: 'C01' },
  designer: { id: 'u-1', name: '王小美', designerNo: '01', nickName: '', firstName: '', lastName: '' },
}

beforeEach(() => loginAs())
afterEach(cleanup)

const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))

it('遮罩設定查詢失敗時，匯出檔仍遮罩（設定不明一律當作要遮罩）', async () => {
  const { settle } = renderPage(<DraftOrderManagementList />, {
    fixtures: {
      FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 50, pageOffset: 0, totalCount: 1, orders: [pendingOrder] } },
      GET_CUSTOMER_DATA_MARKED: new Error('設定查詢失敗'),
    },
    route: '/management/draft-orders',
  })
  await settle()
  expect(exportedCsv()).toContain('陳*姐 0912***678')
  expect(exportedCsv()).not.toContain('0912345678')
})

it('遮罩設定比掛單資料晚回來時，匯出檔的姓名電話仍要遮罩', async () => {
  const { settle } = renderPage(<DraftOrderManagementList />, {
    fixtures: {
      FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 50, pageOffset: 0, totalCount: 1, orders: [pendingOrder] } },
      GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true },
    },
    delays: { GET_CUSTOMER_DATA_MARKED: 50 },
    route: '/management/draft-orders',
  })
  await settle()
  await wait(() => expect(exportedCsv()).toContain('陳*姐 0912***678'))
  expect(exportedCsv()).not.toContain('0912345678')
})
