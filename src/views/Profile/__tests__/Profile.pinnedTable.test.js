// 保護「個人頁 › 功能釘選」：帶入已釘選的頁面與套用的其他店家（不含目前店家）；勾選分類全選／取消、點頁面切換釘選、搜尋標示、
// 拖曳調整順序、清除選取；儲存送出的 SET_PINNED_TABLE 為「套用店家＋依順序的頁面（附所屬分類，系統沒有的頁面不送）」，
// 成功後更新側欄的釘選（Redux），回 false 提示失敗、錯誤顯示訊息。
// 拖曳（react-beautiful-dnd）在 jsdom 無法操作，以 mock 直接呼叫 onDragEnd。GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { renderProfile } from './profileKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
const mockDnd = { onDragEnd: null }
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ onDragEnd, children }) => {
    mockDnd.onDragEnd = onDragEnd
    return children
  },
  Droppable: ({ children }) => children({ innerRef: () => {}, droppableProps: {}, placeholder: null }),
  Draggable: ({ children }) => children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }),
}))

const setup = (fixtures = {}, options = {}) =>
  renderProfile('pinnedTable', { fixtures: { SET_PINNED_TABLE: { setPinnedTable: true }, ...fixtures }, ...options })

const ready = () => screen.findByText('功能釘選設定')
const pinnedList = () => Array.from(screen.getByText('拖動按鈕調整排序').nextSibling.querySelectorAll('div.break-all')).map(n => n.textContent)
const groupCheckbox = title => screen.getByText(title, { selector: 'span' }).closest('[style]').querySelector('input[type="checkbox"]')
const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))
const sent = calls => callsOf(calls, 'SET_PINNED_TABLE')[0].variables.input

beforeEach(() => loginAs())
afterEach(cleanup)

