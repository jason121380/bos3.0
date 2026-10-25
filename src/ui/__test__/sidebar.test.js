// 側欄抽屜：iPhone PWA 狀態列（頂部安全區）白條只在抽屜打開時出現，且不攔點擊（fix/pwa-statusbar-white）
// 主側欄細項浮層：靠近視窗底部時整塊上移，比視窗高才限制高度。
import React from 'react'
import { render, screen } from '@testing-library/react'
import { placeSidebarFlyout, Sidebar, SidebarFlyout, sidebarFlyoutColumnCount } from '../sidebar'

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

describe('placeSidebarFlyout', () => {
  it('上方放得下時貼齊項目上緣，高度至少容納全部內容', () => {
    const box = placeSidebarFlyout({ anchorTop: 40, anchorRight: 264, viewportHeight: 800, contentHeight: 200 })
    expect(box).toEqual({ top: 40, left: 264, maxHeight: 200 })
    expect(box.top + box.maxHeight).toBeLessThanOrEqual(800 - 8)
  })

  it('靠近底部時整塊上移，全部內容留在視窗內', () => {
    const box = placeSidebarFlyout({ anchorTop: 640, anchorRight: 80, viewportHeight: 800, contentHeight: 360 })
    expect(box.top).toBe(800 - 8 - 360)
    expect(box.left).toBe(80)
    expect(box.maxHeight).toBeGreaterThanOrEqual(360)
    expect(box.top).toBeGreaterThanOrEqual(8)
    expect(box.top + 360).toBeLessThanOrEqual(800 - 8)
  })

  it('比視窗高時從上緣內距開始，高度不超出視窗', () => {
    const box = placeSidebarFlyout({ anchorTop: 700, anchorRight: 80, viewportHeight: 800, contentHeight: 1200 })
    expect(box.top).toBe(8)
    expect(box.maxHeight).toBe(800 - 16)
    expect(box.top + box.maxHeight).toBeLessThanOrEqual(800 - 8)
  })

  it('項目超出上緣時改從上緣內距開始', () => {
    const box = placeSidebarFlyout({ anchorTop: -40, anchorRight: 80, viewportHeight: 800, contentHeight: 100 })
    expect(box.top).toBe(8)
    expect(box.maxHeight).toBe(100)
  })

  it('往右的寬度停在視窗內', () => {
    const box = placeSidebarFlyout({
      anchorTop: 40,
      anchorRight: 264,
      viewportHeight: 800,
      viewportWidth: 1000,
      contentHeight: 200,
    })
    expect(box.maxWidth).toBe(1000 - 264 - 8)
    expect(box.left + box.maxWidth).toBeLessThanOrEqual(1000 - 8)
  })
})

test('超過 8 項改往右多欄，8 項以內維持單欄', () => {
  expect(sidebarFlyoutColumnCount(8)).toBe(1)
  expect(sidebarFlyoutColumnCount(9)).toBe(2)
  expect(sidebarFlyoutColumnCount(11)).toBe(2)
  expect(sidebarFlyoutColumnCount(16)).toBe(2)
  expect(sidebarFlyoutColumnCount(17)).toBe(3)

  const anchor = document.createElement('button')
  document.body.appendChild(anchor)
  anchor.getBoundingClientRect = () => ({ top: 40, right: 80, bottom: 76, left: 0, width: 80, height: 36, x: 0, y: 40, toJSON() {} })
  const anchorRef = { current: anchor }
  const items = count => Array.from({ length: count }, (_, index) => <a key={index} href={`/report/${index}`}>報表{index}</a>)
  const { rerender } = render(
    <SidebarFlyout anchorRef={anchorRef} label="報表及分析的細項">
      <div className="flex flex-col">{items(11)}</div>
    </SidebarFlyout>
  )
  const multi = screen.getByRole('region', { name: '報表及分析的細項' }).firstElementChild
  expect(multi.className).toContain('grid-flow-col')
  expect(multi.className).toContain('w-max')
  expect(multi.className).not.toContain('w-60')
  expect(multi.style.gridTemplateRows).toBe('repeat(8, auto)')
  expect(multi.querySelectorAll('a')).toHaveLength(11)
  expect(multi.style.maxWidth).not.toBe('')

  rerender(
    <SidebarFlyout anchorRef={anchorRef} label="資料設定的細項">
      <div>{items(8)}</div>
    </SidebarFlyout>
  )
  const single = screen.getByRole('region', { name: '資料設定的細項' }).firstElementChild
  expect(single.className).toContain('w-60')
  expect(single.className).not.toContain('grid-flow-col')
  expect(single.querySelectorAll('a')).toHaveLength(8)
  anchor.remove()
})

test('浮層依內容高度上移，底部不超出視窗；內層可捲', () => {
  const anchor = document.createElement('button')
  document.body.appendChild(anchor)
  anchor.getBoundingClientRect = () => ({ top: 640, right: 264, bottom: 676, left: 188, width: 76, height: 36, x: 188, y: 640, toJSON() {} })
  const anchorRef = { current: anchor }
  const originalHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
  Object.defineProperty(Element.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      return String(this.className).includes('rounded-2xl') ? 360 : 0
    },
  })
  const originalInnerHeight = window.innerHeight
  window.innerHeight = 800
  try {
    render(
      <SidebarFlyout anchorRef={anchorRef} label="資料設定的細項">
        <a href="/parameter">系統參數設定</a>
      </SidebarFlyout>
    )
    const flyout = screen.getByRole('region', { name: '資料設定的細項' })
    expect(flyout.style.top).toBe('432px')
    expect(flyout.style.left).toBe('264px')
    expect(flyout.style.maxHeight).toBe('360px')
    expect(parseFloat(flyout.style.top) + 360).toBeLessThanOrEqual(800 - 8)
    const panel = flyout.firstElementChild
    expect(panel.className).toContain('overflow-auto')
    expect(panel.style.maxHeight).toBe('360px')
  } finally {
    window.innerHeight = originalInnerHeight
    if (originalHeight) Object.defineProperty(Element.prototype, 'scrollHeight', originalHeight)
    else delete Element.prototype.scrollHeight
    anchor.remove()
  }
})
