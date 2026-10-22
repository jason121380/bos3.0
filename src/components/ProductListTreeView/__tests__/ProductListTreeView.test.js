// 保護：商品排行榜的「選擇商品」。商品依類別樹狀列出（沒有商品的類別不顯示），可勾類別全選該類、勾「全部」、
// 點商品切換、搜尋（代號或名稱）時標紅框並展開「全部」；「確認」才回傳商品 id 陣列給頁面，「關閉」／Esc 丟棄。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import React from 'react'

import { callsOf, renderPage } from '__tests__/testkit.test'
import ProductListTreeView from 'components/ProductListTreeView'

afterEach(cleanup)

const P1 = { id: 'p1', no: 'A01', name: '洗髮精' }
const P2 = { id: 'p2', no: '', name: '潤髮乳' }
const P3 = { id: 'p3', no: 'B01', name: '髮蠟' }
const categories = [
  { id: 'c1', name: '洗護', products: [P1, P2] },
  { id: 'c2', name: '造型', products: [P3] },
  { id: 'c3', name: '空類別', products: [] },
]
const fixtures = { GET_PRODUCT_CATEGORIES_TREEVIEW: { productCategories: categories } }

const dialog = () => screen.getByRole('dialog', { name: '商品列表' })
const label = text => within(dialog()).getByText(text)
const toggleNode = text => fireEvent.click(label(text))
const checkboxOf = text => label(text).closest('li').parentElement.querySelector('input[type="checkbox"]')
const itemsIn = text => [...label(text).closest('li').querySelectorAll('ul [role="treeitem"]')]
const selected = () => [...dialog().querySelectorAll('li.onSelect')].map(li => li.textContent)
const lastIds = fn => fn.mock.calls[fn.mock.calls.length - 1][0]

const setup = async (props = {}) => {
  const onValueChange = jest.fn()
  const utils = renderPage(<ProductListTreeView onValueChange={onValueChange} {...props} />, { fixtures })
  await utils.settle()
  return { ...utils, onValueChange }
}

