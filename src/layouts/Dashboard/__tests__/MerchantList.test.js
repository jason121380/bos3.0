// 保護什麼：切換店家視窗（MerchantBar＋MerchantList）。多店老闆靠它在分店間切換，選錯店會把帳單打到別家店。
// - 店家清單來自 getUserMerchant（JSON 字串）：解析失敗或尚未載入時顯示載入中，不拋錯。
// - 搜尋：依店名篩選「全部」、群組（含子群組）與未分組店家；群組名稱符合時保留群組；搜尋時自動展開所有群組。
// - 樹狀清單：群組顯示「代號 - 名稱(數量)」，點群組展開／收合；點店家時記住新店家並回到打帳單、重新整理頁面。
// - 鍵盤（比照原 MUI TreeView）：上下移動、右展開／進入子項、左收合／回父層、Home／End、打字跳到字首相符的項目。
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import MerchantBar from '../MerchantBar'
import MerchantList from '../MerchantList'

const data = {
  allMerchants: [
    { id: 'm1', name: '台北店' },
    { id: 'm2', name: '台中店' },
    { id: 'm3', name: '高雄店' },
  ],
  groups: [
    {
      no: 'G1',
      name: '北區',
      groups: [{ no: '', name: '雙北', groups: [], merchants: [{ id: 'm1', name: '台北店' }] }],
      merchants: [],
    },
    { no: 'G2', name: '中區', groups: [], merchants: [{ id: 'm2', name: '台中店' }] },
  ],
  merchants: [{ id: 'm3', name: '高雄店' }],
}

afterEach(cleanup)

const renderBar = (userMerchants, initial = '/management/orders') =>
  render(
    <MemoryRouter initialEntries={[initial]}>
      <MerchantBar open onClose={() => {}} userMerchants={userMerchants} />
      <Route render={({ location }) => <output data-testid="loc">{location.pathname}</output>} />
    </MemoryRouter>
  )
const loaded = (d = data) => ({ loading: false, data: { getUserMerchant: JSON.stringify(d) } })
const items = () => screen.getAllByRole('treeitem').map(li => li.firstChild.textContent)
const btn = text => screen.getByText(text, { exact: false, selector: 'button, button *' }).closest('button')

describe('MerchantBar：資料與搜尋', () => {
  it('尚未載入、沒有資料或 JSON 壞掉時顯示載入中，不拋錯', () => {
    const { unmount } = renderBar({ loading: true, data: null })
    expect(screen.queryByRole('tree')).toBeNull()
    unmount()
    const { unmount: u2 } = renderBar({ loading: false, data: { getUserMerchant: '{壞掉' } })
    expect(screen.queryByRole('tree')).toBeNull()
    u2()
    renderBar({ loading: false, data: {} })
    expect(screen.queryByRole('tree')).toBeNull()
  })

  it('未搜尋時顯示「全部」、各群組（代號 - 名稱(數量)）與未分組店家，群組預設收合', () => {
    renderBar(loaded())
    expect(items()).toEqual(['全部(3)', 'G1 - 北區(1)', 'G2 - 中區(1)', '高雄店'])
  })

  it('搜尋店名：保留含符合店家的群組與子群組並自動展開；不分大小寫', () => {
    renderBar(loaded())
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '台北' } })
    expect(items()).toEqual(['全部(1)', '台北店', 'G1 - 北區(1)', ' - 雙北(1)', '台北店'])
  })

  it('群組名稱符合時保留該群組（即使店名不符合）；群組或最外層缺少 merchants／groups 欄位時當成空清單', () => {
    const { unmount } = renderBar(
      loaded({ allMerchants: [], groups: [{ no: 'G2', name: 'Central', groups: [{ no: '', name: '子', groups: [], merchants: [{ id: 'x', name: '其他' }] }] }] })
    )
    expect(items()).toEqual(['全部(0)', 'G2 - Central(1)'])
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: 'central' } })
    expect(items()).toEqual(['全部(0)', 'G2 - Central(0)'])
    unmount()
    renderBar(loaded({ allMerchants: [{ id: 'm1', name: '台北店' }], merchants: [{ id: 'm1', name: '台北店' }] }))
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '台北' } })
    expect(items()).toEqual(['全部(1)', '台北店', '台北店'])
  })
})

