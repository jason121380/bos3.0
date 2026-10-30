import React from 'react'
import { act, cleanup, fireEvent, render, screen, wait, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import ItemPickerModal from '../ItemPickerModal'
import ProductsModal from '../ProductsModal'
import MemberShipCardSellsModal from '../MemberShipCardSellsModal'
import EditServicesModal from '../EditServicesModal'
import EditCouponSellModal from '../EditCouponSellModal'
import { SERVICE_COLUMNS } from '../pickerColumns'
import { createAutoMockLink, callsOf } from '../../../__tests__/testkit.test'

// 為什麼重要：帳單四兄弟「選服務／商品／卡券／會員卡」都用這幾個彈窗把項目帶進帳單，帶錯就是帳單金額或內容錯：
// - 選取後帶入的欄位：商品帶售價、數量 1；會員卡帶售價與到期日（0 天＝不到期）；服務帶價格、第三方卡券綁定；卡券帶可用次數與價格
// - 第一列還是空白時替換第一列，否則新增在最後（不覆蓋已輸入的項目）
// - 服務選取後依服務的助理設定展開助理欄位（類型-人員），才關閉彈窗
// - 分類篩選寫入查詢條件（服務／商品／卡券用 categoryIds、會員卡用 categoryUUIds），清除時回到全部
//   （商品／會員卡的「清除」回到第一次開啟時的完整條件：會員卡仍只查可販售、分頁參數保留預設；2026/10/22 修正前會少掉這幾個參數）
// - 共用畫面（ItemPickerModal）：標題、分類鈕、加入、分頁、關閉；按 Esc／點背景不關閉（原本就沒有）
// GraphQL 由模擬 link 回應，不連後端。

afterEach(cleanup)

const dialog = () => screen.getByRole('dialog')

describe('ItemPickerModal：選擇窗共用畫面', () => {
  const categories = [
    { id: 'cat-1', name: '剪髮' },
    { id: 'cat-2', name: '染髮' },
  ]
  const rows = [
    { id: 's1', no: 'S01', name: '精緻剪髮', price: 1200, serviceCategory: { name: '剪髮' } },
    { id: 's2', no: 'S02', name: '設計染髮', price: 3500, serviceCategory: { name: '染髮' } },
  ]
  const renderPicker = (props = {}) => {
    const handlers = {
      closeModal: jest.fn(),
      onClickCategorie: jest.fn(),
      onClearCategorie: jest.fn(),
      onSelect: jest.fn(),
      onPageChange: jest.fn(),
    }
    const element = overrides => (
      <ItemPickerModal
        open
        noun="服務"
        categories={categories}
        selectedCategorie={[]}
        selectedCategorieName={[]}
        caption="2 筆服務"
        columns={SERVICE_COLUMNS}
        rows={rows}
        paging={{ source: rows, count: 60, page: 0, rowsPerPage: 50 }}
        {...handlers}
        {...props}
        {...overrides}
      />
    )
    const utils = render(element())
    return { ...utils, handlers, rerenderWith: overrides => utils.rerender(element(overrides)) }
  }

  it('沒選分類時標題為「所有服務」；選了分類顯示「剪髮類服務」並標示該分類鈕', () => {
    const { rerenderWith } = renderPicker()
    expect(within(dialog()).getByRole('heading')).toHaveTextContent('所有服務')
    rerenderWith({ selectedCategorie: ['cat-1'], selectedCategorieName: ['剪髮'] })
    expect(within(dialog()).getByRole('heading')).toHaveTextContent('剪髮類服務')
  })

  it('點分類鈕以分類 id 與名稱通知呼叫端；「清除」通知清除', () => {
    const { handlers } = renderPicker()
    fireEvent.click(within(dialog()).getByRole('button', { name: '染髮' }))
    expect(handlers.onClickCategorie).toHaveBeenCalledWith('cat-2', '染髮')
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除' }))
    expect(handlers.onClearCategorie).toHaveBeenCalled()
  })

  it('表格列出欄位內容；按「加入」把那一列交給呼叫端', () => {
    const { handlers } = renderPicker()
    expect(within(dialog()).getByText('3,500')).toBeInTheDocument()
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[1])
    expect(handlers.onSelect).toHaveBeenCalledWith(rows[1])
  })

  it('換頁與改每頁筆數：以 pageOffset／pageLimit 通知呼叫端', () => {
    const { handlers } = renderPicker()
    fireEvent.click(within(dialog()).getByRole('button', { name: '下一頁' }))
    expect(handlers.onPageChange).toHaveBeenCalledWith({ value: 1, key: 'pageOffset' })
    // 原生下拉的 value 是選項索引（ui/native-select），第 3 個選項＝25 筆
    fireEvent.change(within(dialog()).getByLabelText('每頁筆數'), { target: { value: '2' } })
    expect(handlers.onPageChange).toHaveBeenCalledWith({ value: 25, key: 'pageLimit' })
  })

  it('右上角與底部的「關閉」都會關閉；按 Esc 不會關（避免誤觸丟掉篩選）', () => {
    const { handlers } = renderPicker()
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    expect(handlers.closeModal).not.toHaveBeenCalled()
    within(dialog())
      .getAllByRole('button', { name: '關閉' })
      .forEach(button => fireEvent.click(button))
    expect(handlers.closeModal).toHaveBeenCalledTimes(2)
  })

  it('開啟時焦點在彈窗本身，不自動選到第一個分類鈕', () => {
    renderPicker()
    expect(document.activeElement).toBe(dialog())
  })

  // 分頁文字改寫的計時器：彈窗關閉（沒有分頁元素）時 1 秒內自行停止，開啟時找到分頁即停止，不留下一直執行的計時器
  it('分頁文字的輪詢計時器一定會停止，分頁文字照常顯示', () => {
    jest.useFakeTimers()
    try {
      const { rerenderWith } = renderPicker({ open: false })
      act(() => jest.advanceTimersByTime(1000))
      expect(jest.getTimerCount()).toBe(0)
      rerenderWith({ open: true })
      act(() => jest.advanceTimersByTime(100))
      expect(within(dialog()).getByText('1–50 / 共 60 筆')).toBeInTheDocument()
      act(() => jest.advanceTimersByTime(1000))
      expect(jest.getTimerCount()).toBe(0)
    } finally {
      jest.useRealTimers()
    }
  })

  it('沒有分頁（卡券）時不顯示分頁', () => {
    renderPicker({ paging: undefined })
    expect(within(dialog()).queryByRole('button', { name: '下一頁' })).toBeNull()
    expect(within(dialog()).queryByLabelText('每頁筆數')).toBeNull()
  })
})

