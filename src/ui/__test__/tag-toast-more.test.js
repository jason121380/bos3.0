// Tag 鍵盤刪除與 toast 暫停計時的其餘行為。
// - Tag：Backspace／Delete 只在標籤本身（不是內部按鈕）時才刪除；呼叫端 keydown／keyup 先執行，可 preventDefault 取消刪除。
// - toast：滑鼠移入「且」聚焦時要兩者都離開才恢復計時（否則使用者還在讀、提示就消失）；重複關閉同一則不重複通知。
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Tag } from '../tag'
import { Toaster, toast } from '../toast'

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('Tag', () => {
  it('呼叫端的 onKeyDown／onKeyUp 先執行；keydown 的 Backspace 擋下瀏覽器預設（不倒退頁面）', () => {
    const onKeyDown = jest.fn()
    const onKeyUp = jest.fn()
    const remove = jest.fn()
    render(<Tag label="乾燥" onDelete={remove} onKeyDown={onKeyDown} onKeyUp={onKeyUp} data-testid="tag" />)
    const tag = screen.getByTestId('tag')
    expect(fireEvent.keyDown(tag, { key: 'Backspace' })).toBe(false)
    expect(fireEvent.keyDown(tag, { key: 'a' })).toBe(true)
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    fireEvent.keyUp(tag, { key: 'Delete' })
    expect(onKeyUp).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledTimes(1)
  })

  it('呼叫端在 keyup 取消預設時不刪除', () => {
    const remove = jest.fn()
    render(<Tag label="乾燥" onDelete={remove} onKeyUp={event => event.preventDefault()} data-testid="tag" />)
    fireEvent.keyUp(screen.getByTestId('tag'), { key: 'Backspace' })
    expect(remove).not.toHaveBeenCalled()
  })

  it('沒有 onDelete 時按鍵不做事；內部按鈕上的 keydown 不擋預設', () => {
    const onKeyDown = jest.fn()
    render(<Tag label="一般" onKeyDown={onKeyDown} data-testid="plain" />)
    expect(fireEvent.keyDown(screen.getByTestId('plain'), { key: 'Backspace' })).toBe(true)
    fireEvent.keyUp(screen.getByTestId('plain'), { key: 'Backspace' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    cleanup()
    render(<Tag label="乾燥" onDelete={jest.fn()} />)
    expect(fireEvent.keyDown(screen.getByRole('button'), { key: 'Backspace' })).toBe(true)
  })

  it('刪除鈕名稱：數字標籤照用、非文字標籤改稱「標籤」、可自訂', () => {
    render(
      <>
        <Tag label={12} onDelete={jest.fn()} />
        <Tag label={<b>粗體</b>} onDelete={jest.fn()} />
        <Tag label="乾燥" deleteLabel="移除乾燥髮質" onDelete={jest.fn()} />
      </>
    )
    expect(screen.getByRole('button', { name: '刪除「12」' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刪除「標籤」' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移除乾燥髮質' })).toBeInTheDocument()
  })
})

describe('toast 暫停與關閉', () => {
  it('滑鼠移入且聚焦：只離開其中一個仍暫停，兩者都離開才以一半時間重新計時', () => {
    jest.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast.success('已儲存')
    })
    const card = screen.getByRole('status')
    fireEvent.mouseEnter(card)
    fireEvent.focusIn(card)
    fireEvent.mouseLeave(card)
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(screen.getByText('已儲存')).toBeInTheDocument()
    fireEvent.focusOut(card)
    act(() => {
      jest.advanceTimersByTime(1499)
    })
    expect(screen.getByText('已儲存')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(screen.queryByText('已儲存')).toBeNull()
  })

  it('錯誤提示不自動消失，移入移出也不開始計時；重複關閉同一則不出錯', () => {
    jest.useFakeTimers()
    render(<Toaster />)
    let id
    act(() => {
      id = toast.error('儲存失敗', '請稍後再試')
    })
    const card = screen.getByRole('alert')
    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)
    act(() => {
      jest.advanceTimersByTime(60000)
    })
    expect(screen.getByText('請稍後再試')).toBeInTheDocument()
    act(() => {
      toast.dismiss(id)
      toast.dismiss(id)
    })
    expect(screen.queryByText('儲存失敗')).toBeNull()
  })

  it('已經消失的提示收到移出事件不出錯', () => {
    jest.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast.info('提醒')
    })
    const card = screen.getByRole('status')
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(() => fireEvent.mouseLeave(card)).not.toThrow()
  })
})
