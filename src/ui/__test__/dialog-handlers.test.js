// DialogContent 交給 Radix 的事件處理（Esc、點外面、焦點移出、開關時的焦點）。
// jsdom 裡 Radix 的 Esc 由 layer-stack 先處理，外部指標事件也不完整，所以這裡攔下傳給 Radix Content 的 props 直接呼叫，
// 驗證每個分支的契約：
// - 較晚開啟的圖層（窗內的下拉、日期、密碼窗）上的點擊／焦點，不能被下層對話框當成「點外面」而關窗；
// - 上層還開著時，下層對話框不處理 Esc；呼叫端已 preventDefault 的 Esc 不再處理；
// - 關窗後焦點回到開窗前的元素（受控對話框沒有 Trigger 也一樣），呼叫端 preventDefault 時尊重呼叫端；
// - 面板內元素主動 blur 到 body 時焦點留在面板，避免焦點鎖把游標拉回原欄位。
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'

const mockContentProps = {}
jest.mock('@radix-ui/react-dialog', () => {
  const actual = jest.requireActual('@radix-ui/react-dialog')
  const mockReact = require('react')
  const Content = mockReact.forwardRef((props, ref) => {
    mockContentProps[props['data-testid']] = props
    return mockReact.createElement(actual.Content, { ...props, ref })
  })
  return { ...actual, Content }
})

afterEach(cleanup)

const fakeEvent = (overrides = {}) => {
  const event = {
    defaultPrevented: false,
    preventDefault: jest.fn(() => {
      event.defaultPrevented = true
    }),
    ...overrides,
  }
  return event
}

function TwoDialogs({ lowerProps = {}, upperOpen = true }) {
  return (
    <>
      <Dialog open>
        <DialogContent data-testid="lower" aria-describedby={undefined} {...lowerProps}>
          <DialogTitle>下層</DialogTitle>
          <button type="button">下層按鈕</button>
        </DialogContent>
      </Dialog>
      <Dialog open={upperOpen}>
        <DialogContent data-testid="upper" aria-describedby={undefined}>
          <DialogTitle>上層</DialogTitle>
          <button type="button">上層按鈕</button>
        </DialogContent>
      </Dialog>
    </>
  )
}

