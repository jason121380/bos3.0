import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Drawer, Fade, Popper } from '../overlay-compat'
import { Alert, Snackbar, SnackbarContent } from '../feedback-compat'
import Grid from '../grid-compat'
import { Breadcrumb, PageHeader } from '../page-header'

// 保護什麼：
// - overlay-compat（Popper／Fade／Drawer）：浮層的掛載位置（body、指定容器或原地）、keepMounted 隱藏、Fade 進退場時序，
//   以及 ref 交給呼叫端（定位與點擊外部判斷都靠它）。
// - feedback-compat（Snackbar／Alert）：MUI 同名 class、關閉鈕、滑鼠移入暫停／移出以 resumeHideDuration 重新計時。
// - grid-compat：MUI 沒有對應 class 的 justify／align／gap 值改用 inline style，版面才不會走樣。
// - page-header：頁首的說明、返回鈕、動作區與麵包屑（一般點擊交給頁面 onClick，Ctrl／⌘ 點擊保留瀏覽器開新分頁）。

afterEach(cleanup)

describe('Popper', () => {
  it('anchorEl 可為函式；container 可為函式；ref 交給呼叫端', () => {
    const anchor = document.createElement('button')
    const mount = document.createElement('div')
    document.body.append(anchor, mount)
    const ref = jest.fn()
    render(
      <Popper open anchorEl={() => anchor} container={() => mount} ref={ref}>
        <span>面板</span>
      </Popper>
    )
    const panel = screen.getByRole('tooltip')
    expect(panel.parentElement).toBe(mount)
    expect(ref).toHaveBeenCalledWith(panel)
    anchor.remove()
    mount.remove()
  })

  it('disablePortal 時畫在原地；keepMounted 關閉時保留節點但 display:none', () => {
    const ref = React.createRef()
    const { container, rerender } = render(
      <Popper open disablePortal ref={ref}>
        <span>面板</span>
      </Popper>
    )
    expect(container.querySelector('[role="tooltip"]')).toBe(ref.current)
    rerender(
      <Popper open={false} keepMounted disablePortal>
        <span>面板</span>
      </Popper>
    )
    expect(container.querySelector('[role="tooltip"]').style.display).toBe('none')
  })
})

describe('Fade', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('進場先 opacity 0、下一個 frame 變 1，並呼叫 onEnter；離場以 exit 時間後呼叫 onExited 並隱藏', () => {
    const onEnter = jest.fn()
    const onExited = jest.fn()
    const childRef = React.createRef()
    const fadeRef = jest.fn()
    const ui = inProp => (
      <Fade in={inProp} timeout={{ enter: 300, exit: 100 }} onEnter={onEnter} onExited={onExited} ref={fadeRef}>
        <div ref={childRef} style={{ color: 'red' }}>
          內容
        </div>
      </Fade>
    )
    const { rerender } = render(ui(true))
    const el = screen.getByText('內容')
    expect(childRef.current).toBe(el)
    expect(fadeRef).toHaveBeenCalledWith(el)
    expect(onEnter).toHaveBeenCalledTimes(1)
    expect(el.style.opacity).toBe('0')
    act(() => jest.advanceTimersByTime(20))
    expect(el.style.opacity).toBe('1')
    expect(el.style.transition).toContain('300ms')
    expect(el.style.color).toBe('red')
    rerender(ui(false))
    expect(el.style.transition).toContain('100ms')
    act(() => jest.advanceTimersByTime(100))
    expect(onExited).toHaveBeenCalledTimes(1)
    expect(el.style.visibility).toBe('hidden')
  })

  it('沒給 in 時預設隱藏；timeout 物件缺值時退回 MUI 預設 225／195ms', () => {
    const { unmount } = render(
      <Fade timeout={{}}>
        <div>內容</div>
      </Fade>
    )
    expect(screen.getByText('內容').style.visibility).toBe('hidden')
    expect(screen.getByText('內容').style.transition).toContain('195ms')
    unmount()
    // appear=false：一開始就顯示（不做進場動畫）
    render(
      <Fade in appear={false}>
        <div>內容</div>
      </Fade>
    )
    expect(screen.getByText('內容').style.opacity).toBe('1')
    expect(screen.getByText('內容').style.transition).toContain('225ms')
  })
})