// 呼叫端（各頁）保管的篩選狀態：記錄 setX 收到的值，函式型 updater 以前一個值計算
function trackedSetters(initialSetting) {
  const state = { setting: initialSetting }
  return {
    state,
    setSelectedCategorie: jest.fn(),
    setSelectedCategorieName: jest.fn(),
    setSetting: jest.fn(next => {
      state.setting = typeof next === 'function' ? next(state.setting) : next
    }),
  }
}

describe('ProductsModal：選商品', () => {
  const productList = {
    totalCount: 2,
    pageOffset: 0,
    pageLimit: 50,
    data: [
      { id: 'p1', no: 'P01', name: '洗髮精', sellPrice: 1200, isLocked: true, productCategory: { id: 'pc-1', name: '洗護' } },
      { id: 'p2', no: 'P02', name: '無分類髮蠟', sellPrice: 450, isLocked: false, productCategory: null },
    ],
  }
  const renderProducts = (props = {}) => {
    const setters = trackedSetters({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: [] })
    const handlers = { onProductChange: jest.fn(), setProductsModalOpen: jest.fn(), closeModal: jest.fn(), onPageChange: jest.fn() }
    render(
      <ProductsModal
        productsModalOpen
        productList={productList}
        productCategories={[{ id: 'pc-1', name: '洗護' }]}
        selectedCategorie={[]}
        selectedCategorieName={[]}
        sells={[{ productId: '' }]}
        productLength={1}
        sellsItem={{ productId: '', designerId: 'd1', count: 0 }}
        {...setters}
        {...handlers}
        {...props}
      />
    )
    return { setters, handlers }
  }

  it('第一列還空白：選取的商品替換第一列，帶售價、數量 1、鎖價設定，然後關閉', () => {
    const { handlers } = renderProducts()
    expect(within(dialog()).getByText('2 項商品')).toBeInTheDocument()
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[0])
    expect(handlers.onProductChange).toHaveBeenCalledWith({
      index: 0,
      value: { productId: 'p1', designerId: 'd1', count: 1, price: 1200, isLocked: true },
    })
    expect(handlers.setProductsModalOpen).toHaveBeenCalledWith(false)
  })

  it('已有商品：新增在最後一列之後，不覆蓋', () => {
    const { handlers } = renderProducts({ sells: [{ productId: 'p9' }, { productId: 'p8' }], productLength: 2 })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[1])
    expect(handlers.onProductChange.mock.calls[0][0].index).toBe(2)
  })

  it('沒有分類的商品類別欄空白', () => {
    renderProducts()
    const row = within(dialog()).getByText('無分類髮蠟').closest('tr')
    expect(within(row).getAllByRole('cell')[2]).toHaveTextContent('')
  })

  it('選分類寫入查詢的 categoryIds；清除回到全部商品', () => {
    const { setters } = renderProducts()
    fireEvent.click(within(dialog()).getByRole('button', { name: '洗護' }))
    expect(setters.setSelectedCategorie).toHaveBeenCalledWith(['pc-1'])
    expect(setters.setSelectedCategorieName).toHaveBeenCalledWith(['洗護'])
    expect(setters.state.setting).toEqual({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: ['pc-1'] })
    // 清除：回到第一次開啟時的完整查詢條件（分頁參數保留預設，不只清分類與關鍵字）
    act(() => setters.setSetting(prev => ({ ...prev, pageOffset: 2, keyword: '洗' })))
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除' }))
    expect(setters.setSelectedCategorie).toHaveBeenLastCalledWith([])
    expect(setters.state.setting).toEqual({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: [] })
  })
})

