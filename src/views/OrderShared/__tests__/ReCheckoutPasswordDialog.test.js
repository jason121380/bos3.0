import React, { useState } from 'react'
import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react'
import ReCheckoutPasswordDialog from '../ReCheckoutPasswordDialog'

// 為什麼重要：重新結帳（改已結帳的帳單）要輸入操作密碼。欄位只顯示星號、實際密碼另外保管，
// 每次輸入都要依游標位置把變動套回實際密碼——算錯就是「明明輸入正確卻被拒」或把錯的密碼送出。
// 守住：在尾端打字、退格、選取一段刪除、選取一段改打、在中間退格、貼上都能得到正確的實際密碼，且游標停在合理位置；
// 畫面上永遠只有星號，不能複製（Ctrl+C、copy）；Delete 鍵停用（向後刪除無法從長度變化判斷位置）。

afterEach(cleanup)

function Harness({ initial = '', confirmDisabled = false, onClose = () => {}, onConfirm = () => {} }) {
  const [pwd, setPwd] = useState(initial)
  return (
    <>
      <ReCheckoutPasswordDialog
        open
        title="重新結帳"
        reCheckoutPwd={pwd}
        setReCheckoutPwd={setPwd}
        confirmDisabled={confirmDisabled}
        onClose={onClose}
        onConfirm={onConfirm}
      />
      <output data-testid="actual">{pwd}</output>
    </>
  )
}

const input = () => screen.getByLabelText('密碼')
const actual = () => screen.getByTestId('actual').textContent

// 移動游標／選取範圍：React 的 onSelect 在輸入框有焦點時，於 keyup 等事件檢查選取範圍
const select = (start, end = start) => {
  input().focus()
  input().setSelectionRange(start, end)
  fireEvent.keyUp(input())
}
// 在目前選取範圍輸入：瀏覽器把選取範圍換成新文字後送出 change
const typeAt = (start, end, text) => {
  select(start, end)
  const shown = input().value
  fireEvent.change(input(), { target: { value: shown.slice(0, start) + text + shown.slice(end) } })
}
// jsdom 的貼上事件沒有剪貼簿內容，補上 clipboardData
const paste = text => {
  const event = createEvent.paste(input())
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  fireEvent(input(), event)
}
const backspaceAt = position => {
  select(position)
  const shown = input().value
  fireEvent.change(input(), { target: { value: shown.slice(0, position - 1) + shown.slice(position) } })
}

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

test('依序輸入：實際密碼為輸入的字元，畫面只顯示星號，游標停在尾端', () => {
  render(<Harness />)
  typeAt(0, 0, '1')
  typeAt(1, 1, '2')
  typeAt(2, 2, '3')
  act(() => jest.runOnlyPendingTimers())
  expect(actual()).toBe('123')
  expect(input()).toHaveValue('***')
  expect(input().selectionStart).toBe(3)
})

test('在尾端退格：刪掉最後一個字元', () => {
  render(<Harness initial="1234" />)
  backspaceAt(4)
  act(() => jest.runOnlyPendingTimers())
  expect(actual()).toBe('123')
  expect(input().selectionStart).toBe(3)
})

test('在中間退格：刪掉游標前的字元，游標往前一格', () => {
  render(<Harness initial="1234" />)
  backspaceAt(2)
  act(() => jest.runOnlyPendingTimers())
  expect(actual()).toBe('134')
  expect(input().selectionStart).toBe(1)
})

test('選取一段後刪除：刪掉整段', () => {
  render(<Harness initial="123456" />)
  select(1, 4)
  fireEvent.change(input(), { target: { value: '***' } })
  expect(actual()).toBe('156')
})

test('選取一段後改打一個字：整段換成新字元，游標停在新字元後', () => {
  render(<Harness initial="1234" />)
  typeAt(1, 3, '9')
  act(() => jest.runOnlyPendingTimers())
  expect(actual()).toBe('194')
  expect(input().selectionStart).toBe(2)
})

test('在中間插入：插在游標位置', () => {
  render(<Harness initial="1234" />)
  typeAt(2, 2, '9')
  expect(actual()).toBe('12934')
})

test('貼上：取代選取範圍，游標停在貼上內容之後', () => {
  render(<Harness initial="1234" />)
  select(1, 3)
  paste('567')
  act(() => jest.runOnlyPendingTimers())
  expect(actual()).toBe('15674')
  expect(input()).toHaveValue('*****')
  expect(input().selectionStart).toBe(4)
})

test('不能複製密碼、Delete 鍵停用；其他按鍵照常', () => {
  render(<Harness initial="1234" />)
  const notPrevented = event => fireEvent(input(), event)
  expect(notPrevented(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true }))).toBe(false)
  expect(notPrevented(new KeyboardEvent('keydown', { key: 'C', ctrlKey: true, bubbles: true, cancelable: true }))).toBe(false)
  expect(notPrevented(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))).toBe(false)
  expect(fireEvent.copy(input())).toBe(false)
  expect(notPrevented(new KeyboardEvent('keydown', { key: 'c', bubbles: true, cancelable: true }))).toBe(true)
  expect(notPrevented(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }))).toBe(true)
})

test('「取消」關閉；「確認」依 confirmDisabled 停用，可按時送出', () => {
  const onClose = jest.fn()
  const onConfirm = jest.fn()
  const { rerender } = render(<Harness confirmDisabled onClose={onClose} onConfirm={onConfirm} />)
  expect(screen.getByRole('heading', { name: '重新結帳' })).toBeInTheDocument()
  expect(screen.getByTestId('confirm')).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  expect(onClose).toHaveBeenCalled()
  rerender(<Harness confirmDisabled={false} onClose={onClose} onConfirm={onConfirm} />)
  fireEvent.click(screen.getByTestId('confirm'))
  expect(onConfirm).toHaveBeenCalled()
})

test('關閉後才執行的游標調整不拋錯', () => {
  const { unmount } = render(<Harness initial="12" />)
  backspaceAt(2)
  typeAt(1, 1, '3')
  select(0, 1)
  paste('9')
  typeAt(0, 2, '5')
  unmount()
  expect(() => act(() => jest.runOnlyPendingTimers())).not.toThrow()
})
