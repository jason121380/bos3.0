// 保護「商品分類設定」：停用中的分類不可勾選、全選只選啟用中的且可一鍵取消；刪除送出所選分類 id、成功後重查並清空勾選、
// 失敗提示錯誤；變更時間以台灣時間顯示。GraphQL 全由 testkit 模擬，不連後端、不刪真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, loginAs, renderPage } from '../../../__tests__/testkit.test'
import ProductCategories from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const UPDATED = Date.UTC(2026, 9, 20, 16, 30)
const CATEGORIES = [
  { id: 'cat-1', no: 'C1', name: '洗髮', isUsing: true, updatedAt: UPDATED, creator: { name: '店長' } },
  { id: 'cat-2', no: 'C2', name: '舊分類', isUsing: false, updatedAt: UPDATED, creator: null },
  { id: 'cat-3', no: 'C3', name: '護髮', isUsing: true, updatedAt: UPDATED, creator: { name: '店長' } },
]

const renderList = overrides =>
  renderPage(<ProductCategories />, {
    fixtures: {
      PRODUCT_CATEGORIES: { productCategories: CATEGORIES },
      DEL_PRODUCT_CATEGORY: { deleteProductCategory: true },
      ...overrides,
    },
  })

const rowOf = name => screen.getByText(name).closest('tr')
const selectAll = () => screen.getByRole('checkbox', { name: '全選' })

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('商品分類設定', () => {
  it('列出分類與變更時間（台灣時間）、停用中的分類不可勾選', async () => {
    const { settle } = renderList()
    await settle()
    expect(screen.getByText('共 3 筆資料')).toBeInTheDocument()
    expect(within(rowOf('洗髮')).getByText('2026/10/21')).toBeInTheDocument()
    expect(within(rowOf('舊分類')).getByRole('checkbox')).toBeDisabled()
    expect(within(rowOf('洗髮')).getByRole('link', { name: '編輯類別' })).toHaveAttribute('href', '/product/category/edit/cat-1')
  })

  it('全選只選啟用中的分類；全選狀態下再按一次取消全部；逐一取消勾選', async () => {
    const { settle } = renderList()
    await settle()
    fireEvent.click(selectAll())
    expect(within(rowOf('洗髮')).getByRole('checkbox')).toBeChecked()
    expect(within(rowOf('護髮')).getByRole('checkbox')).toBeChecked()
    expect(selectAll()).toBeChecked()
    fireEvent.click(selectAll())
    expect(within(rowOf('洗髮')).getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(within(rowOf('護髮')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('護髮')).getByRole('checkbox'))
    expect(within(rowOf('護髮')).getByRole('checkbox')).not.toBeChecked()
  })

  it('刪除：送出所選分類 id，成功提示並重查；失敗提示錯誤', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(within(rowOf('護髮')).getByRole('checkbox'))
    const before = callsOf(calls, 'PRODUCT_CATEGORIES').length
    fireEvent.click(screen.getByTestId('delete'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除商品類別', variant: 'success' }))
    expect(callsOf(calls, 'DEL_PRODUCT_CATEGORY')[0].variables).toEqual({ itemIds: ['cat-3'] })
    await settle()
    expect(callsOf(calls, 'PRODUCT_CATEGORIES').length).toBeGreaterThan(before)
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ DEL_PRODUCT_CATEGORY: new Error('分類下仍有商品') })
    await second.settle()
    fireEvent.click(within(rowOf('洗髮')).getByRole('checkbox'))
    fireEvent.click(screen.getByTestId('delete'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '分類下仍有商品', variant: 'error' }))
  })
})
