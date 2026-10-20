// 側欄抽屜：iPhone PWA 狀態列（頂部安全區）白條只在抽屜打開時出現，且不攔點擊（fix/pwa-statusbar-white）
import React from 'react'
import { render } from '@testing-library/react'
import { Sidebar } from '../sidebar'

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