describe('MerchantBar：關閉', () => {
  it('按 Esc 呼叫 onClose', () => {
    const onClose = jest.fn()
    render(
      <MemoryRouter>
        <MerchantBar open onClose={onClose} userMerchants={loaded()} />
      </MemoryRouter>
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})

describe('MerchantList：點擊', () => {
  it('點群組展開／收合；點店家記住新店家、回到打帳單並重新整理', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    renderBar(loaded())
    fireEvent.click(btn('G2 - 中區'))
    expect(items()).toContain('台中店')
    fireEvent.click(btn('G2 - 中區'))
    expect(items()).not.toContain('台中店')
    fireEvent.click(btn('高雄店'))
    spy.mockRestore()
    expect(JSON.parse(localStorage.getItem('userMerchant'))).toBe(JSON.stringify({ id: 'm3', name: '高雄店' }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/order/create')
  })

  it('沒有子項的群組點了不展開', () => {
    renderBar(loaded({ allMerchants: [], groups: [{ no: 'E', name: '空群組', groups: [], merchants: [] }], merchants: [] }))
    fireEvent.click(btn('E - 空群組'))
    expect(screen.getAllByRole('treeitem')[1]).not.toHaveAttribute('aria-expanded')
  })

  // Jason 2026/10/22 fix all：原本群組缺少 groups 欄位時標籤計算 data.groups.length 會拋錯（建立子項時有防呆、標籤沒有）、
  // 缺少 allMerchants 時「全部」的數量也會拋錯，整個側欄頂列跟著壞掉；改為缺欄位視為空
  it('群組缺少 groups／merchants 欄位、資料缺少 allMerchants 時視為空，不拋錯', () => {
    render(
      <MemoryRouter>
        <MerchantList merchants={{ groups: [{ no: 'X', name: '缺欄位', merchants: [{ id: 'm9', name: '新竹店' }] }, { no: 'Y', name: '全缺' }], merchants: [] }} searchQuery="" />
      </MemoryRouter>
    )
    expect(items()).toEqual(['全部(0)', 'X - 缺欄位(1)', 'Y - 全缺(0)'])
    fireEvent.click(btn('X - 缺欄位'))
    expect(items()).toContain('新竹店')
  })
})

describe('MerchantList：鍵盤', () => {
  beforeEach(() => jest.useFakeTimers('modern'))
  afterEach(() => jest.useRealTimers())

  const key = (target, k, extra = {}) => {
    fireEvent.keyDown(target, { key: k, ...extra })
    act(() => jest.runOnlyPendingTimers())
    return document.activeElement
  }

  it('上下移動、Home／End；到頭尾時停住', () => {
    renderBar(loaded())
    const all = btn('全部(3)')
    expect(all).toHaveAttribute('tabindex', '0')
    expect(key(all, 'ArrowUp')).toBe(all)
    expect(key(all, 'ArrowDown')).toBe(btn('G1 - 北區'))
    expect(key(document.activeElement, 'End')).toBe(btn('高雄店'))
    expect(key(document.activeElement, 'ArrowDown')).toBe(btn('高雄店'))
    expect(key(document.activeElement, 'Home')).toBe(all)
  })

  it('右鍵：收合的群組展開、已展開時進入第一個子項；左鍵：已展開時收合、子項回到父層；葉節點左右鍵不動', () => {
    renderBar(loaded())
    const g1 = btn('G1 - 北區')
    act(() => g1.focus())
    key(g1, 'ArrowRight')
    expect(g1.parentElement).toHaveAttribute('aria-expanded', 'true')
    const sub = key(g1, 'ArrowRight')
    expect(sub).toBe(btn('- 雙北'))
    key(sub, 'ArrowRight')
    const leaf = key(document.activeElement, 'ArrowRight')
    expect(leaf.textContent).toBe('台北店')
    expect(key(leaf, 'ArrowRight')).toBe(leaf)
    expect(key(leaf, 'ArrowLeft')).toBe(btn('- 雙北'))
    key(document.activeElement, 'ArrowLeft')
    expect(btn('- 雙北').parentElement).toHaveAttribute('aria-expanded', 'false')
    expect(key(document.activeElement, 'ArrowLeft')).toBe(g1)
    key(g1, 'ArrowLeft')
    expect(g1.parentElement).toHaveAttribute('aria-expanded', 'false')
    // 頂層葉節點左鍵：沒有父層，不動
    const top = btn('高雄店')
    act(() => top.focus())
    expect(key(top, 'ArrowLeft')).toBe(top)
  })

  it('打字跳到字首相符的下一個項目，連續輸入累加；超過 800ms 重新開始；Ctrl／空白鍵不觸發', () => {
    renderBar(loaded())
    const all = btn('全部(3)')
    act(() => all.focus())
    expect(key(all, '高').textContent).toBe('高雄店')
    act(() => jest.advanceTimersByTime(900))
    expect(key(document.activeElement, 'g').textContent).toContain('北區')
    expect(key(document.activeElement, '2').textContent).toContain('中區')
    const before = document.activeElement
    expect(key(before, 'x', { ctrlKey: true })).toBe(before)
    expect(key(before, ' ')).toBe(before)
    act(() => jest.advanceTimersByTime(900))
    expect(key(before, 'z')).toBe(before)
  })

  it('目前焦點的項目被收合隱藏時，可 Tab 的項目退回第一項', () => {
    renderBar(loaded())
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '台中' } })
    const leaf = screen.getAllByText('台中店', { selector: 'button *' }).pop().closest('button')
    act(() => leaf.focus())
    expect(leaf).toHaveAttribute('tabindex', '0')
    // 清空搜尋：群組收合，原本聚焦的店家不在畫面上
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '' } })
    expect(btn('全部(3)')).toHaveAttribute('tabindex', '0')
  })

  it('移動焦點後元件馬上卸載（關閉視窗）時，延後的聚焦不拋錯', () => {
    const { unmount } = renderBar(loaded())
    fireEvent.keyDown(btn('全部(3)'), { key: 'ArrowDown' })
    unmount()
    expect(() => act(() => jest.runOnlyPendingTimers())).not.toThrow()
  })

  it('沒有任何節點可見以外的情況：清單只有「全部」時 End 停在全部', () => {
    renderBar(loaded({ allMerchants: [], groups: [], merchants: [] }))
    const all = btn('全部(0)')
    expect(key(all, 'End')).toBe(all)
  })
})