describe('功能釘選', () => {
  it('帶入已釘選頁面；分類全選、點頁面切換、拖曳排序後送出（系統沒有的頁面不送），成功後更新側欄釘選', async () => {
    const { calls, store } = setup()
    await ready()
    expect(pinnedList()).toEqual(['帳單列表'])
    // 櫃檯作業部分勾選
    expect(groupCheckbox('櫃檯作業').indeterminate).toBe(true)
    fireEvent.click(groupCheckbox('櫃檯作業'))
    expect(pinnedList()).toEqual(['帳單列表', '打帳單', '掛單列表'])
    expect(groupCheckbox('櫃檯作業')).toBeChecked()
    // 展開全部後點「預約紀錄」加入、再點「打帳單」移除
    fireEvent.click(screen.getByRole('button', { name: '展開全部' }))
    fireEvent.click(await screen.findByText('預約紀錄'))
    fireEvent.click(screen.getByText('打帳單', { selector: 'span' }))
    expect(pinnedList()).toEqual(['帳單列表', '掛單列表', '預約紀錄'])
    // 拖曳：掛單列表移到第一；拖到外面不變
    act(() => mockDnd.onDragEnd({ source: { index: 1 }, destination: { index: 0 } }))
    act(() => mockDnd.onDragEnd({ source: { index: 0 }, destination: null }))
    expect(pinnedList()).toEqual(['掛單列表', '帳單列表', '預約紀錄'])
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '設定成功' }))
    expect(sent(calls)).toEqual({
      otherAppliedStoreIds: ['merchant-2'],
      pinnedTables: [
        { title: '櫃檯作業', name: '掛單列表' },
        { title: '櫃檯作業', name: '帳單列表' },
      ],
    })
    expect(store.getState().pinnedTable).toEqual(
      expect.objectContaining({
        table: [
          { title: '掛單列表', href: '/management/draft-orders' },
          { title: '帳單列表', href: '/management/orders' },
        ],
      })
    )
  })

  it('分類取消全選、清除選取；展開全部再按一次收合；點分類標題展開／收合', async () => {
    setup()
    await ready()
    fireEvent.click(groupCheckbox('櫃檯作業'))
    fireEvent.click(groupCheckbox('櫃檯作業'))
    expect(pinnedList()).toEqual([])
    fireEvent.click(groupCheckbox('預約管理'))
    expect(pinnedList()).toEqual(['預約紀錄'])
    fireEvent.click(screen.getByRole('button', { name: '清除選取' }))
    expect(pinnedList()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: '展開全部' }))
    expect(await screen.findByText('預約紀錄')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '展開全部' }))
    await wait(() => expect(screen.queryByText('預約紀錄')).toBeNull())
    fireEvent.click(screen.getByText('預約管理', { selector: 'span' }))
    expect(await screen.findByText('預約紀錄')).toBeInTheDocument()
    fireEvent.click(screen.getByText('預約管理', { selector: 'span' }))
    await wait(() => expect(screen.queryByText('預約紀錄')).toBeNull())
  })

  it('搜尋頁面：符合的頁面加框標示，清除搜尋取消標示', async () => {
    setup()
    await ready()
    fireEvent.click(screen.getByRole('button', { name: '展開全部' }))
    await screen.findByText('打帳單', { selector: 'span' })
    fireEvent.change(screen.getByPlaceholderText('搜尋頁面'), { target: { value: '帳單' } })
    const item = name => screen.getByText(name, { selector: 'span' }).closest('li')
    await wait(() => expect(item('打帳單').classList).toContain('outline-danger'))
    expect(item('帳單列表').classList).toContain('outline-danger')
    expect(item('預約紀錄').classList).not.toContain('outline-danger')
    fireEvent.click(screen.getByRole('button', { name: '清除搜尋文字' }))
    await wait(() => expect(item('打帳單').classList).not.toContain('outline-danger'))
  })

  it('套用店家：全選所有店家後送出', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.click(await screen.findByText('全選'))
    save()
    await wait(() => expect(callsOf(calls, 'SET_PINNED_TABLE')).toHaveLength(1))
    expect(sent(calls).otherAppliedStoreIds).toEqual(['merchant-1', 'merchant-2'])
  })

  it('後端回 false 提示失敗；錯誤顯示訊息', async () => {
    setup({ SET_PINNED_TABLE: { setPinnedTable: false } })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '設定失敗' }))
    cleanup()
    setup({ SET_PINNED_TABLE: new Error('釘選數量超過上限') })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '釘選數量超過上限' }))
    expect(screen.getByRole('button', { name: '清除選取' })).toBeEnabled()
  })

  it('系統沒有可釘選的頁面時樹狀清單為空', async () => {
    setup({ GET_PINNED_TABLE_DEF_STRUCTURES: { getPinnedTableDefStructures: '[]' } })
    await ready()
    expect(screen.queryByText('櫃檯作業')).toBeNull()
  })

  it('沒有釘選設定時從空白開始；設定載入中顯示骨架', async () => {
    setup({}, { pinned: null })
    await ready()
    expect(pinnedList()).toEqual([])
    cleanup()
    renderProfile('pinnedTable', { delays: { GET_PINNED_TABLE_DEF_STRUCTURES: 1000 } })
    await screen.findByRole('tab', { name: '功能釘選' })
    expect(screen.queryByText('功能釘選設定')).toBeNull()
    expect(await screen.findByText('功能釘選設定')).toBeInTheDocument()
  })
})

it('樹鍵盤展開與選取後，儲存保留原釘選值與店家', async () => {
  const { calls } = setup()
  await ready()
  expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
  const group = screen.getByRole('treeitem', { name: '櫃檯作業' })
  group.focus()
  fireEvent.keyDown(group, { key: 'ArrowRight' })
  fireEvent.keyDown(group, { key: 'ArrowRight' })
  const page = screen.getByRole('treeitem', { name: '打帳單' })
  expect(page).toHaveFocus()
  fireEvent.keyDown(page, { key: 'Enter' })
  expect(page).toHaveAttribute('aria-selected', 'true')
  save()
  await wait(() => expect(callsOf(calls, 'SET_PINNED_TABLE')).toHaveLength(1))
  expect(sent(calls)).toEqual({
    otherAppliedStoreIds: ['merchant-2'],
    pinnedTables: [
      { title: '櫃檯作業', name: '帳單列表' },
      { title: '櫃檯作業', name: '打帳單' },
    ],
  })
})

// 從沒設定過釘選的使用者，後端回的 pinnedSettings／usingStoreIds 可能是 null（2026/10/30 瀏覽器驗收發現）：
// 原本 JSON.parse(null).map 直接讓整個個人頁拋錯，使用者連基本資料都看不到。
describe('功能釘選：尚未設定過', () => {
  it('pinnedSettings 與 usingStoreIds 為 null 時仍顯示設定頁，釘選清單為空', async () => {
    setup({}, { pinned: { usingStoreIds: null, pinnedSettings: null } })
    await ready()
    expect(screen.queryByText('這個頁面發生錯誤')).toBeNull()
    expect(pinnedList()).toEqual([])
  })
})
