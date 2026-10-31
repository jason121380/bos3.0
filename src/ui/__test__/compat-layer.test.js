// CompatLayer 是 combobox／index-select 共用的浮層行為 helper（Radix DismissableLayer＋FocusScope）。
// 保護它的契約：
// - 關閉時完全卸載，不留登記（否則下層對話框的 Esc／焦點鎖會被一個看不見的層吃掉）；
// - 指標封鎖同步：較晚開啟的 modal 層把下層設成 pointer-events: none 時要通知內容，不可固定回 auto 繞過上層 modal；
// - 關閉後還原焦點只在焦點掉到 body（或還在清單內）時才做，使用者已點到其他欄位就不搶回；
// - 點外面、焦點移到外面不會被 Radix 當成「關閉」，關閉時機由使用端決定。
import React from 'react'
import { act, cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { CompatLayer } from '../compat-layer'

afterEach(cleanup)

// React 17 在卸載後的下一輪才執行 effect 清除（FocusScope 的還原在清除時排程），負向斷言前多等幾輪
const flushTimers = () => act(() => new Promise(resolve => setTimeout(resolve, 50)))

function Harness({ open, restoreFocus, onPointerEventsChange, modal, withContent = true }) {
  const contentRef = React.useRef(null)
  return (
    <div>
      <button type="button">開啟鈕</button>
      <button type="button">其他欄位</button>
      <CompatLayer
        open={open}
        modal={modal}
        restoreFocus={restoreFocus}
        contentRef={withContent ? contentRef : undefined}
        onPointerEventsChange={onPointerEventsChange}
      />
      <ul ref={contentRef}>
        <li>
          <button type="button">清單項目</button>
        </li>
      </ul>
    </div>
  )
}

describe('CompatLayer', () => {
  it('關閉時不渲染任何 Radix 節點', () => {
    const { container } = render(<Harness open={false} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('打開時把指標狀態同步給內容；較晚開啟的 modal 層封鎖下層時改通知 none', async () => {
    const lower = jest.fn()
    const { rerender } = render(
      <>
        <Harness open onPointerEventsChange={lower} />
        <CompatLayer open={false} modal />
      </>
    )
    expect(lower).toHaveBeenLastCalledWith('auto')
    rerender(
      <>
        <Harness open onPointerEventsChange={lower} />
        <CompatLayer open modal />
      </>
    )
    await wait(() => expect(lower).toHaveBeenLastCalledWith('none'))
  })

  it('沒有 onPointerEventsChange 時不觀察指標狀態也不拋錯', () => {
    expect(() => render(<Harness open />)).not.toThrow()
  })

  it('restoreFocus：關閉後焦點掉到 body 時還原到開啟前的元素', async () => {
    const { rerender } = render(<Harness open={false} restoreFocus />)
    screen.getByRole('button', { name: '開啟鈕' }).focus()
    rerender(<Harness open restoreFocus />)
    document.activeElement.blur()
    rerender(<Harness open={false} restoreFocus />)
    await wait(() => expect(screen.getByRole('button', { name: '開啟鈕' })).toHaveFocus())
  })

  it('restoreFocus：焦點還在清單內時也還原到開啟前的元素', async () => {
    const { rerender } = render(<Harness open={false} restoreFocus />)
    screen.getByRole('button', { name: '開啟鈕' }).focus()
    rerender(<Harness open restoreFocus />)
    screen.getByRole('button', { name: '清單項目' }).focus()
    rerender(<Harness open={false} restoreFocus />)
    await wait(() => expect(screen.getByRole('button', { name: '開啟鈕' })).toHaveFocus())
  })

  it('restoreFocus：使用者已點到其他欄位時不搶回焦點', async () => {
    const { rerender } = render(<Harness open={false} restoreFocus withContent={false} />)
    screen.getByRole('button', { name: '開啟鈕' }).focus()
    rerender(<Harness open restoreFocus withContent={false} />)
    screen.getByRole('button', { name: '其他欄位' }).focus()
    rerender(<Harness open={false} restoreFocus withContent={false} />)
    await flushTimers()
    expect(screen.getByRole('button', { name: '其他欄位' })).toHaveFocus()
  })

  it('restoreFocus：開啟前的元素已被移除時不還原', async () => {
    const outer = document.createElement('button')
    document.body.appendChild(outer)
    outer.focus()
    const { rerender } = render(<Harness open restoreFocus />)
    outer.remove()
    document.activeElement.blur()
    rerender(<Harness open={false} restoreFocus />)
    await flushTimers()
    expect(document.activeElement).toBe(document.body)
  })

  it('沒有 restoreFocus 時關閉不移動焦點', async () => {
    const { rerender } = render(<Harness open={false} />)
    screen.getByRole('button', { name: '開啟鈕' }).focus()
    rerender(<Harness open />)
    document.activeElement.blur()
    rerender(<Harness open={false} />)
    await flushTimers()
    expect(document.activeElement).toBe(document.body)
  })

  it('點外面、焦點移到外面不會觸發 Esc 關閉處理，層仍在', async () => {
    const onEscapeKeyDown = jest.fn()
    const { container } = render(
      <div>
        <button type="button">外面</button>
        <CompatLayer open onEscapeKeyDown={onEscapeKeyDown} />
      </div>
    )
    await flushTimers()
    fireEvent.pointerDown(screen.getByRole('button', { name: '外面' }))
    fireEvent.focusIn(screen.getByRole('button', { name: '外面' }))
    expect(onEscapeKeyDown).not.toHaveBeenCalled()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1)
  })
})
