import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import { DatePicker, DateTimePicker, MobileDatePicker, MobileDateTimePicker } from '../date-picker'

// 保護什麼：日期選擇器（ui/date-picker）在 date-picker.test.js 以外的契約：
// - 驗證代碼（onError）與 MUI 相同：invalidDate／disablePast／disableFuture／shouldDisableDate／minDate／maxDate／maxTime／minTime，
//   各頁依代碼擋送出（例如預約不可選過去時間、打卡不可超過現在）。
// - 開關生命週期：受控 open、onOpen／onClose／onAccept、停用與唯讀不開啟、closeOnSelect。
// - 桌機彈層：點外面／Esc 關閉、點彈層內不關；裝置從觸控切到滑鼠時（matchMedia change）改用桌機版，含舊版 Safari 的 addListener。
// - 欄位：slotProps.textField（物件或函式）、slots.field、label、fullWidth、ref；只有 data-*／aria-*／id 落到 DOM。

const NOW = new Date(2026, 9, 22, 12, 0) // 2026/10/22 12:00

beforeEach(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(NOW)
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

const iso = d => (d instanceof Date && !Number.isNaN(d.getTime()) ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}` : String(d))

// 以 matchMedia 模擬滑鼠裝置；回傳可觸發 change 的控制器
const mockMatchMedia = (matches, { legacy = false } = {}) => {
  const listeners = new Set()
  const mql = { matches }
  if (legacy) {
    mql.addListener = fn => listeners.add(fn)
    mql.removeListener = fn => listeners.delete(fn)
  } else {
    mql.addEventListener = (_, fn) => listeners.add(fn)
    mql.removeEventListener = (_, fn) => listeners.delete(fn)
  }
  const original = window.matchMedia
  window.matchMedia = () => mql
  return {
    set(next) {
      mql.matches = next
      act(() => listeners.forEach(fn => fn()))
    },
    count: () => listeners.size,
    restore() {
      window.matchMedia = original
    },
  }
}

describe('驗證代碼（onError）', () => {
  const errorOf = (Picker, props) => {
    const onError = jest.fn()
    const utils = render(<Picker onChange={() => {}} onError={onError} {...props} />)
    const reason = onError.mock.calls.length ? onError.mock.calls[onError.mock.calls.length - 1][0] : 'not-called'
    utils.unmount()
    return reason
  }

  it('日期：invalidDate、disablePast、shouldDisableDate、minDate、maxDate；符合時為 null（沒錯誤不呼叫）', () => {
    expect(errorOf(MobileDatePicker, { value: 'abc' })).toBe('invalidDate')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 21), disablePast: true })).toBe('disablePast')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 23), disablePast: true })).toBe('not-called')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 19), shouldDisableDate: d => d.getDay() === 1 })).toBe('shouldDisableDate')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 20), shouldDisableDate: d => d.getDay() === 1 })).toBe('not-called')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 1), minDate: '2026-10-05T00:00' })).toBe('minDate')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 5), minDate: '2026-10-05T00:00' })).toBe('not-called')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 31), maxDate: new Date(2026, 9, 25) })).toBe('maxDate')
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 25), maxDate: new Date(2026, 9, 25) })).toBe('not-called')
  })

  it('日期時間：maxDateTime 隔天為 maxDate、同日較晚為 maxTime；minDateTime 前一天為 minDate、同日較早為 minTime', () => {
    const max = new Date(2026, 9, 22, 10, 0)
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 23, 9, 0), maxDateTime: max })).toBe('maxDate')
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 22, 11, 0), maxDateTime: max })).toBe('maxTime')
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 22, 9, 0), maxDateTime: max })).toBe('not-called')
    const min = new Date(2026, 9, 22, 10, 0)
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 21, 11, 0), minDateTime: min })).toBe('minDate')
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 22, 9, 0), minDateTime: min })).toBe('minTime')
    expect(errorOf(MobileDateTimePicker, { value: new Date(2026, 9, 22, 11, 0), minDateTime: min })).toBe('not-called')
    // 純日期的選擇器不看 maxDateTime 的時間
    expect(errorOf(MobileDatePicker, { value: new Date(2026, 9, 22, 11, 0), maxDateTime: max })).toBe('not-called')
  })

  it('value 可為時間戳；沒有 onError 時有錯誤也不拋錯，欄位以紅框（aria-invalid）提示', () => {
    render(<MobileDatePicker value={new Date(2026, 9, 1).getTime()} minDate={new Date(2026, 9, 5)} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('2026/10/01')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('開關生命週期（手機版）', () => {
  it('停用或唯讀時點欄位不開啟', () => {
    const onOpen = jest.fn()
    const { rerender } = render(<MobileDatePicker value={null} disabled onOpen={onOpen} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    rerender(<MobileDatePicker value={null} readOnly onOpen={onOpen} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    expect(onOpen).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('沒有值時以今天的月份開啟、標題顯示「––」；onOpen／onClose 照常；點背景保留目前值並關閉', () => {
    const onOpen = jest.fn()
    const onClose = jest.fn()
    render(<MobileDatePicker value={null} onOpen={onOpen} onClose={onClose} />)
    fireEvent.click(screen.getByRole('textbox'))
    expect(onOpen).toHaveBeenCalled()
    const dialog = screen.getByRole('dialog', { name: '選擇日期' })
    expect(within(dialog).getByText('––')).toBeInTheDocument()
    expect(within(dialog).getByRole('grid')).toHaveAttribute('aria-label', expect.stringContaining('2026'))
    // 沒有 onChange 也能選（不拋錯）
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月3日' }))
    fireEvent.click(document.querySelector('.MuiBackdrop-root'))
    expect(onClose).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('受控 open=false：點欄位只呼叫 onOpen，由外層決定是否開啟', () => {
    const onOpen = jest.fn()
    render(<MobileDatePicker open={false} value={null} onOpen={onOpen} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('原本是空值時，選日後按「取消」以 null 還原', () => {
    const onChange = jest.fn()
    const Harness = () => {
      const [value, setValue] = React.useState(null)
      return (
        <MobileDatePicker
          value={value}
          onChange={next => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月3日' }))
    fireEvent.click(screen.getByText('取消'))
    expect(onChange.mock.calls.map(c => iso(c[0]))).toEqual(['2026-10-3 0:0', 'null'])
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('受控 open：確認後呼叫 onClose 但由外層決定是否關閉；沒有 onAccept 也不拋錯', () => {
    const onClose = jest.fn()
    render(<MobileDatePicker open value={new Date(2026, 9, 20)} onClose={onClose} onChange={() => {}} />)
    fireEvent.click(screen.getByText('確認'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closeOnSelect（手機）：選完最後一個視圖即確認並關閉；選同一天不重複 onChange', () => {
    const onChange = jest.fn()
    const onAccept = jest.fn()
    render(<MobileDatePicker closeOnSelect value={new Date(2026, 9, 20)} onChange={onChange} onAccept={onAccept} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月20日' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(onAccept).toHaveBeenCalledWith(new Date(2026, 9, 20))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('openTo=year：選年份後跳到日；日視圖的標題鈕回到年份；沒有 year 視圖時標題鈕不動作', () => {
    const onChange = jest.fn()
    const { unmount } = render(<MobileDatePicker openTo="year" value={new Date(2026, 9, 20)} onChange={onChange} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByText('2024'))
    expect(iso(onChange.mock.calls[0][0])).toBe('2024-10-20 0:0')
    expect(screen.getByRole('grid')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('選擇年份'))
    expect(screen.getByRole('radiogroup', { name: '選擇年份' })).toBeInTheDocument()
    unmount()
    render(<MobileDatePicker views={['day']} value={new Date(2026, 9, 20)} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByLabelText('選擇年份'))
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it("views=['month']：月份視圖的標題鈕在沒有 year 時不動作；views=['year'] 的標題只顯示年份", () => {
    const { unmount } = render(<MobileDatePicker views={['month']} value={new Date(2026, 9, 1)} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByLabelText('選擇年份'))
    expect(screen.queryByRole('radiogroup', { name: '選擇年份' })).toBeNull()
    expect(screen.getByRole('dialog')).toHaveTextContent('十月 2026')
    unmount()
    render(<MobileDatePicker views={['year', 'month']} openTo="month" value={new Date(2026, 9, 1)} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByLabelText('選擇年份'))
    expect(screen.getByRole('radiogroup', { name: '選擇年份' })).toBeInTheDocument()
    cleanup()
    render(<MobileDatePicker views={['year']} value={new Date(2026, 9, 1)} onChange={() => {}} slotProps={{ toolbar: { hidden: false } }} />)
    fireEvent.click(screen.getByRole('textbox'))
    const toolbarValue = screen.getByRole('dialog').querySelector('.text-\\[26px\\]')
    expect(toolbarValue.textContent).toBe('2026')
  })

  it('toolbar.hidden 時不畫標題列', () => {
    render(<MobileDatePicker value={new Date(2026, 9, 1)} onChange={() => {}} slotProps={{ toolbar: { hidden: true } }} />)
    fireEvent.click(screen.getByRole('textbox'))
    expect(screen.getByRole('dialog').querySelector('.text-\\[26px\\]')).toBeNull()
  })
})

describe('日期時間（手機版）', () => {
  it('沒有值時時間以「現在（到分）」為基準；選日後跳到時', () => {
    const onChange = jest.fn()
    render(<MobileDateTimePicker value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月25日' }))
    expect(iso(onChange.mock.calls[0][0])).toBe('2026-10-25 12:0')
    expect(screen.getByRole('listbox', { name: '時' })).toBeInTheDocument()
  })

  it("views 只有 day 與 minutes 時，選日後顯示時間清單（minutes 併入 hours 視圖）；openTo=hours 且沒有值時以現在為準", () => {
    const { unmount } = render(<MobileDateTimePicker views={['day', 'minutes']} value={new Date(2026, 9, 20, 9, 0)} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月21日' }))
    expect(screen.getByRole('listbox', { name: '分' })).toBeInTheDocument()
    unmount()
    render(<MobileDateTimePicker openTo="hours" value={null} onChange={() => {}} />)
    fireEvent.click(screen.getByRole('textbox'))
    const hours = screen.getByRole('listbox', { name: '時' })
    expect(hours.querySelector('[aria-selected="true"]').textContent).toBe('12')
  })
})

describe('桌機版彈層', () => {
  let mm
  beforeEach(() => {
    mm = mockMatchMedia(true)
  })
  afterEach(() => mm.restore())

  it('點月曆鈕開啟；點彈層內或欄位不關，點外面關閉；Esc 關閉、其他按鍵不關', () => {
    const onClose = jest.fn()
    render(
      <div>
        <span>外面</span>
        <DatePicker value={new Date(2026, 9, 20)} onChange={() => {}} onClose={onClose} />
      </div>
    )
    const openBtn = screen.getByRole('button', { name: '選擇日期，目前為 2026/10/20' })
    fireEvent.click(openBtn)
    const paper = screen.getByRole('dialog', { name: '選擇日期' })
    fireEvent.mouseDown(within(paper).getByLabelText('上個月'))
    fireEvent.mouseDown(screen.getByRole('textbox'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('外面'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(openBtn)
    fireEvent.keyDown(document, { key: 'a' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('桌機預設 closeOnSelect：選日即確認並關閉', () => {
    const onAccept = jest.fn()
    render(<DatePicker value={new Date(2026, 9, 20)} onChange={() => {}} onAccept={onAccept} />)
    fireEvent.click(screen.getByRole('button', { name: /選擇日期/ }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月8日' }))
    expect(onAccept).toHaveBeenCalledWith(new Date(2026, 9, 8))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('slotProps.textField.error 覆寫紅框；唯讀時月曆鈕停用', () => {
    render(<DatePicker value="abc" readOnly onChange={() => {}} slotProps={{ textField: { error: false } }} />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('button', { name: '選擇日期' })).toBeDisabled()
  })

  it('桌機版清掉一段時送出 Invalid Date（預約頁靠此擋送出）', () => {
    const onChange = jest.fn()
    render(<DatePicker value={new Date(2026, 9, 20)} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    act(() => input.focus())
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(iso(onChange.mock.calls[0][0])).toBe('Invalid Date')
  })

  it('DateTimePicker 桌機版：預設格式含時間', () => {
    render(<DateTimePicker value={new Date(2026, 9, 20, 9, 5)} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('2026/10/20 09:05')
  })
})

describe('裝置模式切換（matchMedia change）', () => {
  it('從觸控切到滑鼠時改成桌機版分段輸入；卸載時移除監聽', () => {
    const mm = mockMatchMedia(false)
    const { unmount } = render(<DatePicker value={new Date(2026, 9, 20)} onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /選擇日期/ })).toBeNull()
    mm.set(true)
    expect(screen.getByRole('button', { name: /選擇日期/ })).toBeInTheDocument()
    act(() => unmount())
    expect(mm.count()).toBe(0)
    mm.restore()
  })

  it('舊版 Safari（只有 addListener／removeListener）也能監聽', () => {
    const mm = mockMatchMedia(false, { legacy: true })
    const { unmount } = render(<DatePicker value={new Date(2026, 9, 20)} onChange={() => {}} />)
    mm.set(true)
    expect(screen.getByRole('button', { name: /選擇日期/ })).toBeInTheDocument()
    act(() => unmount())
    expect(mm.count()).toBe(0)
    mm.restore()
  })
})

describe('欄位與外層', () => {
  it('只有 data-*／aria-*／id 落到外層 DOM；MUI 專用或拼錯的 props 不輸出', () => {
    const { container } = render(<MobileDatePicker value={null} onChange={() => {}} data-testid="dp" id="dp1" aria-describedby="hint" ocaleText={{}} foo="bar" />)
    const root = screen.getByTestId('dp')
    expect(root).toBe(container.firstChild)
    expect(root).toHaveAttribute('id', 'dp1')
    expect(root).toHaveAttribute('aria-describedby', 'hint')
    expect(root).not.toHaveAttribute('foo')
    expect(root).not.toHaveAttribute('ocaletext')
  })

  it('label 以 Field 包在上方（htmlFor 取 slotProps.textField.id、required 星號）；textField.fullWidth 撐滿；slotProps.textField 可為函式', () => {
    const { container } = render(
      <MobileDatePicker label="生日" required value={null} onChange={() => {}} slotProps={{ textField: () => ({ id: 'bday', fullWidth: true }) }} />
    )
    expect(screen.getByText('生日').tagName).toBe('LABEL')
    expect(screen.getByText('生日')).toHaveAttribute('for', 'bday')
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(container.querySelector('.ui-date-picker')).toHaveClass('w-full')
  })

  it('手機欄位：placeholder 與 inputProps.className 可自訂、error 可覆寫；直接改文字無作用', () => {
    render(
      <MobileDatePicker
        value="abc"
        onChange={() => {}}
        slotProps={{ textField: { placeholder: '請選擇', error: false, inputProps: { className: 'xx' } } }}
      />
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', '請選擇')
    expect(input).toHaveClass('cursor-pointer', 'xx')
    expect(input).not.toHaveAttribute('aria-invalid')
    fireEvent.change(input, { target: { value: '亂打' } })
    expect(input).toHaveValue('')
    // 手機版按其他鍵不開啟
    fireEvent.keyDown(input, { key: 'a' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('slots.field：停用時不給 onClick；readOnly 由頁面指定時照傳', () => {
    const seen = {}
    const Field = props => {
      Object.assign(seen, { onClick: props.onClick, readOnly: props.readOnly })
      return <span>欄位</span>
    }
    const { rerender } = render(<MobileDatePicker value={null} slots={{ field: Field }} disabled onChange={() => {}} />)
    expect(seen.onClick).toBeUndefined()
    expect(seen.readOnly).toBe(true)
    rerender(<MobileDatePicker value={null} slots={{ field: Field }} readOnly={false} onChange={() => {}} />)
    expect(typeof seen.onClick).toBe('function')
    expect(seen.readOnly).toBe(false)
  })

  it('ref 可為函式或物件，都拿到最外層節點', () => {
    const fnRef = jest.fn()
    const { container, rerender } = render(<MobileDatePicker ref={fnRef} value={null} onChange={() => {}} />)
    expect(fnRef).toHaveBeenCalledWith(container.firstChild)
    const objRef = React.createRef()
    rerender(<MobileDatePicker ref={objRef} value={null} onChange={() => {}} />)
    expect(objRef.current).toBe(container.firstChild)
  })
})
