import React from 'react'
import { act, cleanup, render, wait } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { useProductPicker, useMembershipPicker } from '../useItemPicker'
import { createAutoMockLink, callsOf } from '../../../__tests__/testkit.test'

// 為什麼重要：店販／會員卡「從清單選擇」彈窗的資料來源（四個帳單頁共用）。
// 守住：
// - 店販清單只列「可販售」的商品（停售的商品不能被賣出）；會員卡第一次查詢只查可販售的會員卡
// - 清單還在載入時按「從清單選擇」不開啟（避免開出空的彈窗、選不到東西）
// - 清單或分類查詢失敗（錯誤提示由 init-apollo 的 errorLink 統一跳出）：清單、分類當作空的，帳單頁不整頁錯誤、彈窗打得開
//   （2026/10/22 修正：店販清單查詢失敗時讀 undefined.data，帳單四頁整頁錯誤）
// - 換頁／每頁筆數寫入查詢條件；關閉彈窗時清掉分類與關鍵字，下次開啟看到全部
// - 關閉時的查詢條件回到第一次開啟時的完整條件：會員卡仍只查可販售、分頁參數回到預設
//   （2026/10/22 修正：原本重設後少了 isAvailableForSale 與分頁參數，可能列出停售會員卡）
// GraphQL 由模擬 link 回應，不連後端。

afterEach(cleanup)

const SHAMPOO = { id: 'p1', no: 'P01', name: '洗髮精', sellPrice: 1200, isAvailableForSale: true }
const RETIRED = { id: 'p2', no: 'P02', name: '停售髮蠟', sellPrice: 500, isAvailableForSale: false }
const CARD = { uuid: 'm1', no: 'M01', name: '年卡', sellPrice: 12000, effecitveDay: 365 }

const fixtures = {
  // 回應帶回查詢的分頁參數（與後端相同），可看出畫面上的清單是哪一組條件查到的
  undefined: ({ input }) => ({ products: { totalCount: 2, pageOffset: input.pageOffset, pageLimit: input.pageLimit, data: [SHAMPOO, RETIRED] } }),
  PRODUCT_CATEGORIES: { productCategories: [{ id: 'pc-1', name: '洗護' }] },
  FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageOffset: 0, pageLimit: 50, data: [CARD] } },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', name: 'VIP' }] },
}

function setup(useHook, overrides = {}) {
  const calls = []
  const link = createAutoMockLink({ ...fixtures, ...overrides }, { calls })
  const latest = {}
  function Probe() {
    Object.assign(latest, useHook())
    return null
  }
  render(
    <MockedProvider link={link} addTypename={false}>
      <Probe />
    </MockedProvider>
  )
  return { calls, latest }
}

const lastInput = (calls, name) => {
  const list = callsOf(calls, name)
  return list[list.length - 1].variables.input
}

