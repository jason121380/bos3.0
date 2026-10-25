import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import { Add, Delete } from '../icons'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroupButton, SidebarHeader, SidebarLabel, SidebarLink } from '../sidebar'

// 保護什麼：圖示轉接層的名稱、尺寸與樣式，以及 Sidebar 的導覽、群組與手機抽屜。

afterEach(cleanup)

describe('icons：MUI 圖示轉接', () => {
  it('預設 medium、對報讀器隱藏；titleAccess 時改以 aria-label 朗讀', () => {
    const { container, rerender } = render(<Add />)
    let svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg.getAttribute('class')).toContain('MuiSvgIcon-fontSizeMedium')
    expect(svg.getAttribute('class')).toContain('ui-icon-fs-medium')
    rerender(<Add titleAccess="新增" />)
    svg = container.querySelector('svg')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(svg).toHaveAttribute('aria-label', '新增')
  })

  it('預設色以 class 套用；htmlColor 優先改走 inline color', () => {
    const { container, rerender } = render(<Delete color="error" />)
    expect(container.querySelector('svg').getAttribute('class')).toContain('ui-icon-c-error')
    rerender(<Delete color="error" htmlColor="#123456" />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('class')).not.toContain('ui-icon-c-error')
    expect(svg.style.color).toBe('rgb(18, 52, 86)')
  })

  it('非預設 fontSize 改走 inline style；sx 可為陣列（略過 falsy）', () => {
    const { container } = render(<Add fontSize="20px" sx={[{ marginLeft: 4 }, false, { opacity: 0.5 }]} />)
    const svg = container.querySelector('svg')
    expect(svg.style.fontSize).toBe('20px')
    expect(svg.style.marginLeft).toBe('4px')
    expect(svg.style.opacity).toBe('0.5')
    expect(svg.getAttribute('class')).not.toContain('ui-icon-fs-')
  })
})

describe('Sidebar', () => {
  it('桌機收合時留在畫面上並改為圖示欄寬度；手機抽屜關閉時不畫遮罩', () => {
    const { container } = render(<Sidebar desktopOpen={false}>內容</Sidebar>)
    const aside = container.querySelector('aside')
    const classes = aside.className.split(/\s+/)
    expect(classes).toContain('lg:w-[80px]')
    expect(classes).toContain('lg:translate-x-0')
    expect(classes).not.toContain('lg:-translate-x-full')
    expect(classes).toContain('max-lg:-translate-x-full')
    expect(aside).toHaveAttribute('data-rail', 'true')
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0)
  })

  it('SidebarLabel 帶 className；hideChevron 的群組列不宣告 aria-expanded', () => {
    render(
      <>
        <SidebarLabel className="lbl">報表</SidebarLabel>
        <SidebarGroupButton hideChevron open>
          首頁
        </SidebarGroupButton>
      </>
    )
    expect(screen.getByText('報表').className).toContain('lbl')
    expect(screen.getByRole('button', { name: '首頁' })).not.toHaveAttribute('aria-expanded')
  })

  it('SidebarLink 有圖示時畫出圖示；active 標 aria-current=page', () => {
    const Icon = props => <svg data-testid="icon" {...props} />
    render(
      <MemoryRouter>
        <SidebarLink to="/a" icon={Icon} active>
          帳單
        </SidebarLink>
      </MemoryRouter>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '帳單' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('icons：sx 物件', () => {
  it('sx 為單一物件時合併到 inline style', () => {
    const { container } = render(<Add sx={{ marginTop: 2 }} />)
    expect(container.querySelector('svg').style.marginTop).toBe('2px')
  })
})

describe('Sidebar 結構與群組列', () => {
  it('Header／Content（nav）／Footer 帶 className；群組列依 open 宣告 aria-expanded 並旋轉箭頭', () => {
    const Icon = props => <svg data-testid="gicon" {...props} />
    const { container, rerender } = render(
      <Sidebar mobileOpen>
        <SidebarHeader className="hd">頂</SidebarHeader>
        <SidebarContent className="ct">
          <SidebarGroupButton icon={Icon} open={false}>
            櫃檯作業
          </SidebarGroupButton>
        </SidebarContent>
        <SidebarFooter className="ft">底</SidebarFooter>
      </Sidebar>
    )
    expect(screen.getByText('頂').className).toContain('hd')
    expect(container.querySelector('nav').className).toContain('ct')
    expect(screen.getByText('底').className).toContain('ft')
    const btn = screen.getByRole('button', { name: '櫃檯作業' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('gicon')).toBeInTheDocument()
    expect(btn.querySelectorAll('svg')[1].getAttribute('class')).toContain('-rotate-90')
    // 手機抽屜開啟：畫遮罩與狀態列白條
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2)
    rerender(
      <Sidebar>
        <SidebarGroupButton open>櫃檯作業</SidebarGroupButton>
      </Sidebar>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button').querySelector('svg').getAttribute('class')).not.toContain('-rotate-90')
  })

  it('SidebarLink 非選取時不標 aria-current；indent 時縮排', () => {
    render(
      <MemoryRouter>
        <SidebarLink to="/b" indent>
          帳單列表
        </SidebarLink>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: '帳單列表' })
    expect(link).not.toHaveAttribute('aria-current')
    expect(link.className).toContain('pl-8')
  })
})