describe('MemberShipCardSellsModal：選會員卡', () => {
  const productList = {
    pageOffset: 0,
    pageLimit: 50,
    data: [
      {
        uuid: 'm1',
        no: 'M01',
        name: '年卡',
        sellPrice: 12000,
        effecitveDay: 365,
        isLocked: false,
        membershipCategory: { uuid: 'mc-1', name: 'VIP' },
      },
      { uuid: 'm2', no: 'M02', name: '永久卡', sellPrice: 30000, effecitveDay: 0, isLocked: true, membershipCategory: null },
    ],
  }
  const renderCards = (props = {}) => {
    const setters = trackedSetters({ isAvailableForSale: true, pageLimit: 50, pageOffset: 0, keyword: '', categoryUUIds: [] })
    const handlers = { onCardChange: jest.fn(), setProductsModalOpen: jest.fn(), closeModal: jest.fn(), onPageChange: jest.fn() }
    render(
      <MemberShipCardSellsModal
        productsModalOpen
        productList={productList}
        productCategories={[{ uuid: 'mc-1', name: 'VIP' }]}
        selectedCategorie={[]}
        selectedCategorieName={[]}
        sells={[{ membershipUUID: '' }]}
        productLength={1}
        sellsItem={{ membershipUUID: '', designerId: 'd1' }}
        {...setters}
        {...handlers}
        {...props}
      />
    )
    return { setters, handlers }
  }

  it('有效天數的會員卡：到期日＝今天起算天數；替換空白的第一列並關閉', () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(2026, 9, 21, 10, 0))
    try {
      const { handlers } = renderCards()
      fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[0])
      expect(handlers.onCardChange).toHaveBeenCalledWith({
        index: 0,
        value: {
          membershipUUID: 'm1',
          designerId: 'd1',
          price: 12000,
          expiryDate: new Date(2027, 9, 21, 10, 0).getTime(),
          effecitveDay: 365,
          isLocked: false,
          thirdPartyCouponMerchantId: null,
        },
      })
      expect(handlers.setProductsModalOpen).toHaveBeenCalledWith(false)
    } finally {
      jest.useRealTimers()
    }
  })

  it('0 天（不限期）的會員卡：沒有到期日；已有會員卡時新增在最後', () => {
    const { handlers } = renderCards({ sells: [{ membershipUUID: 'm9' }], productLength: 1 })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[1])
    const { index, value } = handlers.onCardChange.mock.calls[0][0]
    expect(index).toBe(1)
    expect(value.expiryDate).toBeNull()
    expect(value.price).toBe(30000)
  })

  it('預設顯示「天數」欄與依分類的標題；掛單詳細不顯示天數、重新開單標題固定「所有會員卡」', () => {
    renderCards({ selectedCategorieName: ['VIP'] })
    expect(within(dialog()).getByRole('columnheader', { name: '天數' })).toBeInTheDocument()
    expect(within(dialog()).getByText('365天')).toBeInTheDocument()
    cleanup()
    renderCards({ showEffectiveDays: false, titleByCategory: false, selectedCategorieName: ['VIP'] })
    expect(within(dialog()).queryByRole('columnheader', { name: '天數' })).toBeNull()
    expect(within(dialog()).getByRole('heading')).toHaveTextContent('所有會員卡')
  })

  it('沒有分類的會員卡類別欄空白', () => {
    renderCards()
    const row = within(dialog()).getByText('永久卡').closest('tr')
    expect(within(row).getAllByRole('cell')[2]).toHaveTextContent('')
  })

  it('選分類以 uuid 寫入 categoryUUIds；清除回到全部', () => {
    const { setters } = renderCards()
    fireEvent.click(within(dialog()).getByRole('button', { name: 'VIP' }))
    expect(setters.setSelectedCategorie).toHaveBeenCalledWith(['mc-1'])
    expect(setters.state.setting.categoryUUIds).toEqual(['mc-1'])
    // 清除：回到第一次開啟時的完整查詢條件——仍只查可販售的會員卡、分頁參數保留預設
    act(() => setters.setSetting(prev => ({ ...prev, pageOffset: 2, keyword: '年' })))
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除' }))
    expect(setters.setSelectedCategorie).toHaveBeenLastCalledWith([])
    expect(setters.state.setting).toEqual({ isAvailableForSale: true, pageLimit: 50, pageOffset: 0, keyword: '', categoryUUIds: [] })
  })
})

