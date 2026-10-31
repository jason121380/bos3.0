// 側欄細項浮層（SidebarFlyout）與其定位函式的其餘情況。
// 為什麼重要：浮層掛在 body 末端、位置由側欄右緣算出；側欄寬度改變（收合／展開）要重新量，
// 同時只能有一個浮層開著（新開的要關掉舊的），量不到尺寸時不能畫出跑版的浮層或拋錯。
import React from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import {
  claimSidebarFlyout,
  placeSidebarFlyout,
  releaseSidebarFlyout,
  sidebarFlyoutColumnCount,
  sidebarFlyoutShellWidth,
  splitSidebarFlyoutColumns,
  SidebarFlyout,
} from '../sidebar'

const originalResizeObserver = window.ResizeObserver
const observers = []
class FakeResizeObserver {
  constructor(callback) {
    this.callback = callback
    this.observed = []
    this.disconnect = jest.fn()
    observers.push(this)
  }
  observe(node) {
    this.observed.push(node)
  }
}

beforeEach(() => {
  observers.length = 0
  window.ResizeObserver = FakeResizeObserver
})
afterEach(() => {
  cleanup()
  window.ResizeObserver = originalResizeObserver
  jest.restoreAllMocks()
})

describe('同時只開一個浮層', () => {
  it('新的浮層登記時關掉前一個；同一個重複登記不關自己；釋放後不再被關', () => {
    const first = jest.fn()
    const second = jest.fn()
    claimSidebarFlyout(first)
    claimSidebarFlyout(first)
    expect(first).not.toHaveBeenCalled()
    claimSidebarFlyout(second)
    expect(first).toHaveBeenCalledTimes(1)
    releaseSidebarFlyout(first)
    releaseSidebarFlyout(second)
    claimSidebarFlyout(first)
    expect(second).not.toHaveBeenCalled()
    releaseSidebarFlyout(first)
  })
})

describe('定位函式的預設與防呆', () => {
  it('不給參數或給非數字時以 0 計算，不產生 NaN', () => {
    const box = placeSidebarFlyout()
    expect(Object.values(box).every(Number.isFinite)).toBe(true)
    const odd = placeSidebarFlyout({ sidebarRight: NaN, anchorRight: undefined, viewportWidth: NaN, viewportHeight: NaN })
    expect(Object.values(odd).every(Number.isFinite)).toBe(true)
  })

  it('欄寬：預設留浮層間距；左內距不是數字時不留', () => {
    expect(sidebarFlyoutShellWidth(1)).toBe('calc(15rem + 4px)')
    expect(sidebarFlyoutShellWidth(2, NaN)).toBe('calc(2 * 15rem + 1rem + 0px)')
  })

  it('沒有項目時算一欄', () => {
    expect(splitSidebarFlyoutColumns(null)).toEqual([[]])
    expect(sidebarFlyoutColumnCount(-3)).toBe(1)
  })
})

describe('SidebarFlyout 量測', () => {
  const rect = right => ({ top: 0, bottom: 40, left: 0, right, width: right, height: 40, x: 0, y: 0 })

  function Harness({ anchorRef }) {
    return (
      <aside>
        <button type="button" ref={anchorRef}>
          會員
        </button>
        <SidebarFlyout id="fly" anchorRef={anchorRef} label="會員細項">
          <a href="/a">會員列表</a>
        </SidebarFlyout>
      </aside>
    )
  }

  it('觀察側欄尺寸；側欄變寬時浮層跟著右移，尺寸沒變時不重畫；卸載時停止觀察', () => {
    let right = 264
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rect(right))
    const anchorRef = React.createRef()
    const { unmount } = render(<Harness anchorRef={anchorRef} />)
    const region = screen.getByRole('region', { name: '會員細項' })
    expect(region.style.left).toBe('264px')
    expect(observers).toHaveLength(1)
    expect(observers[0].observed[0].tagName).toBe('ASIDE')
    act(() => observers[0].callback())
    expect(screen.getByRole('region', { name: '會員細項' })).toBe(region)
    right = 300
    act(() => observers[0].callback())
    expect(region.style.left).toBe('300px')
    unmount()
    expect(observers[0].disconnect).toHaveBeenCalled()
  })

  it('沒有 ResizeObserver 的瀏覽器仍可顯示，不觀察', () => {
    delete window.ResizeObserver
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rect(264))
    const { unmount } = render(<Harness anchorRef={React.createRef()} />)
    expect(screen.getByRole('region', { name: '會員細項' })).toBeInTheDocument()
    expect(() => unmount()).not.toThrow()
  })

  it('錨點不在側欄（aside）裡時以錨點本身的右緣為準', () => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rect(200))
    const anchorRef = React.createRef()
    render(
      <div>
        <button type="button" ref={anchorRef}>
          會員
        </button>
        <SidebarFlyout id="fly" anchorRef={anchorRef} label="會員細項">
          <a href="/a">會員列表</a>
        </SidebarFlyout>
      </div>
    )
    expect(screen.getByRole('region', { name: '會員細項' }).style.left).toBe('200px')
    expect(observers).toHaveLength(0)
  })

  it('錨點還沒掛上時不畫浮層', () => {
    render(
      <SidebarFlyout id="fly" anchorRef={{ current: null }} label="會員細項">
        <a href="/a">會員列表</a>
      </SidebarFlyout>
    )
    expect(screen.queryByRole('region')).toBeNull()
  })
})