describe('useProductPicker：店販選擇窗', () => {
  it('只列出可販售的商品，帶入商品分類', async () => {
    const { latest } = setup(useProductPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    expect(latest.modalProps.productList.data.map(p => p.name)).toEqual(['洗髮精'])
    expect(latest.modalProps.productList.totalCount).toBe(2)
    expect(latest.modalProps.productCategories).toEqual([expect.objectContaining({ id: 'pc-1', name: '洗護' })])
  })

  it('清單與分類查詢失敗：不拋錯，清單與分類是空的，仍可開啟彈窗', async () => {
    const { calls, latest } = setup(useProductPicker, { undefined: new Error('網路錯誤'), PRODUCT_CATEGORIES: new Error('網路錯誤') })
    await wait(() => expect(latest.modalProps.productList.data).toEqual([]))
    expect(callsOf(calls, undefined)).toHaveLength(1)
    expect(latest.modalProps.productCategories).toEqual([])
    // 空清單也帶完整分頁欄位：彈窗分頁顯示 0 筆，不是 NaN，按下一頁也不會把 NaN 寫進查詢
    expect(latest.modalProps.productList).toEqual({ data: [], totalCount: 0, pageOffset: 0, pageLimit: 50 })
    act(() => latest.handleOpenProductsModal())
    expect(latest.productsModalOpen).toBe(true)
  })

  it('清單載入中按「從清單選擇」不開啟；載入後才開啟', async () => {
    const { latest } = setup(useProductPicker)
    act(() => latest.handleOpenProductsModal())
    expect(latest.productsModalOpen).toBe(false)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.handleOpenProductsModal())
    expect(latest.productsModalOpen).toBe(true)
    expect(latest.modalProps.productsModalOpen).toBe(true)
  })

  it('換頁寫入查詢條件', async () => {
    const { calls, latest } = setup(useProductPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    expect(lastInput(calls, undefined)).toEqual({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: [] })
    act(() => latest.modalProps.onPageChange({ value: 1, key: 'pageOffset' }))
    await wait(() => expect(lastInput(calls, undefined).pageOffset).toBe(1))
  })

  it('關閉：彈窗關閉、清掉所選分類與關鍵字，下次查全部', async () => {
    const { calls, latest } = setup(useProductPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.handleOpenProductsModal())
    act(() => {
      latest.modalProps.setSelectedCategorie(['pc-1'])
      latest.modalProps.setSelectedCategorieName(['洗護'])
      latest.modalProps.setSetting(prev => ({ ...prev, keyword: '洗', categoryIds: ['pc-1'], pageOffset: 1 }))
    })
    await wait(() => expect(lastInput(calls, undefined).categoryIds).toEqual(['pc-1']))
    act(() => latest.modalProps.closeModal())
    expect(latest.productsModalOpen).toBe(false)
    expect(latest.modalProps.selectedCategorie).toEqual([])
    expect(latest.modalProps.selectedCategorieName).toEqual([])
    // 回到第一次開啟時的條件：清單換回第一次查詢的結果（同一組條件由快取直接給，不必重查），
    // 過程中送出的條件都帶分頁參數（修正前重設會送出只有 keyword／categoryIds 的條件）
    await wait(() => expect(latest.modalProps.productList.pageOffset).toBe(0))
    expect(latest.modalProps.productList.data.map(p => p.name)).toEqual(['洗髮精'])
    callsOf(calls, undefined).forEach(c => expect(c.variables.input).toEqual(expect.objectContaining({ pageLimit: 50 })))
    await new Promise(resolve => setTimeout(resolve, 20))
    callsOf(calls, undefined).forEach(c => expect(c.variables.input).toEqual(expect.objectContaining({ pageLimit: 50 })))
  })
})

describe('useMembershipPicker：會員卡選擇窗', () => {
  it('只查可販售的會員卡，帶入會員卡分類', async () => {
    const { calls, latest } = setup(useMembershipPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL')).toEqual({ isAvailableForSale: true, pageLimit: 50, pageOffset: 0, keyword: '', categoryUUIds: [] })
    expect(latest.modalProps.productList.data).toEqual([expect.objectContaining(CARD)])
    expect(latest.modalProps.productCategories).toEqual([expect.objectContaining({ uuid: 'mc-1', name: 'VIP' })])
  })

  it('清單與分類查詢失敗：不拋錯，清單與分類是空的', async () => {
    const { latest } = setup(useMembershipPicker, { FETCH_MEMBERSHIPS_FOR_MODAL: new Error('網路錯誤'), FETCH_MEMBERSHIPS_CATEGORY: new Error('網路錯誤') })
    await wait(() => expect(latest.modalProps.productList.data).toEqual([]))
    expect(latest.modalProps.productCategories).toEqual([])
    expect(latest.modalProps.productList).toEqual({ data: [], totalCount: 0, pageOffset: 0, pageLimit: 50 })
  })

  it('清單載入中按「從清單選擇」不開啟；載入後才開啟', async () => {
    const { latest } = setup(useMembershipPicker)
    act(() => latest.handleOpenProductsModal())
    expect(latest.productsModalOpen).toBe(false)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.handleOpenProductsModal())
    expect(latest.productsModalOpen).toBe(true)
  })

  it('換頁寫入查詢條件', async () => {
    const { calls, latest } = setup(useMembershipPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.modalProps.onPageChange({ value: 25, key: 'pageLimit' }))
    await wait(() => expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').pageLimit).toBe(25))
  })

  it('關閉：彈窗關閉、清掉所選分類與關鍵字，仍只查可販售、分頁回到預設', async () => {
    const { calls, latest } = setup(useMembershipPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.handleOpenProductsModal())
    act(() => {
      latest.modalProps.setSelectedCategorie(['mc-1'])
      latest.modalProps.setSetting(prev => ({ ...prev, keyword: '年', categoryUUIds: ['mc-1'], pageOffset: 1 }))
    })
    await wait(() => expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').categoryUUIds).toEqual(['mc-1']))
    act(() => latest.modalProps.closeModal())
    expect(latest.productsModalOpen).toBe(false)
    expect(latest.modalProps.selectedCategorie).toEqual([])
    await wait(() =>
      expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL')).toEqual({ isAvailableForSale: true, pageLimit: 50, pageOffset: 0, keyword: '', categoryUUIds: [] })
    )
  })
})