describe('EditServicesModal：帳單詳細／掛單詳細／重新開單選服務', () => {
  const SERVICE_DETAIL = {
    service: {
      id: 's1',
      helperDeductionSetting: [
        { type: '洗髮', nameList: ['助理A', '助理B'] },
        { type: '吹整', nameList: ['助理C'] },
      ],
    },
  }
  const services = {
    totalCount: 2,
    pageOffset: 0,
    pageLimit: 50,
    data: [
      {
        id: 's1',
        no: 'S01',
        name: '精緻剪髮',
        price: 800,
        isLocked: false,
        isNoCash: false,
        bindedThirdPartTicket: null,
        isBindedThirdPartTicketLocked: false,
        serviceCategory: { name: '剪髮' },
      },
      {
        id: 's2',
        no: 'S02',
        name: '平台券洗髮',
        price: 500,
        isLocked: true,
        isNoCash: true,
        bindedThirdPartTicket: { id: 'tp-1' },
        isBindedThirdPartTicketLocked: true,
        serviceCategory: { name: '洗髮' },
      },
    ],
  }
  const renderServices = (props = {}) => {
    const calls = []
    const link = createAutoMockLink({ service: SERVICE_DETAIL }, { calls })
    const setters = trackedSetters({ pageLimit: 50, pageOffset: 0, categoryIds: [] })
    const handlers = {
      onServiceChange: jest.fn(),
      setHelperFromModal: jest.fn(),
      setServicesModalOpen: jest.fn(),
      closeModal: jest.fn(),
      onPageChange: jest.fn(),
    }
    render(
      <MockedProvider link={link} addTypename={false}>
        <EditServicesModal
          servicesModalOpen
          services={services}
          servicesLength={1}
          serviceCategories={[{ id: 'sc-1', name: '剪髮' }]}
          selectedCategorie={[]}
          selectedCategorieName={[]}
          servicesOnPannel={[{ serviceId: '', designerId: 'd1', price: 0 }]}
          helperFromModal={[]}
          setPageSetting={setters.setSetting}
          setSelectedCategorie={setters.setSelectedCategorie}
          setSelectedCategorieName={setters.setSelectedCategorieName}
          {...handlers}
          {...props}
        />
      </MockedProvider>
    )
    return { calls, setters, handlers }
  }

  it('選服務：替換空白的第一列，帶價格與鎖價／不計現金設定、清空助理；查服務的助理設定後展開助理欄位並關閉', async () => {
    const { calls, handlers } = renderServices()
    expect(within(dialog()).getByText('2 筆服務')).toBeInTheDocument()
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[0])
    expect(handlers.onServiceChange).toHaveBeenCalledWith({
      index: 0,
      value: {
        serviceId: 's1',
        designerId: 'd1',
        price: 800,
        isLocked: false,
        isNoCash: false,
        serviceOrderHelpers: [],
        thirdPartyCouponMerchantId: null,
        isBindedThirdPartTicketLocked: false,
      },
    })
    await wait(() => expect(handlers.setServicesModalOpen).toHaveBeenCalledWith(false))
    expect(callsOf(calls, 'service')[0].variables).toEqual({ serviceId: 's1' })
    expect(handlers.setHelperFromModal).toHaveBeenCalledWith([
      { type: '洗髮-助理A', helperId: '', isDesignate: false },
      { type: '洗髮-助理B', helperId: '', isDesignate: false },
      { type: '吹整-助理C', helperId: '', isDesignate: false },
    ])
  })

  it('綁定第三方卡券的服務：帶入卡券 id 與鎖定設定；已有服務時新增在最後，沿用最後一列的其他欄位', async () => {
    const { handlers } = renderServices({
      servicesLength: 2,
      servicesOnPannel: [
        { serviceId: 's9', designerId: 'd1' },
        { serviceId: 's8', designerId: 'd2' },
      ],
    })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[1])
    const { index, value } = handlers.onServiceChange.mock.calls[0][0]
    expect(index).toBe(2)
    expect(value).toEqual(
      expect.objectContaining({
        designerId: 'd2',
        serviceId: 's2',
        thirdPartyCouponMerchantId: 'tp-1',
        isBindedThirdPartTicketLocked: true,
        isNoCash: true,
      })
    )
    await wait(() => expect(handlers.setServicesModalOpen).toHaveBeenCalledWith(false))
  })

  it('選分類寫入 categoryIds；清除回到全部', () => {
    const { setters } = renderServices()
    fireEvent.click(within(dialog()).getByRole('button', { name: '剪髮' }))
    expect(setters.state.setting.categoryIds).toEqual(['sc-1'])
    expect(setters.setSelectedCategorieName).toHaveBeenCalledWith(['剪髮'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除' }))
    expect(setters.state.setting).toEqual({ pageLimit: 50, pageOffset: 0, categoryIds: [] })
    expect(setters.setSelectedCategorie).toHaveBeenLastCalledWith([])
  })

  it('還沒選服務時不關閉彈窗、不改助理', () => {
    const { handlers } = renderServices()
    expect(handlers.setServicesModalOpen).not.toHaveBeenCalled()
    expect(handlers.setHelperFromModal).not.toHaveBeenCalled()
  })
})

