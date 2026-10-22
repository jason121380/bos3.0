import React from 'react'
import { act, cleanup, render, wait } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { useProductPicker, useMembershipPicker } from '../useItemPicker'
import { createAutoMockLink, callsOf } from '../../../__tests__/testkit.test'

// 為什麼重要：店販／會員卡「從清單選擇」彈窗的資料來源（四個帳單頁共用）。
// 守住：
// - 店販清單只列「可販售」的商品（停售的商品不能被賣出）；會員卡第一次查詢只查可販售的會員卡
// - 清單還在載入時按「從清單選擇」不開啟（避免開出空的彈窗、選不到東西）
// - 換頁／每頁筆數寫入查詢條件；關閉彈窗時清掉分類與關鍵字，下次開啟看到全部
// 已知缺口（TODO P3 覆蓋率 A 級疑似 bug ③，待 Jason 確認後端預設）：關閉彈窗後重設的查詢條件少了 isAvailableForSale 與分頁參數，
// 可能列出停售會員卡。這裡刻意不斷言重設後的完整條件（不把現況當成正確）；確認並修正後補上完整斷言。
// GraphQL 由模擬 link 回應，不連後端。

afterEach(cleanup)

const SHAMPOO = { id: 'p1', no: 'P01', name: '洗髮精', sellPrice: 1200, isAvailableForSale: true }
const RETIRED = { id: 'p2', no: 'P02', name: '停售髮蠟', sellPrice: 500, isAvailableForSale: false }
const CARD = { uuid: 'm1', no: 'M01', name: '年卡', sellPrice: 12000, effecitveDay: 365 }

const fixtures = {
  undefined: { products: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SHAMPOO, RETIRED] } },
  PRODUCT_CATEGORIES: { productCategories: [{ id: 'pc-1', name: '洗護' }] },
  FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageOffset: 0, pageLimit: 50, data: [CARD] } },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', name: 'VIP' }] },
}

function setup(useHook) {
  const calls = []
  const link = createAutoMockLink(fixtures, { calls })
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
      latest.modalProps.setSetting(prev => ({ ...prev, keyword: '洗', categoryIds: ['pc-1'] }))
    })
    await wait(() => expect(lastInput(calls, undefined).categoryIds).toEqual(['pc-1']))
    act(() => latest.modalProps.closeModal())
    expect(latest.productsModalOpen).toBe(false)
    expect(latest.modalProps.selectedCategorie).toEqual([])
    expect(latest.modalProps.selectedCategorieName).toEqual([])
    await wait(() => expect(lastInput(calls, undefined)).toEqual(expect.objectContaining({ keyword: '', categoryIds: [] })))
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

  it('關閉：彈窗關閉、清掉所選分類與關鍵字（重設後是否仍只查可販售見檔頭已知缺口）', async () => {
    const { calls, latest } = setup(useMembershipPicker)
    await wait(() => expect(latest.modalProps.productList.data).toBeDefined())
    act(() => latest.handleOpenProductsModal())
    act(() => {
      latest.modalProps.setSelectedCategorie(['mc-1'])
      latest.modalProps.setSetting(prev => ({ ...prev, categoryUUIds: ['mc-1'] }))
    })
    await wait(() => expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').categoryUUIds).toEqual(['mc-1']))
    act(() => latest.modalProps.closeModal())
    expect(latest.productsModalOpen).toBe(false)
    expect(latest.modalProps.selectedCategorie).toEqual([])
    await wait(() =>
      expect(lastInput(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL')).toEqual(expect.objectContaining({ keyword: '', categoryUUIds: [] }))
    )
  })
})
