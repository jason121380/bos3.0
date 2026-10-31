// 切換店家清單的觸控／相容 click 細節。為什麼重要：選店後整頁換到另一家店，多送一次 click 可能把選取落在別的節點
// （例如剛展開的群組又被收合、或點到下一家店）。守住：
// - 放開後吞掉相容 click 的時間窗只有 500ms，過了恢復正常；連續兩次觸控不會留下第一次的吞 click 監聽；
// - 同一下觸控補送的第二次 click 也不會再觸發；
// - pointercancel（系統接手捲動）或在別的節點放開，都不選。
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MerchantBar from '../MerchantBar'

const installedPointerEvent = typeof window.PointerEvent !== 'function'
if (installedPointerEvent) {
  window.PointerEvent = class PointerEvent extends window.MouseEvent {
    constructor(type, props = {}) {
      super(type, props)
      this.pointerId = props.pointerId == null ? 1 : props.pointerId
      this.pointerType = props.pointerType || ''
      this.isPrimary = props.isPrimary !== false
    }
  }
}
afterAll(() => {
  if (installedPointerEvent) delete window.PointerEvent
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

const data = {
  allMerchants: [
    { id: 'm1', name: '台北店' },
    { id: 'm2', name: '台中店' },
  ],
  groups: [
    { no: 'G1', name: '北區', groups: [], merchants: [{ id: 'm1', name: '台北店' }] },
    { no: 'G2', name: '中區', groups: [], merchants: [{ id: 'm2', name: '台中店' }] },
  ],
  merchants: [],
}

const renderBar = () =>
  render(
    <MemoryRouter initialEntries={['/management/orders']}>
      <MerchantBar open onClose={() => {}} userMerchants={{ loading: false, data: { getUserMerchant: JSON.stringify(data) } }} />
    </MemoryRouter>
  )
const btn = text => screen.getByText(text, { exact: false, selector: 'button, button *' }).closest('button')
const expanded = text => btn(text).parentElement.getAttribute('aria-expanded')
const touch = (node, type, x, y) => fireEvent[type](node, { pointerType: 'touch', pointerId: 1, clientX: x, clientY: y })

describe('MerchantList 觸控與相容 click', () => {
  it('觸控滑動後 500ms 內的 click 被吞掉；時間到後恢復正常點擊', () => {
    jest.useFakeTimers()
    renderBar()
    const group = btn('G2 - 中區')
    touch(group, 'pointerDown', 0, 0)
    touch(group, 'pointerUp', 0, 30)
    fireEvent.click(group)
    expect(expanded('G2 - 中區')).toBe('false')
    act(() => {
      jest.advanceTimersByTime(500)
    })
    fireEvent.click(btn('G2 - 中區'))
    expect(expanded('G2 - 中區')).toBe('true')
  })

  it('連續兩次觸控：只吞一次 click；同一下觸控補送的第二次 click 也不觸發', () => {
    jest.useFakeTimers()
    renderBar()
    touch(btn('G1 - 北區'), 'pointerDown', 0, 0)
    touch(btn('G1 - 北區'), 'pointerUp', 0, 30)
    touch(btn('G2 - 中區'), 'pointerDown', 0, 0)
    touch(btn('G2 - 中區'), 'pointerUp', 0, 30)
    fireEvent.click(btn('G2 - 中區'))
    fireEvent.click(btn('G2 - 中區'))
    expect(expanded('G2 - 中區')).toBe('false')
    // 第一次的吞 click 監聽已移除：點別的節點正常展開
    fireEvent.click(btn('G1 - 北區'))
    expect(expanded('G1 - 北區')).toBe('true')
  })

  it('pointercancel 後放開、或在別的節點放開，都不選', () => {
    renderBar()
    touch(btn('G2 - 中區'), 'pointerDown', 0, 0)
    fireEvent.pointerCancel(btn('G2 - 中區'))
    touch(btn('G2 - 中區'), 'pointerUp', 0, 0)
    expect(expanded('G2 - 中區')).toBe('false')
    touch(btn('G1 - 北區'), 'pointerDown', 0, 0)
    touch(btn('G2 - 中區'), 'pointerUp', 0, 0)
    expect(expanded('G1 - 北區')).toBe('false')
    expect(expanded('G2 - 中區')).toBe('false')
  })
})

describe('MerchantList 搜尋', () => {
  it('群組資料缺少子群組欄位時搜尋仍可展開，不拋錯', () => {
    const noSubGroups = { ...data, groups: [{ no: 'G9', name: '南區', merchants: [{ id: 'm2', name: '台中店' }] }] }
    render(
      <MemoryRouter initialEntries={['/management/orders']}>
        <MerchantBar open onClose={() => {}} userMerchants={{ loading: false, data: { getUserMerchant: JSON.stringify(noSubGroups) } }} />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '台中' } })
    expect(expanded('G9 - 南區')).toBe('true')
  })

  it('搜尋時資料缺少 allMerchants、群組缺少 merchants 也不拋錯；群組名稱符合仍保留', () => {
    const partial = { groups: [{ no: 'G5', name: '台中區', groups: [] }], merchants: [{ id: 'm3', name: '台中三店' }] }
    render(
      <MemoryRouter initialEntries={['/management/orders']}>
        <MerchantBar open onClose={() => {}} userMerchants={{ loading: false, data: { getUserMerchant: JSON.stringify(partial) } }} />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '台中' } })
    expect(btn('G5 - 台中區')).toBeInTheDocument()
    expect(btn('台中三店')).toBeInTheDocument()
    expect(btn('全部(0)')).toBeInTheDocument()
  })
})

describe('MerchantBar 查詢失敗', () => {
  it('沒有 refetch 時只顯示錯誤，不出現點了沒反應的「重新查詢」', () => {
    render(
      <MemoryRouter initialEntries={['/management/orders']}>
        <MerchantBar open onClose={() => {}} userMerchants={{ loading: false, error: new Error('失敗'), data: null }} />
      </MemoryRouter>
    )
    expect(screen.getByText('無法載入店家清單')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重新查詢' })).toBeNull()
  })
})
