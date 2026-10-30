// 保護「商品庫存表」：預設依數量由少到多；可依廠商（沒有廠商的排最後）、代號、類別排序；依商品分類篩選；
// 無代號、無廠商的標示；列印呼叫瀏覽器列印；查詢失敗不白屏、沒有資料顯示「無資料」。GraphQL 全由 testkit 模擬，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickOption, clearCombo, inputsByLabel } from '../../__tests__/stockKit.test'
import ProductInventoryList from '..'

const LIST = [
  { productNo: 'B2', productName: '乙', count: 5, productCategory: '洗髮', vendorName: 'Bcd' },
  { productNo: 'A1', productName: '甲', count: -1, productCategory: '護髮', vendorName: null },
  { productNo: null, productName: '丙', count: 7, productCategory: 'Z系列', vendorName: '美髮' },
  { productNo: '丁號', productName: '丁', count: 2, productCategory: '洗髮', vendorName: 'Abc' },
  { productNo: '戊號', productName: '戊', count: 3, productCategory: '頭皮', vendorName: '大和' },
]

const renderList = (overrides, options) =>
  renderPage(<ProductInventoryList />, {
    fixtures: {
      GET_PRODUCT_INVENTORY_LIST: { productInventoryList: LIST },
      PRODUCT_CATEGORIES: {
        productCategories: [
          { id: 'c1', name: '洗髮' },
          { id: 'c2', name: '護髮' },
        ],
      },
      ...overrides,
    },
    ...options,
  })

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(r => r.querySelectorAll('td')[1].textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('商品庫存表', () => {
  it('預設依數量由少到多；無代號、無廠商有標示；共幾筆', async () => {
    const { settle } = renderList()
    await settle()
    expect(screen.getByText('共 5 筆')).toBeInTheDocument()
    expect(names()).toEqual(['甲', '丁', '戊', '乙', '丙'])
    expect(screen.getByText('(無代號)')).toBeInTheDocument()
    expect(screen.getByText('(無廠商)')).toBeInTheDocument()
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('依廠商排序（英數依字碼、中文依語系、沒有廠商排最後）、依代號、依類別、再回到數量', async () => {
    const { settle } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('button', { name: '廠商' }))
    expect(names()).toEqual(['丁', '乙', '戊', '丙', '甲'])
    fireEvent.click(screen.getByRole('button', { name: '代號' }))
    expect(names()).toEqual(['丙', '甲', '乙', '丁', '戊'])
    fireEvent.click(screen.getByRole('button', { name: '類別' }))
    const byCategory = names()
    // Z系列（英數）排最前，其餘中文類別相同的放在一起
    expect(byCategory[0]).toBe('丙')
    expect(byCategory.indexOf('乙') + 1).toBe(byCategory.indexOf('丁'))
    fireEvent.click(screen.getByRole('button', { name: '數量' }))
    expect(names()).toEqual(['甲', '丁', '戊', '乙', '丙'])
    // 再按目前已選的排序：維持不變
    fireEvent.click(screen.getByRole('button', { name: '數量' }))
    expect(names()).toEqual(['甲', '丁', '戊', '乙', '丙'])
  })

  it('相同值與缺值：數量相同維持原順序、相同廠商相鄰、英數代號與類別排在中文前、沒有類別的排最前', async () => {
    const MORE = [
      ...LIST,
      { productNo: 'B2', productName: '己', count: 5, productCategory: 'Y系列', vendorName: 'Bcd' },
      { productNo: null, productName: '庚', count: 1, productCategory: null, vendorName: 'Abc' },
    ]
    const { settle } = renderList({ GET_PRODUCT_INVENTORY_LIST: { productInventoryList: MORE } })
    await settle()
    expect(names()).toEqual(['甲', '庚', '丁', '戊', '乙', '己', '丙'])
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('button', { name: '廠商' }))
    let order = names()
    expect(order[order.length - 1]).toBe('甲')
    expect(Math.abs(order.indexOf('乙') - order.indexOf('己'))).toBe(1)
    expect(Math.abs(order.indexOf('丁') - order.indexOf('庚'))).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: '代號' }))
    order = names()
    expect(order.indexOf('甲')).toBeLessThan(order.indexOf('乙'))
    expect(Math.abs(order.indexOf('乙') - order.indexOf('己'))).toBe(1)
    expect(order.indexOf('乙')).toBeLessThan(order.indexOf('丁'))
    fireEvent.click(screen.getByRole('button', { name: '類別' }))
    order = names()
    expect(order[0]).toBe('庚')
    cleanup()

    // 類別排序再多一些英數、相同與缺值的組合
    const CATS = ['Z系列', null, 'A系列', 'Z系列', null, 'M系列', '洗髮'].map((productCategory, i) => ({
      productNo: `N${i}`,
      productName: `品${i}`,
      count: i,
      productCategory,
      vendorName: null,
    }))
    const again = renderList({ GET_PRODUCT_INVENTORY_LIST: { productInventoryList: CATS } })
    await again.settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('button', { name: '類別' }))
    const categoriesInOrder = screen
      .getAllByRole('row')
      .slice(1)
      .map(r => r.querySelectorAll('td')[3].textContent)
    expect(categoriesInOrder).toEqual(['', '', 'A系列', 'M系列', 'Z系列', 'Z系列', '洗髮'])
  })

  it('依商品分類篩選；清除篩選回到全部', async () => {
    const { settle } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    pickOption('篩選商品分類', '洗髮')
    expect(names()).toEqual(['丁', '乙'])
    clearCombo(inputsByLabel('篩選商品分類')[0])
    expect(names()).toHaveLength(5)
  })

  it('列印：呼叫瀏覽器列印', async () => {
    const { settle } = renderList()
    await settle()
    const print = jest.spyOn(window, 'print').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /列印/ }))
    expect(print).toHaveBeenCalled()
    print.mockRestore()
  })

  it('沒有資料顯示「無資料」；查詢全部失敗不進錯誤畫面', async () => {
    const { settle } = renderList({ GET_PRODUCT_INVENTORY_LIST: { productInventoryList: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const failed = renderPage(<ProductInventoryList />, { fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('商品庫存表')[0]).toBeInTheDocument()
  })
})
