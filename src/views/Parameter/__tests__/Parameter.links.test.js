// 保護：系統參數「顧客端」「設計師端」分頁。
// - 顧客端頁面顯示、功能設定（新客必填欄位多選送代碼）、顧客端預約設定（預約最短時長送數字）；
// - 外部連結（顧客端可置頂；設計師端可指定角色權限）：新增、編輯、刪除各自送出正確的 mutation 與欄位，
//   名稱／網址空白時提示且不送出，失敗時提示並可再按；成功後重抓清單、畫面出現新連結；
// - 調整排序：少於兩個連結時停用；拖曳後送出新的 id 順序；
// - 設計師端：預約總覽顯示顧客備註。
// 拖曳（react-beautiful-dnd）在 jsdom 無法操作，以替身直接呼叫 onDragEnd；GraphQL 由模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { baseFixtures, renderParameter, openTab, save, sent, checkboxByLabel, controlByLabel, selectValue, typeText, cardOf } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
// 拖曳排序替身：記下 onDragEnd，Droppable／Draggable 以最小的 provided 呼叫 render prop
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ onDragEnd, children }) => {
    global.__onDragEnd = onDragEnd
    return children
  },
  Droppable: ({ children }) => children({ innerRef: () => {}, droppableProps: {}, placeholder: null }),
  Draggable: ({ children, draggableId }) =>
    children({ innerRef: () => {}, draggableProps: { 'data-draggable-id': draggableId }, dragHandleProps: {} }),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const dialog = () => screen.getByRole('dialog')

describe('顧客端分頁', () => {
  it('頁面顯示、功能設定、新客必填欄位、預約設定與預約最短時長', async () => {
    const utils = await renderParameter()
    await openTab('顧客端')
    fireEvent.click(checkboxByLabel('入金紀錄'))
    fireEvent.click(checkboxByLabel('服務紀錄'))
    fireEvent.click(checkboxByLabel('同步顧客個人資料'))
    fireEvent.click(checkboxByLabel('關閉顧客端預約'))
    fireEvent.click(checkboxByLabel('顯示預約項目價格'))
    // 新客必填欄位：原本 Email、生日，移除 Email、加選地址
    const card = cardOf('顧客端功能設定')
    fireEvent.mouseDown(within(card).getByRole('button', { name: '移除 Email' }))
    fireEvent.click(within(card).getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: '地址' }))
    await selectValue(controlByLabel('預約最短時長'), '3小時')
    await save(utils)
    expect(sent(utils.calls, 'SET_PARAMETER_ABOUT_CUSTOMER_SETTING').input).toEqual({
      ...baseFixtures().GET_PARAMETER_ABOUT_CUSTOMER_SETTING.getParameterAboutCustomerSetting,
      customerSidePageDisplay: { ServiceRecord: false, TicketRecord: true, WalletRecord: true, BonusRecord: false, CustomerMall: false },
      isCustomerProfileSync: true,
      closeCustomerBooking: true,
      isBookingItemPriceDisplay: false,
      requiredColumnForNewCustomer: ['BIRTHDAY', 'ADDRESS'],
      // 選項值為數字，送出數字
      bookingMinumnTimeCost: 6,
    })
  })
})

