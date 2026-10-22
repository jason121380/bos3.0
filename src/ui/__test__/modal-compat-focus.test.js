import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Backdrop, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal } from '../modal-compat'

// 保護什麼：舊頁面彈窗（ui/modal-compat）的焦點鎖、捲動鎖、背景點擊與各種 MUI 選項。
// CLAUDE.md 踩雷：Dialog 內有 Autocomplete／Select／日期選擇器時要用這個相容 Dialog（Radix Dialog 會與焦點鎖互搶）。
// 這裡鎖住：Tab 在彈窗內循環（前後哨兵）、焦點從「彈窗之前」的頁面被拉回、之後才開的圖層放行；
// disableXxx 選項真的停用對應行為；backdrop／container 的點擊判斷；Dialog 的 MUI class 與 aria。

// 卸載包在 act 裡：React 17 的 effect 清除（解除捲動鎖、還焦點）是非同步的，不包 act 會拖到下一個測試才執行，
// 捲動鎖的計數會跨測試累積（只影響測試環境，瀏覽器裡清除一定會執行）
afterEach(() => {
  act(() => {
    cleanup()
  })
})

// jsdom 不做版面計算，offsetParent 永遠是 null（會把所有元素當成隱藏、不可 Tab）；這裡讓「有父節點」就視為可見
const realOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
const useVisibleLayout = () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get() {
        return this.parentNode
      },
    })
  })
  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', realOffsetParent)
  })
}

describe('焦點哨兵：Tab 在彈窗內循環', () => {
  useVisibleLayout()

  it('Tab 到結尾哨兵時回到第一個可聚焦元素；Shift+Tab 到開頭哨兵時跳到最後一個', () => {
    render(
      <Dialog open>
        <DialogTitle>編輯</DialogTitle>
        <DialogContent>
          <input aria-label="第一" />
          <button type="button" disabled>
            停用
          </button>
          <button type="button">最後</button>
        </DialogContent>
      </Dialog>
    )
    act(() => screen.getByTestId('sentinelEnd').focus())
    expect(document.activeElement).toBe(screen.getByLabelText('第一'))
    act(() => screen.getByTestId('sentinelStart').focus())
    expect(document.activeElement).toBe(screen.getByText('最後'))
  })

  it('彈窗內沒有可聚焦元素時，哨兵把焦點交回內容容器', () => {
    render(
      <Modal open>
        <div data-testid="content">純文字</div>
      </Modal>
    )
    act(() => screen.getByTestId('sentinelEnd').focus())
    expect(document.activeElement).toBe(screen.getByTestId('content'))
  })
})

describe('焦點鎖：只拉回「彈窗之前」的焦點', () => {
  it('焦點跑到彈窗前的頁面元素時拉回彈窗；跑到之後才開的圖層時放行', () => {
    const before = document.createElement('button')
    document.body.prepend(before)
    render(
      <Modal open>
        <div data-testid="content">
          <input aria-label="欄位" />
        </div>
      </Modal>
    )
    const after = document.createElement('button')
    document.body.append(after)
    act(() => before.focus())
    expect(document.activeElement).toBe(screen.getByTestId('content'))
    act(() => after.focus())
    expect(document.activeElement).toBe(after)
    // 彈窗內部的焦點移動不受影響
    act(() => screen.getByLabelText('欄位').focus())
    expect(document.activeElement).toBe(screen.getByLabelText('欄位'))
    before.remove()
    after.remove()
  })

  it('disableEnforceFocus 時不拉回焦點；disableAutoFocus 時開啟不搶焦點；disableRestoreFocus 時關閉不還焦點', () => {
    const before = document.createElement('button')
    document.body.prepend(before)
    act(() => before.focus())
    const { rerender } = render(
      <Modal open disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <div data-testid="content">內容</div>
      </Modal>
    )
    expect(document.activeElement).toBe(before)
    act(() => screen.getByTestId('content').focus())
    act(() => before.focus())
    expect(document.activeElement).toBe(before)
    act(() => screen.getByTestId('content').focus())
    rerender(
      <Modal open={false} disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <div data-testid="content">內容</div>
      </Modal>
    )
    expect(document.activeElement).not.toBe(before)
    before.remove()
  })

  it('內容裡已有 autoFocus 的元素時不把焦點搶回容器', () => {
    render(
      <Modal open>
        <div>
          <input aria-label="自動聚焦" autoFocus />
        </div>
      </Modal>
    )
    expect(document.activeElement).toBe(screen.getByLabelText('自動聚焦'))
  })

  it('子元素是不接 ref 的函式元件時（拿不到內容節點）開啟與哨兵都不拋錯', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const Plain = () => <p>無 ref</p>
    render(
      <Modal open>
        <Plain />
      </Modal>
    )
    expect(() => act(() => screen.getByTestId('sentinelStart').focus())).not.toThrow()
    expect(screen.getByText('無 ref')).toBeInTheDocument()
    spy.mockRestore()
  })
})