describe('Esc', () => {
  it('呼叫端已取消的 Esc 不再處理', () => {
    const onEscapeKeyDown = jest.fn()
    render(<TwoDialogs lowerProps={{ onEscapeKeyDown }} upperOpen={false} />)
    const event = fakeEvent({ defaultPrevented: true })
    mockContentProps.lower.onEscapeKeyDown(event)
    expect(onEscapeKeyDown).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('上層對話框還開著時，下層擋下 Esc 不關窗、也不通知呼叫端', () => {
    const onEscapeKeyDown = jest.fn()
    render(<TwoDialogs lowerProps={{ onEscapeKeyDown }} />)
    const event = fakeEvent()
    mockContentProps.lower.onEscapeKeyDown(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(onEscapeKeyDown).not.toHaveBeenCalled()
  })

  it('最上層時把 Esc 交給呼叫端；沒有呼叫端處理也不出錯', () => {
    const onEscapeKeyDown = jest.fn()
    render(<TwoDialogs lowerProps={{ onEscapeKeyDown }} upperOpen={false} />)
    const event = fakeEvent()
    mockContentProps.lower.onEscapeKeyDown(event)
    expect(onEscapeKeyDown).toHaveBeenCalledWith(event)
    cleanup()
    render(<TwoDialogs upperOpen={false} />)
    expect(() => mockContentProps.lower.onEscapeKeyDown(fakeEvent())).not.toThrow()
  })
})

describe('點外面與焦點移出', () => {
  it.each(['onPointerDownOutside', 'onFocusOutside', 'onInteractOutside'])(
    '%s：發生在較晚開啟的上層裡時擋下（下層不關），發生在其他地方時交給呼叫端',
    handler => {
      const callback = jest.fn()
      render(<TwoDialogs lowerProps={{ [handler]: callback }} />)
      const inUpper = fakeEvent({ target: screen.getByText('上層按鈕') })
      mockContentProps.lower[handler](inUpper)
      expect(inUpper.preventDefault).toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()

      const elsewhere = fakeEvent({ target: document.body })
      mockContentProps.lower[handler](elsewhere)
      expect(callback).toHaveBeenCalledWith(elsewhere)
      expect(elsewhere.preventDefault).not.toHaveBeenCalled()
    }
  )

  it.each(['onPointerDownOutside', 'onFocusOutside', 'onInteractOutside'])('%s：呼叫端沒給處理時不出錯', handler => {
    render(<TwoDialogs upperOpen={false} />)
    expect(() => mockContentProps.lower[handler](fakeEvent({ target: document.body }))).not.toThrow()
  })
})

describe('開關時的焦點', () => {
  it('開窗時通知呼叫端；關窗時焦點回到開窗前的元素', () => {
    const onOpenAutoFocus = jest.fn()
    const onCloseAutoFocus = jest.fn()
    render(<button type="button">開窗鈕</button>)
    const opener = screen.getByText('開窗鈕')
    opener.focus()
    render(
      <Dialog open>
        <DialogContent data-testid="d" aria-describedby={undefined} onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus}>
          <DialogTitle>窗</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const open = fakeEvent()
    mockContentProps.d.onOpenAutoFocus(open)
    expect(onOpenAutoFocus).toHaveBeenCalledWith(open)
    // 實際還原發生在 FocusScope 卸載時；這裡焦點鎖仍在，只驗證有把焦點交回開窗鈕
    const restore = jest.spyOn(opener, 'focus')
    const close = fakeEvent()
    mockContentProps.d.onCloseAutoFocus(close)
    expect(onCloseAutoFocus).toHaveBeenCalledWith(close)
    expect(close.preventDefault).toHaveBeenCalled()
    expect(restore).toHaveBeenCalledTimes(1)
  })

  it('呼叫端在關窗時 preventDefault：不還原焦點', () => {
    render(<button type="button">開窗鈕</button>)
    screen.getByText('開窗鈕').focus()
    render(
      <Dialog open>
        <DialogContent data-testid="d" aria-describedby={undefined} onCloseAutoFocus={event => event.preventDefault()}>
          <DialogTitle>窗</DialogTitle>
          <button type="button">窗內</button>
        </DialogContent>
      </Dialog>
    )
    mockContentProps.d.onOpenAutoFocus(fakeEvent())
    screen.getByText('窗內').focus()
    mockContentProps.d.onCloseAutoFocus(fakeEvent())
    expect(screen.getByText('窗內')).toHaveFocus()
  })

  it('開窗前的元素已被移除：不還原焦點；沒有記錄開窗前元素時以當下焦點為準', () => {
    const outer = document.createElement('button')
    document.body.appendChild(outer)
    outer.focus()
    render(
      <Dialog open>
        <DialogContent data-testid="d" aria-describedby={undefined}>
          <DialogTitle>窗</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    mockContentProps.d.onOpenAutoFocus(fakeEvent())
    outer.remove()
    const close = fakeEvent()
    mockContentProps.d.onCloseAutoFocus(close)
    expect(close.preventDefault).not.toHaveBeenCalled()
  })
})

describe('面板內 blur', () => {
  const renderPanel = onBlurCapture => {
    render(
      <Dialog open>
        <DialogContent data-testid="d" onBlurCapture={onBlurCapture}>
          <DialogTitle>窗</DialogTitle>
          <DialogDescription>輸入要調整的數量</DialogDescription>
          <input aria-label="數量" />
        </DialogContent>
      </Dialog>
    )
    return { panel: screen.getByRole('dialog', { hidden: true }), input: screen.getByLabelText('數量') }
  }

  it('說明文字以 DialogDescription 連到面板（螢幕報讀會念出）', () => {
    const { panel } = renderPanel()
    const describedBy = panel.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy)).toHaveTextContent('輸入要調整的數量')
  })

  it('欄位主動 blur 到 body／document 時焦點留在面板；呼叫端先收到事件', () => {
    const onBlurCapture = jest.fn()
    const { panel, input } = renderPanel(onBlurCapture)
    const focus = jest.spyOn(panel, 'focus').mockImplementation(() => {})
    const toBody = fakeEvent({ relatedTarget: document.body, target: input, currentTarget: panel })
    mockContentProps.d.onBlurCapture(toBody)
    mockContentProps.d.onBlurCapture(fakeEvent({ relatedTarget: document, target: input, currentTarget: panel }))
    expect(onBlurCapture).toHaveBeenCalledWith(toBody)
    expect(focus).toHaveBeenCalledTimes(2)
  })

  it('焦點移到其他元素、面板本身失焦、或呼叫端已取消時不拉回', () => {
    const { panel, input } = renderPanel(event => {
      if (event.cancel) event.preventDefault()
    })
    const focus = jest.spyOn(panel, 'focus').mockImplementation(() => {})
    mockContentProps.d.onBlurCapture(fakeEvent({ relatedTarget: input, target: input, currentTarget: panel }))
    mockContentProps.d.onBlurCapture(fakeEvent({ relatedTarget: document.body, target: panel, currentTarget: panel }))
    mockContentProps.d.onBlurCapture(fakeEvent({ cancel: true, relatedTarget: document.body, target: input, currentTarget: panel }))
    expect(focus).not.toHaveBeenCalled()
  })
})
