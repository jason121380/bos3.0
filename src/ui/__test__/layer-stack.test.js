// layer-stack：所有浮層（對話框、下拉、日期、Popover、DropdownMenu）共用的開啟順序與 Esc 交接。
// 為什麼重要：窗內再開下拉／密碼窗時，Esc 與「點外面」只能作用在最上層；退場中（data-state=closed）的層不能再搶 Esc，
// 否則按一次 Esc 會連關兩層、或點下拉選項時把底下的對話框關掉。
import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { isTopLayer, useLayerRef } from '../layer-stack'

afterEach(cleanup)

const api = {}
function Layer({ name, enabled, onEscape, state, forwardedRef }) {
  // enabled 不給時走 useLayerRef 的預設（啟用）
  const layer = useLayerRef(forwardedRef, enabled, onEscape)
  api[name] = layer
  return <div ref={layer.ref} data-testid={name} data-state={state} style={{ zIndex: layer.zIndex }} />
}

const fakeEvent = target => ({ target, preventDefault: jest.fn() })

describe('layer-stack', () => {
  it('後開的層 z-index 較高且為頂層；Esc 只交給頂層', () => {
    const lowerEsc = jest.fn()
    const upperEsc = jest.fn()
    const { getByTestId } = render(
      <>
        <Layer name="lower" onEscape={lowerEsc} />
        <Layer name="upper" onEscape={upperEsc} />
      </>
    )
    expect(Number(getByTestId('upper').style.zIndex)).toBeGreaterThan(Number(getByTestId('lower').style.zIndex))
    expect(api.upper.isTop()).toBe(true)
    expect(api.lower.isTop()).toBe(false)
    expect(isTopLayer(getByTestId('upper'))).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(upperEsc).toHaveBeenCalledTimes(1)
    expect(lowerEsc).not.toHaveBeenCalled()
  })

  it('其他按鍵與已取消的 Esc 不處理', () => {
    const esc = jest.fn()
    render(<Layer name="only" onEscape={esc} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    const cancel = event => event.preventDefault()
    document.addEventListener('keydown', cancel, true)
    try {
      // 先登記的 capture 監聽較早執行；這裡另外在 window 捕獲階段取消，模擬上層元件已處理
      window.addEventListener('keydown', cancel, true)
      fireEvent.keyDown(document, { key: 'Escape' })
    } finally {
      window.removeEventListener('keydown', cancel, true)
      document.removeEventListener('keydown', cancel, true)
    }
    expect(esc).not.toHaveBeenCalled()
  })

  it('退場中（data-state=closed）的上層不算頂層，Esc 交給下層', () => {
    const lowerEsc = jest.fn()
    render(
      <>
        <Layer name="lower" onEscape={lowerEsc} />
        <Layer name="closing" state="closed" onEscape={jest.fn()} />
      </>
    )
    expect(api.lower.isTop()).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(lowerEsc).toHaveBeenCalledTimes(1)
  })

  it('頂層沒有 Esc 處理時不出錯', () => {
    render(<Layer name="plain" />)
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow()
  })

  it('guardOutside：發生在較晚層裡的外部事件擋下；其他地方交給呼叫端；沒給呼叫端時不出錯', () => {
    const { getByTestId } = render(
      <>
        <Layer name="lower" />
        <Layer name="upper" />
      </>
    )
    const callback = jest.fn()
    const inUpper = fakeEvent(getByTestId('upper'))
    api.lower.guardOutside(callback)(inUpper)
    expect(inUpper.preventDefault).toHaveBeenCalled()
    expect(callback).not.toHaveBeenCalled()
    const elsewhere = fakeEvent(document.body)
    api.lower.guardOutside(callback)(elsewhere)
    expect(callback).toHaveBeenCalledWith(elsewhere)
    expect(() => api.lower.guardOutside()(fakeEvent(document.body))).not.toThrow()
    // 最上層沒有更晚的層，事件一律交給呼叫端
    expect(api.upper.isLaterLayerEvent(fakeEvent(getByTestId('lower')))).toBe(false)
  })

  it('停用時不登記、不佔順序', () => {
    const { getByTestId } = render(
      <>
        <Layer name="on" />
        <Layer name="off" enabled={false} />
      </>
    )
    expect(api.on.isTop()).toBe(true)
    expect(api.off.isTop()).toBe(false)
    expect(getByTestId('off').style.zIndex).toBe('1300')
  })

  it('沒有任何已登記的層時，停用的層也不是頂層', () => {
    render(<Layer name="alone" enabled={false} />)
    expect(api.alone.isTop()).toBe(false)
  })

  it('外部 ref 換成新的時清掉舊 ref、把節點交給新 ref', () => {
    const first = React.createRef()
    const second = jest.fn()
    const { rerender, getByTestId } = render(<Layer name="r" forwardedRef={first} />)
    expect(first.current).toBe(getByTestId('r'))
    rerender(<Layer name="r" forwardedRef={second} />)
    expect(first.current).toBeNull()
    expect(second).toHaveBeenLastCalledWith(getByTestId('r'))
  })

  it('卸載後回收：剩下的層重新成為頂層', () => {
    const lowerEsc = jest.fn()
    const { rerender } = render(
      <>
        <Layer name="lower" onEscape={lowerEsc} />
        <Layer name="upper" />
      </>
    )
    rerender(<Layer name="lower" onEscape={lowerEsc} />)
    expect(api.lower.isTop()).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(lowerEsc).toHaveBeenCalledTimes(1)
  })
})
