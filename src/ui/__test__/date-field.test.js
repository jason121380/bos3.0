import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { DateField, parseFormat } from '../date-field'

// 保護什麼：桌機版日期欄位的分段輸入（ui/date-field）。
// onChange 的三種回傳值是各頁判斷的依據（CLAUDE.md／檔頭說明）：Date（填完且日期存在）、Invalid Date（未填完或不存在，如 2/30）、
// null（全部清空）；與上次相同不重複呼叫。鍵盤：數字逐段填入、方向鍵調整與換段、Backspace／Delete 清除；
// 貼上完整日期；滑鼠點擊定位到所在段；readOnly／disabled 時不可改值。

afterEach(cleanup)

const iso = d => (d === null ? 'null' : Number.isNaN(d.getTime()) ? 'Invalid' : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)

// jsdom 的 paste 事件不帶 clipboardData：自行掛上
const paste = (input, text) => {
  const ev = createEvent.paste(input)
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } })
  fireEvent(input, ev)
  return ev
}

const setup = (props = {}) => {
  const onChange = jest.fn()
  const utils = render(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={null} onChange={onChange} {...props} />)
  const input = screen.getByLabelText('日期')
  const type = (...keys) => keys.forEach(key => fireEvent.keyDown(input, { key }))
  const focus = () => act(() => input.focus())
  return { ...utils, input, onChange, type, focus }
}

describe('parseFormat', () => {
  it('多字元分隔符號合併成一段', () => {
    expect(parseFormat('yyyy - MM')).toEqual([{ token: 'yyyy' }, { sep: ' - ' }, { token: 'MM' }])
  })
})

describe('DateField 數字輸入', () => {
  it('依序填完回傳 Date；填到一半回傳 Invalid Date；同值不重複呼叫', () => {
    const { input, onChange, type, focus } = setup()
    expect(input).toHaveAttribute('placeholder', 'YYYY/MM/DD')
    expect(input).toHaveValue('')
    focus()
    expect(input).toHaveValue('YYYY/MM/DD')
    type('2', '0', '2', '6')
    expect(iso(onChange.mock.calls[0][0])).toBe('Invalid')
    // 年份已是 Invalid Date，再填月份仍是 Invalid Date：不重複呼叫
    type('1', '0')
    expect(onChange).toHaveBeenCalledTimes(1)
    type('2', '2')
    expect(input).toHaveValue('2026/10/22')
    // 日打第一位 2 時已是有效日期 10/02（還可能接第二位，同 MUI 會先送出），第二位後才是 10/22
    expect(onChange.mock.calls.map(c => iso(c[0]))).toEqual(['Invalid', '2026-10-2', '2026-10-22'])
  })

  it('月份輸入 2 以上直接跳到日（不可能再接第二位）', () => {
    const { input, type, focus } = setup()
    focus()
    type('2', '0', '2', '6', '3', '5')
    expect(input).toHaveValue('2026/03/05')
  })

  // Jason 2026/10/22 fix all：原本超過上限以這一位重新開始後不跳段，再打的數字仍落在月份（打 1、3、1、5 得到 05 月、日空白）；
  // 改為重新開始的這一位若不可能再接第二位（num*10 > 上限）也跳到下一段，與原 MUI 相同
  it('月份打 1 再打 3（13 超過上限）時以 3 重新開始並跳到日，再打 1、5 填入日', () => {
    const { input, onChange, type, focus } = setup()
    focus()
    type('2', '0', '2', '6', '1', '3')
    expect(input).toHaveValue('2026/03/DD')
    type('1', '5')
    expect(input).toHaveValue('2026/03/15')
    expect(iso(onChange.mock.calls[onChange.mock.calls.length - 1][0])).toBe('2026-3-15')
  })

  it('超過上限重新開始的這一位還能接第二位時留在原段（日打 3、2 → 以 2 重新開始，再打 9 → 29）', () => {
    const { input, type, focus } = setup()
    focus()
    type('2', '0', '2', '6', '0', '1', '3', '2')
    expect(input).toHaveValue('2026/01/02')
    type('9')
    expect(input).toHaveValue('2026/01/29')
  })

  it('不存在的日期（2/30）回傳 Invalid Date', () => {
    const { onChange, type, focus } = setup()
    focus()
    type('2', '0', '2', '6', '0', '2', '3', '0')
    expect(iso(onChange.mock.calls[onChange.mock.calls.length - 1][0])).toBe('Invalid')
  })

  it('未聚焦就按鍵時從第一段開始；直接改 input 文字（change 事件）不影響各段；沒有 onBlur 時失焦不拋錯', () => {
    const { input, type } = setup()
    type('2')
    expect(input).toHaveValue('0002/MM/DD')
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input).toHaveValue('0002/MM/DD')
    act(() => input.focus())
    expect(() => act(() => input.blur())).not.toThrow()
  })

  it('沒有 onChange 時照樣可以輸入', () => {
    const { input, type, focus } = setup({ onChange: undefined })
    focus()
    type('2', '0', '2', '6')
    expect(input).toHaveValue('2026/MM/DD')
  })
})