describe('EditCouponSellModal：帳單詳細／掛單詳細／重新開單選卡券', () => {
  const coupons = [
    { id: 't1', no: 'T01', name: '剪髮十次卡', price: 8000, ticketAvailableCount: 10, remark: '平日可用', isLocked: true },
    { id: 't2', no: 'T02', name: '護髮五次卡', price: 5000, ticketAvailableCount: 5, remark: '', isLocked: false },
  ]
  const renderCoupons = (props = {}) => {
    const setters = trackedSetters({ categoryIds: [] })
    const handlers = { onChange: jest.fn(), setCouponModalOpen: jest.fn(), closeModal: jest.fn() }
    render(
      <EditCouponSellModal
        couponModalOpen
        coupons={coupons}
        couponsLength={1}
        couponsOnPannel={[{ serviceId: '', designerId: 'd1' }]}
        couponCategories={[{ id: 'cc-1', name: '剪髮' }]}
        selectedCategorie={[]}
        selectedCategorieName={[]}
        setPageSetting={setters.setSetting}
        setSelectedCategorie={setters.setSelectedCategorie}
        setSelectedCategorieName={setters.setSelectedCategorieName}
        {...handlers}
        {...props}
      />
    )
    return { setters, handlers }
  }

  it('選卡券：替換空白的第一列，帶價格、可用次數、備註、鎖價；購買當下不計業績；然後關閉', () => {
    const { handlers } = renderCoupons()
    expect(within(dialog()).getByText('2張卡券')).toBeInTheDocument()
    expect(within(dialog()).queryByRole('button', { name: '下一頁' })).toBeNull() // 卡券沒有分頁
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[0])
    expect(handlers.onChange).toHaveBeenCalledWith({
      index: 0,
      value: {
        serviceId: 't1',
        designerId: 'd1',
        availableCount: 10,
        price: 8000,
        remark: '平日可用',
        isLocked: true,
        intoPerformanceWhileBuying: false,
      },
    })
    expect(handlers.setCouponModalOpen).toHaveBeenCalledWith(false)
  })

  it('已有卡券：新增在最後', () => {
    const { handlers } = renderCoupons({ couponsLength: 1, couponsOnPannel: [{ serviceId: 't9' }] })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '加入' })[1])
    expect(handlers.onChange.mock.calls[0][0].index).toBe(1)
  })

  it('選分類寫入 categoryIds；清除回到全部', () => {
    const { setters } = renderCoupons()
    fireEvent.click(within(dialog()).getByRole('button', { name: '剪髮' }))
    expect(setters.state.setting.categoryIds).toEqual(['cc-1'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除' }))
    expect(setters.state.setting.categoryIds).toEqual([])
    expect(setters.setSelectedCategorieName).toHaveBeenLastCalledWith('')
  })
})
