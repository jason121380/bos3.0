import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import { Container, Paper, Typography } from '../display-compat'
import { CardHeader } from '../card-compat'
import Link from '../link-compat'
import { Add, Delete } from '../icons'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroupButton, SidebarHeader, SidebarLabel, SidebarLink } from '../sidebar'

// 保護什麼：舊頁面沿用的 MUI 相容輸出（Paper／Typography／Container／CardHeader／Link／圖示）與側欄。
// initialize.scss 的列印、深色模式與各頁的 '.MuiXxx-root' 選擇器都靠這些 MUI 同名 class；
// 預設值（Typography body1→p、Container lg、Link primary＋always 底線、圖示 medium）必須與 MUI 相同，舊頁面才不會跑版。

afterEach(cleanup)

describe('display-compat', () => {
  it('Paper variant=outlined 輸出 MuiPaper-outlined（不帶 elevation class）', () => {
    render(<Paper data-testid="p" variant="outlined" square />)
    const p = screen.getByTestId('p')
    expect(p.className).toContain('MuiPaper-outlined')
    expect(p.className).not.toContain('MuiPaper-elevation')
    expect(p.className).not.toContain('MuiPaper-rounded')
  })

  it('Typography 預設 body1＝<p>；paragraph 一律 <p>；未知 variant 退回 span', () => {
    const { rerender } = render(<Typography>內文</Typography>)
    expect(screen.getByText('內文').tagName).toBe('P')
    expect(screen.getByText('內文').className).toContain('MuiTypography-body1')
    rerender(
      <Typography variant="caption" paragraph noWrap>
        內文
      </Typography>
    )
    const el = screen.getByText('內文')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('MuiTypography-paragraph')
    expect(el.className).toContain('MuiTypography-noWrap')
    rerender(<Typography variant="caption">內文</Typography>)
    expect(screen.getByText('內文').tagName).toBe('SPAN')
  })

  it('Container 預設 maxWidth=lg；maxWidth=false 不輸出寬度 class', () => {
    const { rerender } = render(<Container data-testid="c" />)
    expect(screen.getByTestId('c').className).toContain('MuiContainer-maxWidthLg')
    rerender(<Container data-testid="c" maxWidth={false} />)
    expect(screen.getByTestId('c').className).not.toContain('MuiContainer-maxWidth')
  })
})

describe('card-compat CardHeader', () => {
  it('有 avatar 時畫 MuiCardHeader-avatar（排在標題左側）', () => {
    const { container } = render(<CardHeader avatar={<span>頭</span>} title="標題" />)
    const root = container.firstChild
    expect(root.firstChild.className).toContain('MuiCardHeader-avatar')
    expect(screen.getByText('頭')).toBeInTheDocument()
  })
})

describe('link-compat', () => {
  it('預設為 <a>、primary 色、底線 always，style 原樣傳入', () => {
    render(
      <Link href="/x" style={{ fontWeight: 600 }}>
        連結
      </Link>
    )
    const a = screen.getByText('連結')
    expect(a.tagName).toBe('A')
    expect(a.className).toContain('MuiLink-colorPrimary')
    expect(a.className).toContain('MuiLink-underlineAlways')
    expect(a.className).toContain('MuiTypography-inherit')
    expect(a.style.fontWeight).toBe('600')
  })

  it('自訂色值以 CSS 變數＋MuiLink-colorCustom 套用（深色模式規則才蓋得過）', () => {
    render(
      <Link href="/x" color="#ff0000" underline="none" style={{ fontWeight: 600 }}>
        連結
      </Link>
    )
    const a = screen.getByText('連結')
    expect(a.className).toContain('MuiLink-colorCustom')
    expect(a.className).toContain('MuiLink-underlineNone')
    expect(a.style.getPropertyValue('--mui-link-color')).toBe('#ff0000')
    expect(a.style.fontWeight).toBe('600')
  })
})

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
  it('桌機收合時移出畫面；手機抽屜關閉時不畫遮罩', () => {
    const { container } = render(<Sidebar desktopOpen={false}>內容</Sidebar>)
    const aside = container.querySelector('aside')
    expect(aside.className).toContain('lg:-translate-x-full')
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
