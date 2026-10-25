// 側欄抽屜：iPhone PWA 狀態列（頂部安全區）白條只在抽屜打開時出現，且不攔點擊（fix/pwa-statusbar-white）
// 主側欄細項浮層：左緣貼側欄、視窗滿高、由上往下；超過 10 項才換欄。
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { Sidebar, SidebarFlyout, placeSidebarFlyout, sidebarFlyoutColumnCount, sidebarFlyoutShellWidth, splitSidebarFlyoutColumns, SIDEBAR_FLYOUT_GAP, SIDEBAR_FLYOUT_VIEWPORT_MARGIN } from '../sidebar'

const strip = container => container.querySelector('.h-\\[env\\(safe-area-inset-top\\)\\]')

test('抽屜打開時頂部安全區有白色細條，且在遮罩與抽屜之上、不攔點擊', () => {
  const { container } = render(<Sidebar mobileOpen onMobileClose={() => {}}>內容</Sidebar>)
  const el = strip(container)
  expect(el).toBeTruthy()
  expect(el.className).toContain('bg-canvas')
  expect(el.className).toContain('pointer-events-none')
  expect(el.className).toContain('z-[1201]')
  expect(el.className).toContain('lg:hidden')
})

test('抽屜關閉時不渲染白色細條', () => {
  const { container } = render(<Sidebar mobileOpen={false} onMobileClose={() => {}}>內容</Sidebar>)
  expect(strip(container)).toBeNull()
})

const rect = ({ top = 0, right = 0, width = 0, height = 0 }) => ({
  top,
  right,
  bottom: top + height,
  left: right - width,
  width,
  height,
  x: right - width,
  y: top,
  toJSON() {},
})

describe('側欄細項浮層位置與換欄', () => {
  const originalRect = HTMLElement.prototype.getBoundingClientRect
  let innerWidth
  let innerHeight

  beforeEach(() => {
    innerWidth = window.innerWidth
    innerHeight = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
      if (this.tagName === 'ASIDE') return rect({ right: 264, width: 264, height: 800 })
      if (this.dataset && this.dataset.anchor === 'true') return rect({ top: 360, right: 480, width: 468, height: 36 })
      return rect({})
    }
  })

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalRect
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidth })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight })
    cleanup()
  })

  const names = count => Array.from({ length: count }, (_, index) => `項目${index + 1}`)

  const renderFlyout = (count, { withAside = true } = {}) => {
    // 錨點要先掛上，浮層才讀得到（與選單先畫出、滑過才浮出相同）
    const Harness = () => {
      const ref = React.useRef(null)
      const [open, setOpen] = React.useState(false)
      React.useLayoutEffect(() => {
        setOpen(true)
      }, [])
      const body = (
        <div ref={ref} data-anchor="true">
          {open && (
            <SidebarFlyout anchorRef={ref} label="櫃檯作業的細項">
              <div>
                {names(count).map(name => (
                  <a key={name} href="/item">{name}</a>
                ))}
              </div>
            </SidebarFlyout>
          )}
        </div>
      )
      return withAside ? <aside>{body}</aside> : body
    }
    render(<Harness />)
    return screen.getByRole('region', { name: '櫃檯作業的細項' })
  }

  it('10 項維持一欄；11 項才換成 10＋1', () => {
    expect(sidebarFlyoutColumnCount(10)).toBe(1)
    expect(sidebarFlyoutColumnCount(11)).toBe(2)
    expect(sidebarFlyoutColumnCount(20)).toBe(2)
    expect(sidebarFlyoutColumnCount(21)).toBe(3)
    expect(splitSidebarFlyoutColumns(names(11)).map(column => column.length)).toEqual([10, 1])
    expect(sidebarFlyoutShellWidth(1, SIDEBAR_FLYOUT_GAP)).toBe('calc(15rem + 4px)')
    expect(sidebarFlyoutShellWidth(2, SIDEBAR_FLYOUT_GAP)).toBe('calc(2 * 15rem + 1rem + 4px)')
  })

  it('浮層左緣貼側欄右緣，不滿按鈕的 right；頂端固定、高度貼近視窗上下', () => {
    const placed = placeSidebarFlyout({ sidebarRight: 264, viewportWidth: 1280, viewportHeight: 800 })
    expect(placed).toEqual({
      top: SIDEBAR_FLYOUT_VIEWPORT_MARGIN,
      left: 264,
      height: 800 - SIDEBAR_FLYOUT_VIEWPORT_MARGIN * 2,
      maxWidth: 1280 - SIDEBAR_FLYOUT_VIEWPORT_MARGIN - 264,
      paddingLeft: SIDEBAR_FLYOUT_GAP,
    })
    // 按鈕在側欄裡面時，外殼接到按鈕，卡片仍只離側欄右緣 4px
    expect(placeSidebarFlyout({
      sidebarRight: 264,
      anchorRight: 252,
      viewportWidth: 1280,
      viewportHeight: 800,
    })).toEqual({
      top: 8,
      left: 252,
      height: 784,
      maxWidth: 1020,
      paddingLeft: 16,
    })
    // 按鈕比側欄更右時不跟著往右推
    expect(placeSidebarFlyout({
      sidebarRight: 264,
      anchorRight: 480,
      viewportWidth: 1280,
      viewportHeight: 800,
    })).toMatchObject({ left: 264, paddingLeft: 4 })
    // 右側空間不夠時整塊往左收，仍留在視窗內
    expect(placeSidebarFlyout({ sidebarRight: 1200, viewportWidth: 1280, viewportHeight: 800 })).toMatchObject({
      top: 8,
      left: 1112,
      height: 784,
      maxWidth: 160,
    })

    const flyout = renderFlyout(11)
    expect(flyout.style.left).toBe('264px')
    expect(flyout.style.top).toBe('8px')
    expect(flyout.style.height).toBe('784px')
    expect(flyout.style.paddingLeft).toBe('4px')
    expect(flyout.style.maxWidth).toBe('1008px')
    expect(flyout.style.width).toBe('calc(2 * 15rem + 1rem + 4px)')
    expect(flyout.className).not.toContain('pl-2')
    expect(flyout.style.top).not.toBe('360px')
    expect(flyout.style.left).not.toBe('480px')
    const columns = flyout.querySelectorAll('[data-flyout-column]')
    expect(columns).toHaveLength(2)
    expect(Array.from(columns[0].querySelectorAll('a')).map(node => node.textContent)).toEqual(names(10))
    expect(columns[1].textContent).toBe('項目11')
    expect(flyout.querySelector('.rounded-2xl')).not.toBeNull()
    expect(flyout.querySelector('.overflow-auto')).not.toBeNull()
  })

  it('沒有側欄外框時退回錨點右緣；10 項不拆欄', () => {
    const flyout = renderFlyout(10, { withAside: false })
    expect(flyout.style.left).toBe('480px')
    expect(flyout.style.top).toBe('8px')
    expect(flyout.style.height).toBe('784px')
    expect(flyout.style.width).toBe('calc(15rem + 4px)')
    expect(flyout.querySelector('[data-flyout-column]')).toBeNull()
    expect(flyout.querySelectorAll('a')).toHaveLength(10)
  })
})