describe('ProductListTreeView 選擇商品', () => {
  it('查詢時排除已刪除（paranoid）的資料；全選回傳全部商品 id；移除標籤', async () => {
    const { onValueChange, calls } = await setup()
    expect(callsOf(calls, 'GET_PRODUCT_CATEGORIES_TREEVIEW')[0].variables).toEqual({ input: { paranoid: true } })
    expect(onValueChange).toHaveBeenCalledWith([])
    fireEvent.click(screen.getByText('全選'))
    expect(lastIds(onValueChange)).toEqual(['p1', 'p2', 'p3'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 髮蠟' }))
    expect(lastIds(onValueChange)).toEqual(['p1', 'p2'])
  })

  it('點輸入框開窗（取得焦點即移開）；點欄位外框不開；樹狀列出全部與有商品的類別', async () => {
    await setup()
    const input = screen.getByRole('combobox')
    fireEvent.click(input.parentElement)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.focusIn(input)
    fireEvent.click(input)
    expect(label('全部(3)')).toBeInTheDocument()
    expect(label('洗護(2)')).toBeInTheDocument()
    expect(label('造型(1)')).toBeInTheDocument()
    expect(within(dialog()).queryByText(/空類別/)).toBeNull()
    toggleNode('全部(3)')
    // 有代號顯示「代號 - 名稱」，代號空白只顯示名稱
    expect(itemsIn('全部(3)').map(li => li.textContent)).toEqual(['A01 - 洗髮精', '潤髮乳', 'B01 - 髮蠟'])
  })

  it('點商品切換選取、勾類別選取整類、半選、取消類別；確認才回傳；關閉則丟棄', async () => {
    const { onValueChange } = await setup()
    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    toggleNode('全部(3)')
    fireEvent.click(within(itemsIn('全部(3)')[2]).getByText('B01 - 髮蠟'))
    fireEvent.click(within(itemsIn('全部(3)')[0]).getByText('A01 - 洗髮精'))
    fireEvent.click(within(itemsIn('全部(3)')[0]).getByText('A01 - 洗髮精'))
    expect(selected()).toEqual(['B01 - 髮蠟'])
    expect(checkboxOf('造型(1)')).toBeChecked()
    const care = checkboxOf('洗護(2)')
    fireEvent.click(care)
    expect(care).toBeChecked()
    toggleNode('洗護(2)')
    fireEvent.click(within(itemsIn('洗護(2)')[1]).getByText('潤髮乳'))
    expect(care.indeterminate).toBe(true)
    fireEvent.click(care)
    fireEvent.click(care)
    expect(care).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(lastIds(onValueChange)).toEqual(['p3'])

    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    fireEvent.click(checkboxOf('全部(3)'))
    expect(checkboxOf('全部(3)')).toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(lastIds(onValueChange)).toEqual(['p3'])
  })

  it('搜尋代號或名稱標紅框並展開全部；清除搜尋；全部勾選再取消；清除選取；展開全部／收合；Esc 關閉', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    const search = within(dialog()).getByPlaceholderText('搜尋商品')
    fireEvent.change(search, { target: { value: 'b01' } })
    expect(itemsIn('全部(3)').filter(li => li.className.includes('outline')).map(li => li.textContent)).toEqual(['B01 - 髮蠟'])
    fireEvent.change(search, { target: { value: '不存在' } })
    expect(itemsIn('全部(3)').some(li => li.className.includes('outline'))).toBe(false)
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除搜尋文字' }))
    expect(search).toHaveValue('')
    const all = checkboxOf('全部(3)')
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(all).not.toBeChecked()
    fireEvent.click(all)
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除選取' }))
    expect(all).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    expect(label('造型(1)').closest('li')).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    expect(label('造型(1)').closest('li')).toHaveAttribute('aria-expanded', 'false')
    toggleNode('造型(1)')
    toggleNode('造型(1)')
    expect(label('造型(1)').closest('li')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  // 已修正（Jason 2026/10/22 fix all）：代號為 null 時，顯示與搜尋用的文字原本是「null贈品」（`${d.no && …}` 把 null 轉成字串）；
  // 改為沒有代號就只用名稱
  it('代號為 null 的商品只顯示名稱；搜尋「null」不會比對到', async () => {
    const onValueChange = jest.fn()
    const { settle } = renderPage(<ProductListTreeView onValueChange={onValueChange} />, {
      fixtures: { GET_PRODUCT_CATEGORIES_TREEVIEW: { productCategories: [{ id: 'c', name: '其他', products: [{ id: 'x', no: null, name: '贈品' }] }] } },
    })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    toggleNode('全部(1)')
    expect(itemsIn('全部(1)')[0].textContent).toBe('贈品')
    const search = within(dialog()).getByPlaceholderText('搜尋商品')
    fireEvent.change(search, { target: { value: 'null' } })
    expect(itemsIn('全部(1)').some(li => li.className.includes('outline'))).toBe(false)
    fireEvent.change(search, { target: { value: '贈品' } })
    expect(itemsIn('全部(1)')[0].className).toContain('outline')
  })

  it('沒有任何商品時全選停用；沒給 onValueChange 不拋錯', async () => {
    const { settle } = renderPage(<ProductListTreeView />, { fixtures: { GET_PRODUCT_CATEGORIES_TREEVIEW: { productCategories: [] } } })
    await settle()
    expect(screen.getByRole('combobox')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    expect(label('全部(0)')).toBeInTheDocument()
  })

  // 已修正（Jason 2026/10/22 fix all）：查詢失敗時 data 為 undefined，原本直接讀 data.productCategories 而拋錯（整頁錯誤畫面）；
  // 改為當成沒有商品
  it('商品類別查詢失敗時不拋錯，當成沒有商品（全選停用）', async () => {
    const { settle } = renderPage(<ProductListTreeView />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText('這個頁面發生錯誤')).toBeNull()
    expect(screen.getByRole('combobox')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '選擇商品' }))
    expect(label('全部(0)')).toBeInTheDocument()
  })
})