describe('捲動鎖與背後內容', () => {
  it('沒有捲軸時不補 padding-right；disableScrollLock 時不鎖捲動', () => {
    // jsdom 的 clientWidth 永遠是 0（等於有捲軸）；讓它等於視窗寬度模擬「沒有捲軸」
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: window.innerWidth })
    // 以開啟前的 padding 為基準（jsdom 的 cssstyle 設 paddingRight='' 不會清掉，前面測試留下的值會殘留；瀏覽器不會）
    const before = document.body.style.paddingRight
    const { unmount } = render(
      <Modal open>
        <div>內容</div>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe(before)
    unmount()
    delete document.documentElement.clientWidth
    render(
      <Modal open disableScrollLock>
        <div>內容</div>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('掛在指定容器（函式）時不隱藏 body 的其他節點；disablePortal 時畫在原地', () => {
    const mount = document.createElement('div')
    document.body.append(mount)
    const sibling = document.createElement('main')
    document.body.append(sibling)
    const { unmount } = render(
      <Modal open container={() => mount}>
        <div>放在容器</div>
      </Modal>
    )
    expect(mount.querySelector('.MuiModal-root')).not.toBeNull()
    expect(sibling).not.toHaveAttribute('aria-hidden')
    unmount()
    const { container } = render(
      <Modal open disablePortal>
        <div>原地</div>
      </Modal>
    )
    expect(container.querySelector('.MuiModal-root')).not.toBeNull()
    expect(sibling).not.toHaveAttribute('aria-hidden')
    mount.remove()
    sibling.remove()
  })
})

describe('鍵盤與背景點擊', () => {
  it('rootProps.onKeyDown 先收到；沒有 onClose 時 Esc 不拋錯；disableEscapeKeyDown 時不關閉', () => {
    const onKeyDown = jest.fn()
    const onClose = jest.fn()
    const { rerender } = render(
      <Modal open onKeyDown={onKeyDown}>
        <div data-testid="c">內容</div>
      </Modal>
    )
    fireEvent.keyDown(screen.getByTestId('c'), { key: 'Escape' })
    expect(onKeyDown).toHaveBeenCalled()
    rerender(
      <Modal open onClose={onClose} disableEscapeKeyDown>
        <div data-testid="c">內容</div>
      </Modal>
    )
    fireEvent.keyDown(screen.getByTestId('c'), { key: 'Escape' })
    fireEvent.keyDown(screen.getByTestId('c'), { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('BackdropProps.onClick／className 照傳；點在背景的子節點不算點背景；onBackdropClick 在 onClose 之前', () => {
    const calls = []
    render(
      <Modal
        open
        onClose={(e, reason) => calls.push(reason)}
        onBackdropClick={() => calls.push('onBackdropClick')}
        BackdropProps={{ className: 'bd', onClick: () => calls.push('BackdropProps.onClick'), children: <span data-testid="bdchild" /> }}
      >
        <div>內容</div>
      </Modal>
    )
    const backdrop = document.querySelector('.MuiBackdrop-root')
    expect(backdrop).toHaveClass('bd')
    fireEvent.click(screen.getByTestId('bdchild'))
    expect(calls).toEqual(['BackdropProps.onClick'])
    fireEvent.click(backdrop)
    expect(calls).toEqual(['BackdropProps.onClick', 'BackdropProps.onClick', 'onBackdropClick', 'backdropClick'])
  })

  it('沒有 onClose 時點背景不拋錯；Dialog 點背景也先呼叫 onBackdropClick', () => {
    const onBackdropClick = jest.fn()
    const { rerender } = render(
      <Modal open>
        <div>內容</div>
      </Modal>
    )
    expect(() => fireEvent.click(document.querySelector('.MuiBackdrop-root'))).not.toThrow()
    rerender(
      <Dialog open onBackdropClick={onBackdropClick}>
        <DialogContent>內容</DialogContent>
      </Dialog>
    )
    const container = document.querySelector('.MuiDialog-container')
    fireEvent.mouseDown(container)
    fireEvent.click(container)
    expect(onBackdropClick).toHaveBeenCalledTimes(1)
  })
})

describe('keepMounted、ref 與子元素 tabIndex', () => {
  it('keepMounted 關閉時保留 DOM、標 MuiModal-hidden、哨兵不可 Tab；ref 可為物件或函式', () => {
    const objRef = React.createRef()
    const { rerender } = render(
      <Modal open={false} keepMounted ref={objRef}>
        <div tabIndex={0}>保留</div>
      </Modal>
    )
    expect(objRef.current).toHaveClass('MuiModal-root', 'MuiModal-hidden')
    expect(screen.getByTestId('sentinelStart')).toHaveAttribute('tabindex', '-1')
    expect(screen.getByTestId('sentinelEnd')).toHaveAttribute('tabindex', '-1')
    // 子元素自己給的 tabIndex 不被覆蓋
    expect(screen.getByText('保留')).toHaveAttribute('tabindex', '0')
    const fnRef = jest.fn()
    rerender(
      <Modal open keepMounted ref={fnRef}>
        <div>保留</div>
      </Modal>
    )
    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLElement))
    expect(screen.getByText('保留')).toHaveAttribute('tabindex', '-1')
  })
})

describe('Dialog 與內容元件的 MUI class', () => {
  it('maxWidth=false、fullWidth、fullScreen、PaperProps.className；aria-labelledby 可自訂', () => {
    const { rerender } = render(
      <Dialog open maxWidth={false} fullWidth fullScreen PaperProps={{ className: 'pp' }} aria-labelledby="custom-title">
        <DialogTitle id="custom-title">標題</DialogTitle>
        <DialogContent dividers>內容</DialogContent>
        <DialogContentText>說明</DialogContentText>
        <DialogActions disableSpacing>動作</DialogActions>
      </Dialog>
    )
    const paper = screen.getByRole('dialog')
    expect(paper).toHaveClass('MuiDialog-paperWidthFalse', 'MuiDialog-paperFullWidth', 'MuiDialog-paperFullScreen', 'pp')
    expect(paper).toHaveAttribute('aria-labelledby', 'custom-title')
    expect(screen.getByText('標題')).toHaveAttribute('id', 'custom-title')
    expect(screen.getByText('內容')).toHaveClass('MuiDialogContent-dividers')
    expect(screen.getByText('說明').tagName).toBe('P')
    expect(screen.getByText('說明')).toHaveClass('MuiDialogContentText-root')
    expect(screen.getByText('動作')).not.toHaveClass('MuiDialogActions-spacing')
    // 重新渲染不換標題 id（報讀器關聯不中斷）
    rerender(
      <Dialog open>
        <DialogTitle>標題</DialogTitle>
      </Dialog>
    )
    const id = screen.getByText('標題').id
    rerender(
      <Dialog open>
        <DialogTitle>標題 2</DialogTitle>
      </Dialog>
    )
    expect(screen.getByText('標題 2').id).toBe(id)
  })

  it('Backdrop 開啟時可見；invisible 輸出 MuiBackdrop-invisible', () => {
    render(<Backdrop open invisible data-testid="bd" />)
    const bd = screen.getByTestId('bd')
    expect(bd.style.opacity).toBe('1')
    expect(bd.style.visibility).toBe('')
    expect(bd).toHaveClass('MuiBackdrop-invisible')
  })
})