describe('DateField 方向鍵與清除', () => {
  it('左右／Home／End 換段，上下調整該段並循環（12 月再加回 1 月、1 日再減到 31 日）', () => {
    const { input, onChange, type, focus } = setup({ value: new Date(2026, 11, 1) })
    focus()
    type('ArrowRight')
    type('ArrowUp')
    expect(input).toHaveValue('2026/01/01')
    type('ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowDown')
    expect(input).toHaveValue('2025/01/01')
    type('End', 'ArrowDown')
    expect(input).toHaveValue('2025/01/31')
    type('Home', 'ArrowUp')
    expect(input).toHaveValue('2026/01/31')
    expect(iso(onChange.mock.calls[onChange.mock.calls.length - 1][0])).toBe('2026-1-31')
  })

  it('空段按上下從「現在」開始', () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(2026, 9, 22))
    const { input, type, focus } = setup()
    focus()
    type('ArrowUp')
    expect(input).toHaveValue('2026/MM/DD')
    jest.useRealTimers()
  })

  it('Backspace：有值清除該段；空段退到前一段；第一段空時仍清除；Delete 清除目前段；全部清空回傳 null', () => {
    const { input, onChange, type, focus } = setup({ value: new Date(2026, 9, 22) })
    focus()
    type('End', 'Backspace')
    expect(input).toHaveValue('2026/10/DD')
    type('Backspace', 'Backspace')
    expect(input).toHaveValue('2026/MM/DD')
    type('Backspace', 'Delete')
    expect(input).toHaveValue('YYYY/MM/DD')
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toBeNull()
    type('Backspace')
    expect(input).toHaveValue('YYYY/MM/DD')
  })

  it('其他按鍵（Tab）不處理、不 preventDefault；呼叫端 onKeyDown 先收到並可 preventDefault 阻止', () => {
    const onKeyDown = jest.fn(e => {
      if (e.key === '5') e.preventDefault()
    })
    const { input, focus } = setup({ onKeyDown })
    focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    input.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    fireEvent.keyDown(input, { key: '5' })
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    expect(input).toHaveValue('YYYY/MM/DD')
  })

  it('readOnly 或 disabled 時按鍵與貼上都不改值', () => {
    const { input, onChange, type, focus, rerender } = setup({ readOnly: true })
    focus()
    type('2', 'ArrowUp')
    paste(input, '2026/10/22')
    expect(onChange).not.toHaveBeenCalled()
    rerender(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={null} onChange={onChange} disabled />)
    fireEvent.keyDown(input, { key: '2' })
    paste(input, '2026/10/22')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('DateField 貼上、滑鼠、外部值', () => {
  it('貼上符合格式的日期整段填入；不符合的忽略', () => {
    const { input, onChange } = setup()
    expect(paste(input, ' 2026/10/22 ').defaultPrevented).toBe(true)
    expect(iso(onChange.mock.calls[0][0])).toBe('2026-10-22')
    expect(input).toHaveValue('2026/10/22')
    // 不符合格式的文字不攔截（交給瀏覽器預設行為），也不改值
    expect(paste(input, '明天').defaultPrevented).toBe(false)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('點擊（mouseup）定位到游標所在段；游標在最後的文字之後時定位到最後一段', () => {
    const onChange = jest.fn()
    render(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy年MM月dd日" value={new Date(2026, 9, 22)} onChange={onChange} />)
    const input = screen.getByLabelText('日期')
    act(() => input.focus())
    input.setSelectionRange(6, 6)
    fireEvent.mouseUp(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('2026年11月22日')
    input.setSelectionRange(11, 11)
    fireEvent.mouseUp(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('2026年11月23日')
    input.setSelectionRange(0, 0)
    fireEvent.mouseUp(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('2027年11月23日')
  })

  it('外部值改變（從月曆選取）時同步各段；等於自己剛送出的值時保留輸入狀態', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={new Date(2026, 9, 22)} onChange={onChange} />
    )
    const input = screen.getByLabelText('日期')
    expect(input).toHaveValue('2026/10/22')
    rerender(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={new Date(2026, 0, 5)} onChange={onChange} />)
    expect(input).toHaveValue('2026/01/05')
    rerender(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={new Date(2026, 0, 5)} onChange={onChange} />)
    expect(input).toHaveValue('2026/01/05')
  })

  it('placeholder 可自訂；inputRef 可為函式或物件；onFocus／onBlur 照常回呼，重複 focus 不重設段落', () => {
    const fnRef = jest.fn()
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    const { rerender } = render(
      <DateField
        inputProps={{ 'aria-label': '日期' }}
        format="yyyy/MM/dd"
        value={null}
        placeholder="請選擇日期"
        inputRef={fnRef}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    )
    const input = screen.getByLabelText('日期')
    expect(input).toHaveAttribute('placeholder', '請選擇日期')
    expect(fnRef).toHaveBeenCalledWith(input)
    act(() => input.focus())
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    fireEvent.focusIn(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    // 第二次 focus 沒有把段落重設回年：上鍵調整的是月份
    expect(input.value.startsWith('YYYY/')).toBe(true)
    act(() => input.blur())
    expect(onFocus).toHaveBeenCalled()
    expect(onBlur).toHaveBeenCalled()
    const objRef = React.createRef()
    rerender(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={null} inputRef={objRef} />)
    expect(objRef.current).toBe(input)
  })

  it('聚焦中換成段數較少的 format 時不拋錯（找不到原本的段就不反白）', () => {
    const { rerender } = render(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy/MM/dd" value={new Date(2026, 9, 22)} />)
    const input = screen.getByLabelText('日期')
    act(() => input.focus())
    fireEvent.keyDown(input, { key: 'End' })
    expect(() => rerender(<DateField inputProps={{ 'aria-label': '日期' }} format="yyyy" value={new Date(2026, 9, 22)} />)).not.toThrow()
    expect(input).toHaveValue('2026')
  })
})