describe('顧客端外部連結', () => {
  const linkCard = () => cardOf('外部連結設定')

  it('新增：名稱／網址空白時提示不送出；含置頂送出後重抓、畫面出現新連結', async () => {
    let listCalls = 0
    const links = baseFixtures().MerchantCusExternalLink.merchantCusExternalLink
    const utils = await renderParameter({
      fixtures: {
        MerchantCusExternalLink: () => {
          listCalls += 1
          return { merchantCusExternalLink: listCalls === 1 ? links : [...links, { id: 'cl-3', name: '預約須知', url: 'https://n.example', isTop: true }] }
        },
        CREATE_MERCHANT_CUS_EXTERNAL_LINK: { createMerchantCusExternalLink: true },
      },
    })
    await openTab('顧客端')
    // 置頂的連結顯示置頂圖示
    expect(within(linkCard()).getByRole('button', { name: '官網' }).querySelector('.svgWrap')).not.toBeNull()
    expect(within(linkCard()).getByRole('button', { name: '粉專' }).querySelector('.svgWrap')).toBeNull()
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    expect(within(dialog()).getByText('新增外部連結')).toBeInTheDocument()
    expect(within(dialog()).queryByRole('button', { name: '刪除' })).toBeNull()
    fireEvent.click(within(dialog()).getByRole('button', { name: '新增' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入名稱', variant: 'warning' })
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), '預約須知')
    fireEvent.click(within(dialog()).getByRole('button', { name: '新增' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入網址', variant: 'warning' })
    expect(within(dialog()).getByRole('button', { name: '新增' })).not.toBeDisabled()
    await typeText(within(dialog()).getByPlaceholderText('請輸入網址 ex:https://www.mlgroup.io'), 'https://n.example')
    fireEvent.click(checkboxByLabel('置頂', dialog()))
    fireEvent.click(within(dialog()).getByRole('button', { name: '新增' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'CREATE_MERCHANT_CUS_EXTERNAL_LINK')).toEqual({ input: { name: '預約須知', url: 'https://n.example', isTop: true } })
    // 新增成功不另外提示；重抓後畫面出現新連結
    expect(openSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }))
    await wait(() => expect(within(linkCard()).getByRole('button', { name: '預約須知' })).toBeInTheDocument())
  })

  it('新增失敗：顯示錯誤並可再按', async () => {
    await renderParameter({ fixtures: { CREATE_MERCHANT_CUS_EXTERNAL_LINK: new Error('名稱重複') } })
    await openTab('顧客端')
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), '官網')
    await typeText(within(dialog()).getByPlaceholderText('請輸入網址 ex:https://www.mlgroup.io'), 'https://x.example')
    fireEvent.click(within(dialog()).getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '名稱重複', variant: 'error' }))
    expect(within(dialog()).getByRole('button', { name: '新增' })).not.toBeDisabled()
    fireEvent.click(within(dialog()).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('編輯：帶入原資料，修改名稱與取消置頂後送出；刪除送出 id', async () => {
    const utils = await renderParameter({
      fixtures: {
        UPDATE_MERCHANT_CUS_EXTERNAL_LINK: { updateMerchantCusExternalLink: true },
        DELETE_MERCHANT_CUS_EXTERNAL_LINK: { deleteMerchantCusExternalLink: true },
      },
    })
    await openTab('顧客端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '官網' }))
    expect(within(dialog()).getByText('編輯外部連結')).toBeInTheDocument()
    expect(within(dialog()).getByPlaceholderText('請輸入名稱')).toHaveValue('官網')
    expect(checkboxByLabel('置頂', dialog())).toBeChecked()
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), '官方網站')
    fireEvent.click(checkboxByLabel('置頂', dialog()))
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'UPDATE_MERCHANT_CUS_EXTERNAL_LINK')).toEqual({
      input: { id: 'cl-1', name: '官方網站', url: 'https://shop.example', isTop: false },
    })
    // 關窗後再開「新增」是空白表單
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    expect(within(dialog()).getByPlaceholderText('請輸入名稱')).toHaveValue('')
    fireEvent.click(within(dialog()).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(within(linkCard()).getByRole('button', { name: '粉專' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '刪除' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'DELETE_MERCHANT_CUS_EXTERNAL_LINK')).toEqual({ input: 'cl-2' })
  })

  it('編輯時名稱清空：提示不送出；儲存與刪除失敗時提示', async () => {
    const utils = await renderParameter({
      fixtures: {
        UPDATE_MERCHANT_CUS_EXTERNAL_LINK: new Error('更新失敗'),
        DELETE_MERCHANT_CUS_EXTERNAL_LINK: new Error('使用中無法刪除'),
      },
    })
    await openTab('顧客端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '官網' }))
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), ' ')
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入名稱', variant: 'warning' })
    expect(callsOf(utils.calls, 'UPDATE_MERCHANT_CUS_EXTERNAL_LINK')).toHaveLength(0)
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), '官網2')
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '更新失敗', variant: 'error' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '使用中無法刪除', variant: 'error' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('調整排序：拖曳後送出新順序並重抓；放到清單外不變；取消關窗', async () => {
    const utils = await renderParameter({ fixtures: { SORT_MERCHANT_CUS_EXTERNAL_LINK: { sortMerchantCusExternalLink: true } } })
    await openTab('顧客端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '調整排序' }))
    const items = () => [...dialog().querySelectorAll('[data-draggable-id]')].map(el => el.textContent)
    expect(items()).toEqual(['官網', '粉專'])
    // 置頂圖示
    expect(dialog().querySelectorAll('.svgWrap')).toHaveLength(1)
    act(() => global.__onDragEnd({ source: { index: 0 }, destination: null }))
    expect(items()).toEqual(['官網', '粉專'])
    act(() => global.__onDragEnd({ source: { index: 0 }, destination: { index: 1 } }))
    expect(items()).toEqual(['粉專', '官網'])
    const listBefore = callsOf(utils.calls, 'MerchantCusExternalLink').length
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '儲存成功', variant: 'success' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'SORT_MERCHANT_CUS_EXTERNAL_LINK')).toEqual({ input: ['cl-2', 'cl-1'] })
    await wait(() => expect(callsOf(utils.calls, 'MerchantCusExternalLink').length).toBeGreaterThan(listBefore))
    fireEvent.click(within(linkCard()).getByRole('button', { name: '調整排序' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('排序失敗時提示錯誤、可再按；少於兩個連結時「調整排序」停用；沒有連結時可新增', async () => {
    await renderParameter({ fixtures: { SORT_MERCHANT_CUS_EXTERNAL_LINK: new Error('排序失敗') } })
    await openTab('顧客端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '調整排序' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '排序失敗', variant: 'error' }))
    expect(within(dialog()).getByRole('button', { name: '儲存' })).not.toBeDisabled()
    cleanup()
    await renderParameter({ fixtures: { MerchantCusExternalLink: { merchantCusExternalLink: [] } } })
    await openTab('顧客端')
    expect(within(linkCard()).getByRole('button', { name: '調整排序' })).toBeDisabled()
    expect(linkCard()).toHaveTextContent('無資料')
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    expect(within(dialog()).getByText('新增外部連結')).toBeInTheDocument()
  })
})

describe('設計師端分頁', () => {
  const linkCard = () => cardOf('外部連結設定')

  it('新增連結：指定角色權限送出權限 id；沒有置頂選項；重抓後畫面出現新連結', async () => {
    let listCalls = 0
    const links = baseFixtures().GET_MERCHANT_EXTERNAL_LINK.merchantExternalLink
    const utils = await renderParameter({
      fixtures: {
        CREATE_MERCHANT_EXTERNAL_LINK: { createMerchantExternalLink: true },
        GET_MERCHANT_EXTERNAL_LINK: () => {
          listCalls += 1
          return { merchantExternalLink: listCalls === 1 ? links : [...links, { id: 'el-3', name: '班表', url: 'https://s.example', userAuth: [] }] }
        },
      },
    })
    await openTab('設計師端')
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    expect(within(dialog()).queryByText('置頂')).toBeNull()
    await typeText(within(dialog()).getByPlaceholderText('請輸入名稱'), '班表')
    await typeText(within(dialog()).getByPlaceholderText('請輸入網址 ex:https://www.mlgroup.io'), 'https://s.example')
    const combo = within(dialog()).getByRole('combobox')
    await wait(() => expect(combo).not.toBeDisabled())
    fireEvent.click(combo)
    fireEvent.click(screen.getByRole('option', { name: '設計師' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '新增' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'CREATE_MERCHANT_EXTERNAL_LINK')).toEqual({ input: { name: '班表', url: 'https://s.example', userAuthIds: ['auth-2'] } })
    await wait(() => expect(within(linkCard()).getByRole('button', { name: '班表' })).toBeInTheDocument())
  })

  it('編輯連結：帶入原權限，加選後送出；刪除送出 id', async () => {
    const utils = await renderParameter({
      fixtures: {
        UPDATE_MERCHANT_EXTERNAL_LINK: { updateMerchantExternalLink: true },
        DELETE_MERCHANT_EXTERNAL_LINK: { deleteMerchantExternalLink: true },
      },
    })
    await openTab('設計師端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '教育訓練' }))
    const combo = within(dialog()).getByRole('combobox')
    // 權限清單讀取中停用
    expect(combo).toBeDisabled()
    await wait(() => expect(combo).not.toBeDisabled())
    expect(within(dialog()).getByRole('button', { name: '移除 店長' })).toBeInTheDocument()
    fireEvent.click(combo)
    fireEvent.click(screen.getByRole('option', { name: '設計師' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'UPDATE_MERCHANT_EXTERNAL_LINK')).toEqual({
      input: { id: 'el-1', name: '教育訓練', url: 'https://a.example', userAuthIds: ['auth-1', 'auth-2'] },
    })
    fireEvent.click(within(linkCard()).getByRole('button', { name: '公告' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '刪除' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'DELETE_MERCHANT_EXTERNAL_LINK')).toEqual({ input: 'el-2' })
  })

  it('調整排序送出設計師端的 mutation；沒有連結時顯示無資料可新增', async () => {
    const utils = await renderParameter({ fixtures: { SORT_MERCHANT_EXTERNAL_LINK: { sortMerchantExternalLink: true } } })
    await openTab('設計師端')
    fireEvent.click(within(linkCard()).getByRole('button', { name: '調整排序' }))
    // 設計師端沒有置頂圖示
    expect(dialog().querySelectorAll('.svgWrap')).toHaveLength(0)
    act(() => global.__onDragEnd({ source: { index: 1 }, destination: { index: 0 } }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '儲存' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(sent(utils.calls, 'SORT_MERCHANT_EXTERNAL_LINK')).toEqual({ input: ['el-2', 'el-1'] })
    expect(callsOf(utils.calls, 'SORT_MERCHANT_CUS_EXTERNAL_LINK')).toHaveLength(0)
    cleanup()
    await renderParameter({ fixtures: { GET_MERCHANT_EXTERNAL_LINK: { merchantExternalLink: [] } } })
    await openTab('設計師端')
    expect(linkCard()).toHaveTextContent('無資料')
    fireEvent.click(linkCard().querySelector('svg.lucide-plus'))
    expect(within(dialog()).getByText('新增外部連結')).toBeInTheDocument()
  })

  it('預約總覽顯示顧客備註：取消勾選送出 false', async () => {
    const utils = await renderParameter()
    await openTab('設計師端')
    fireEvent.click(checkboxByLabel('預約總覽顯示顧客備註'))
    await save(utils)
    expect(sent(utils.calls, 'SET_IS_CBRD_STYLIST')).toEqual({ input: false })
  })
})