describe('Drawer', () => {
  it('預設 anchor=left、temporary 且關閉；permanent 不做滑動', () => {
    const { rerender } = render(<Drawer>選單</Drawer>)
    expect(screen.queryByText('選單')).toBeNull()
    rerender(<Drawer variant="permanent">選單</Drawer>)
    const paper = screen.getByText('選單')
    expect(paper).toHaveClass('MuiDrawer-paperAnchorLeft', 'MuiDrawer-paperAnchorDockedLeft', 'MuiPaper-elevation0')
    expect(paper.style.transform).toBe('')
  })
})

describe('Snackbar／SnackbarContent／Alert', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('SnackbarContent 有 action 時畫動作區', () => {
    const { container } = render(<SnackbarContent message="已複製" action={<button type="button">復原</button>} />)
    expect(container.querySelector('.MuiSnackbarContent-action')).toHaveTextContent('復原')
  })

  it('滑鼠移出後以 resumeHideDuration 重新計時；onMouseEnter／onMouseLeave 照常回呼；ref 可為物件或函式', () => {
    const onClose = jest.fn()
    const onMouseEnter = jest.fn()
    const onMouseLeave = jest.fn()
    const objRef = React.createRef()
    const { rerender } = render(
      <Snackbar open autoHideDuration={1000} resumeHideDuration={300} onClose={onClose} message="m" ref={objRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    )
    const root = objRef.current
    expect(root).toHaveClass('MuiSnackbar-root')
    fireEvent.mouseEnter(root)
    expect(onMouseEnter).toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(2000))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseLeave(root)
    expect(onMouseLeave).toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(299))
    expect(onClose).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1))
    expect(onClose).toHaveBeenCalledWith(null, 'timeout')

    const fnRef = jest.fn()
    rerender(<Snackbar open message="m" ref={fnRef} />)
    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLElement))
    // 沒有 autoHideDuration 時移出不重新計時
    fireEvent.mouseLeave(fnRef.mock.calls[fnRef.mock.calls.length - 1][0])
  })

  it('Alert 預設 success；iconMapping 優先；未知 severity 用成功圖示；icon=false 不畫圖示', () => {
    const { container, rerender } = render(<Alert>完成</Alert>)
    expect(container.firstChild).toHaveClass('MuiAlert-standardSuccess')
    rerender(
      <Alert severity="warning" iconMapping={{ warning: <i data-testid="w" /> }}>
        注意
      </Alert>
    )
    expect(screen.getByTestId('w')).toBeInTheDocument()
    rerender(<Alert severity="custom">自訂</Alert>)
    expect(container.querySelector('.MuiAlert-icon svg')).not.toBeNull()
    rerender(<Alert icon={false}>無圖示</Alert>)
    expect(container.querySelector('.MuiAlert-icon')).toBeNull()
  })

  it('Alert 有 action 時不畫關閉鈕；只有 onClose 時畫關閉鈕並回呼', () => {
    const onClose = jest.fn()
    const { container, rerender } = render(
      <Alert action={<button type="button">重試</button>} onClose={onClose}>
        失敗
      </Alert>
    )
    expect(screen.queryByLabelText('Close')).toBeNull()
    expect(container.querySelector('.MuiAlert-action')).toHaveTextContent('重試')
    rerender(
      <Alert onClose={onClose} closeText="關閉">
        失敗
      </Alert>
    )
    fireEvent.click(screen.getByLabelText('關閉'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('grid-compat：沒有對應 class 的值改走 inline style', () => {
  it('未知 justify／align 與非預設 gap（數字以 8px 為單位、字串原樣）', () => {
    const { rerender } = render(<Grid data-testid="g" container justifyContent="start" alignItems="end" gap={5} />)
    const g = screen.getByTestId('g')
    expect(g.style.justifyContent).toBe('start')
    expect(g.style.alignItems).toBe('end')
    expect(g.style.gap).toBe('40px')
    rerender(<Grid data-testid="g" container gap="1rem" justifyContent="center" alignItems="center" />)
    expect(g.style.gap).toBe('1rem')
    expect(g.style.justifyContent).toBe('')
    expect(g).toHaveClass('justify-center', 'items-center')
    rerender(<Grid data-testid="g" container gap={2} />)
    expect(g).toHaveClass('gap-4')
    expect(g.style.gap).toBe('')
  })

  it('zeroMinWidth、wrap 與 flexWrap 輸出對應 class', () => {
    const { rerender } = render(<Grid data-testid="g" container item zeroMinWidth wrap="nowrap" flexWrap="nowrap" />)
    const g = screen.getByTestId('g')
    expect(g).toHaveClass('MuiGrid-zeroMinWidth', 'MuiGrid-wrap-xs-nowrap', 'flex-nowrap')
    rerender(<Grid data-testid="g" flexWrap="wrap" />)
    expect(g).toHaveClass('flex-wrap')
    expect(g).not.toHaveClass('MuiGrid-wrap-xs-nowrap')
  })
})

describe('PageHeader／Breadcrumb', () => {
  it('有說明時靠上對齊並顯示說明；back 畫返回鈕；children 當動作區', () => {
    const onBack = jest.fn()
    const { container } = render(
      <PageHeader title="帳單詳細" description="檢視與修改帳單" back={{ label: '返回帳單列表', onClick: onBack }}>
        <button type="button">列印</button>
      </PageHeader>
    )
    expect(container.firstChild.className).toContain('items-start')
    expect(screen.getByText('檢視與修改帳單')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回帳單列表' }))
    expect(onBack).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '列印' })).toBeInTheDocument()
  })

  it('沒有說明與麵包屑時置中對齊、沒有動作區', () => {
    const { container } = render(<PageHeader title="帳單列表" />)
    expect(container.firstChild.className).toContain('items-center')
    expect(container.firstChild.children).toHaveLength(1)
  })

  it('麵包屑最後一項為目前頁；一般點擊交給 onClick，修飾鍵／中鍵點擊保留瀏覽器行為', () => {
    const onClick = jest.fn()
    render(
      <PageHeader
        title="帳單詳細"
        breadcrumb={
          <Breadcrumb
            className="bc"
            items={[
              { label: '帳單列表', href: '/management/orders', onClick },
              { label: '首頁', href: '/' },
              { label: '帳單詳細' },
            ]}
          />
        }
      />
    )
    expect(screen.getByRole('navigation', { name: '麵包屑' }).className).toContain('bc')
    expect(screen.getByText('帳單詳細', { selector: 'span' })).toHaveAttribute('aria-current', 'page')
    const link = screen.getByRole('link', { name: '帳單列表' })
    for (const mod of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { button: 1 }]) {
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true, ...mod })
      link.dispatchEvent(ev)
      expect(ev.defaultPrevented).toBe(false)
    }
    expect(onClick).not.toHaveBeenCalled()
    const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    link.dispatchEvent(plain)
    expect(plain.defaultPrevented).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
    // 沒有 onClick 的項目是一般連結
    expect(screen.getByRole('link', { name: '首頁' })).toHaveAttribute('href', '/')
    // 分隔箭頭只畫在非最後一項之後
    expect(document.querySelectorAll('nav li svg')).toHaveLength(2)
  })
})

describe('邊界：回呼在計時途中被拿掉', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('Snackbar 計時結束或點外部時若 onClose 已被拿掉，不拋錯', () => {
    const onClose = jest.fn()
    const { rerender } = render(<Snackbar open autoHideDuration={500} onClose={onClose} message="m" />)
    act(() => jest.advanceTimersByTime(1))
    rerender(<Snackbar open autoHideDuration={500} message="m" />)
    act(() => jest.advanceTimersByTime(1000))
    fireEvent.click(document.body)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Fade 離場沒有 onExited 時照樣隱藏', () => {
    const { rerender } = render(
      <Fade in>
        <div>內容</div>
      </Fade>
    )
    rerender(
      <Fade in={false}>
        <div>內容</div>
      </Fade>
    )
    act(() => jest.advanceTimersByTime(195))
    expect(screen.getByText('內容').style.visibility).toBe('hidden')
  })

  it('grid-compat：非 xs 斷點的非整數欄寬不輸出 class 也不加 inline 寬度', () => {
    render(<Grid data-testid="g" item sm={2.5} />)
    const g = screen.getByTestId('g')
    expect(g.className).not.toContain('MuiGrid-grid-sm')
    expect(g.style.flexBasis).toBe('')
  })
})
