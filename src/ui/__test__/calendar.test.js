import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { DayView, MonthView, TimeView, YearView, formatValue, isDayDisabled } from '../calendar'

// 保護什麼：日期選擇器本體（ui/calendar）。帳單日期、報表區間、預約時間都靠它挑日期：
// - isDayDisabled 決定哪些日期不能選（minDate／maxDate／disableFuture／disablePast／maxDateTime／shouldDisableDate），
//   算錯會讓使用者選到不允許的日期（例如未來的帳單日）或選不到該選的日期。
// - 鍵盤：方向鍵移動、PageUp／PageDown 換月，跨月時通知外層換月份，焦點跟著移動。
// - 年份／月份／時間格的停用規則與選取行為。
// 日期一律以本機建構子建立（與畫面相同的台灣時間語意，見 CLAUDE.md 時區規則）。

const TODAY = new Date(2026, 9, 22, 12, 0) // 2026/10/22（週四）

beforeEach(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(TODAY)
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('isDayDisabled', () => {
  const day = d => new Date(2026, 9, d)

  it('沒有任何限制時全部可選', () => {
    expect(isDayDisabled(day(1))).toBe(false)
  })

  it('minDate／maxDate 以「日」比較：邊界當天可選', () => {
    const c = { minDate: new Date(2026, 9, 10, 18), maxDate: new Date(2026, 9, 20, 6) }
    expect(isDayDisabled(day(9), c)).toBe(true)
    expect(isDayDisabled(day(10), c)).toBe(false)
    expect(isDayDisabled(day(20), c)).toBe(false)
    expect(isDayDisabled(day(21), c)).toBe(true)
  })

  it('沒有 minDate／maxDate 時改用 minDateTime／maxDateTime；無效日期的限制忽略', () => {
    expect(isDayDisabled(day(9), { minDateTime: day(10) })).toBe(true)
    expect(isDayDisabled(day(21), { maxDateTime: day(20) })).toBe(true)
    expect(isDayDisabled(day(1), { minDate: 'not-a-date', maxDate: 'nope' })).toBe(false)
  })

  it('disableFuture 擋明天以後、disablePast 擋昨天以前（今天都可選）', () => {
    expect(isDayDisabled(day(22), { disableFuture: true })).toBe(false)
    expect(isDayDisabled(day(23), { disableFuture: true })).toBe(true)
    expect(isDayDisabled(day(22), { disablePast: true })).toBe(false)
    expect(isDayDisabled(day(21), { disablePast: true })).toBe(true)
  })

  it('shouldDisableDate 自訂停用（例如公休日）', () => {
    const shouldDisableDate = d => d.getDay() === 1
    expect(isDayDisabled(new Date(2026, 9, 19), { shouldDisableDate })).toBe(true)
    expect(isDayDisabled(new Date(2026, 9, 20), { shouldDisableDate })).toBe(false)
  })
})

describe('DayView', () => {
  const Harness = ({ value, initialMonth, constraints = {}, onSelect = () => {}, onMonthSpy = () => {} }) => {
    const [month, setMonth] = React.useState(initialMonth)
    return (
      <DayView
        value={value}
        month={month}
        onMonthChange={m => {
          onMonthSpy(m)
          setMonth(m)
        }}
        onSelect={onSelect}
        onOpenYear={() => {}}
        constraints={constraints}
      />
    )
  }
  const cell = label => screen.getByRole('gridcell', { name: label })

  it('沒有選取值時，焦點日在今天所在的月是今天、其他月是 1 日', () => {
    const { unmount } = render(<Harness value={null} initialMonth={new Date(2026, 9, 1)} />)
    expect(cell('2026年10月22日')).toHaveAttribute('tabindex', '0')
    expect(cell('2026年10月22日')).toHaveAttribute('aria-current', 'date')
    unmount()
    render(<Harness value={new Date('invalid')} initialMonth={new Date(2026, 5, 1)} />)
    expect(cell('2026年6月1日')).toHaveAttribute('tabindex', '0')
  })

  it('方向鍵移動焦點；跨月時通知外層換月並把焦點移到新月份的那一天', () => {
    const onMonthSpy = jest.fn()
    render(<Harness value={new Date(2026, 9, 31)} initialMonth={new Date(2026, 9, 1)} onMonthSpy={onMonthSpy} />)
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    act(() => jest.runOnlyPendingTimers())
    expect(document.activeElement).toBe(cell('2026年10月30日'))
    expect(onMonthSpy).not.toHaveBeenCalled()
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    act(() => jest.runOnlyPendingTimers())
    expect(onMonthSpy).toHaveBeenCalledWith(new Date(2026, 10, 1))
    expect(document.activeElement).toBe(cell('2026年11月6日'))
  })

  it('PageUp／PageDown 換月；其他按鍵不處理（不 preventDefault）', () => {
    const onMonthSpy = jest.fn()
    render(<Harness value={new Date(2026, 9, 15)} initialMonth={new Date(2026, 9, 1)} onMonthSpy={onMonthSpy} />)
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'PageDown' })
    act(() => jest.runOnlyPendingTimers())
    expect(onMonthSpy).toHaveBeenLastCalledWith(new Date(2026, 10, 1))
    expect(document.activeElement).toBe(cell('2026年11月15日'))
    fireEvent.keyDown(grid, { key: 'PageUp' })
    act(() => jest.runOnlyPendingTimers())
    expect(onMonthSpy).toHaveBeenLastCalledWith(new Date(2026, 9, 1))
    const ev = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    grid.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })

  it('外層沒跟著換月或元件已卸載時，延後聚焦不拋錯', () => {
    const { unmount } = render(
      <DayView value={new Date(2026, 9, 31)} month={new Date(2026, 9, 1)} onMonthChange={() => {}} onSelect={() => {}} constraints={{}} />
    )
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' })
    // 11/1 不在畫面上（外層沒換月）：找不到格子就不聚焦
    act(() => jest.runOnlyPendingTimers())
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' })
    unmount()
    expect(() => jest.runOnlyPendingTimers()).not.toThrow()
  })

  it('上／下個月按鈕；minDate／maxDate 所在月份以外的方向停用；超出範圍的日期停用', () => {
    const onMonthSpy = jest.fn()
    render(
      <Harness
        value={null}
        initialMonth={new Date(2026, 9, 1)}
        constraints={{ minDate: new Date(2026, 9, 5), maxDate: new Date(2026, 9, 25) }}
        onMonthSpy={onMonthSpy}
      />
    )
    expect(screen.getByLabelText('上個月')).toBeDisabled()
    expect(screen.getByLabelText('下個月')).toBeDisabled()
    expect(cell('2026年10月4日')).toBeDisabled()
    expect(cell('2026年10月4日').className).toContain('pointer-events-none')
    expect(cell('2026年10月5日')).not.toBeDisabled()
  })

  it('disableFuture 時不能翻到下個月；按鈕可翻上個月', () => {
    const onMonthSpy = jest.fn()
    render(<Harness value={null} initialMonth={new Date(2026, 9, 1)} constraints={{ disableFuture: true }} onMonthSpy={onMonthSpy} />)
    expect(screen.getByLabelText('下個月')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('上個月'))
    expect(onMonthSpy).toHaveBeenCalledWith(new Date(2026, 8, 1))
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', expect.stringContaining('2026'))
    fireEvent.click(screen.getByLabelText('下個月'))
    expect(onMonthSpy).toHaveBeenLastCalledWith(new Date(2026, 9, 1))
  })

  it('點日期呼叫 onSelect；autoFocus 時開啟就聚焦在焦點日', () => {
    const onSelect = jest.fn()
    render(<DayView value={new Date(2026, 9, 3)} month={new Date(2026, 9, 1)} onMonthChange={() => {}} onSelect={onSelect} constraints={{}} autoFocus />)
    expect(document.activeElement).toBe(cell('2026年10月3日'))
    expect(cell('2026年10月3日')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(cell('2026年10月9日'))
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 9, 9))
  })

  it('外層換月時：焦點日不在新月份就移到選取日（若在新月份）或 1 日', () => {
    const value = new Date(2026, 10, 18)
    const { rerender } = render(<DayView value={value} month={new Date(2026, 9, 1)} onMonthChange={() => {}} onSelect={() => {}} constraints={{}} />)
    rerender(<DayView value={value} month={new Date(2026, 10, 1)} onMonthChange={() => {}} onSelect={() => {}} constraints={{}} />)
    expect(cell('2026年11月18日')).toHaveAttribute('tabindex', '0')
    rerender(<DayView value={value} month={new Date(2026, 11, 1)} onMonthChange={() => {}} onSelect={() => {}} constraints={{}} />)
    expect(cell('2026年12月1日')).toHaveAttribute('tabindex', '0')
    rerender(<DayView value={null} month={new Date(2027, 0, 1)} onMonthChange={() => {}} onSelect={() => {}} constraints={{}} />)
    expect(cell('2027年1月1日')).toHaveAttribute('tabindex', '0')
  })
})

describe('YearView', () => {
  it('開啟時把選取年份捲到中間並聚焦；minDate／maxDate 以外的年份停用；今年（未選取）加粗', () => {
    const scrollIntoView = jest.fn()
    const real = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    const onSelect = jest.fn()
    render(<YearView value={new Date(2024, 1, 29)} month={new Date(2024, 1, 1)} onSelect={onSelect} constraints={{ minDate: new Date(2020, 0, 1), maxDate: new Date(2030, 0, 1) }} />)
    Element.prototype.scrollIntoView = real
    const y2024 = screen.getByText('2024')
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
    expect(document.activeElement).toBe(y2024)
    expect(screen.getByText('2019')).toBeDisabled()
    expect(screen.getByText('2031')).toBeDisabled()
    expect(screen.getByText('2026').className).toContain('font-semibold')
    fireEvent.click(screen.getByText('2024'))
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2024, 1, 29))
    // 已知缺口（待 Jason 決定）：2/29 換到平年時 date-fns setYear 會溢位成 3/1（與原 MUI 相同行為），這裡鎖住目前行為
    fireEvent.click(screen.getByText('2025'))
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2025, 2, 1))
  })

  it('沒有有效值時以顯示中的月份為準；disableFuture 時今年以後停用；年份不在清單內時不聚焦', () => {
    const onSelect = jest.fn()
    const { unmount } = render(<YearView value={null} month={new Date(2010, 4, 1)} onSelect={onSelect} constraints={{ disableFuture: true }} />)
    expect(screen.getByText('2010')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('2027')).toBeDisabled()
    expect(screen.getByText('2026')).not.toBeDisabled()
    fireEvent.click(screen.getByText('2012'))
    expect(onSelect).toHaveBeenCalledWith(new Date(2012, 4, 1))
    unmount()
    render(<YearView value={new Date(2150, 0, 1)} month={new Date(2150, 0, 1)} onSelect={() => {}} constraints={{}} />)
    expect(Array.from(document.querySelectorAll('[role="radio"]')).filter(r => r.getAttribute('aria-checked') === 'true')).toHaveLength(0)
  })
})

describe('MonthView', () => {
  it('超出 minDate／maxDate 的月份停用；選月份時保留日與時間（月底自動調整）', () => {
    const onSelect = jest.fn()
    const onOpenYear = jest.fn()
    render(
      <MonthView
        value={new Date(2026, 0, 31, 9, 30)}
        month={new Date(2026, 0, 1)}
        onSelect={onSelect}
        onOpenYear={onOpenYear}
        constraints={{ minDate: new Date(2026, 1, 15), maxDate: new Date(2026, 9, 1) }}
      />
    )
    expect(screen.getByRole('radio', { name: '1月' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: '1月' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '11月' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: '11月' }).className).toContain('pointer-events-none')
    fireEvent.click(screen.getByRole('radio', { name: '2月' }))
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 1, 28, 9, 30))
    fireEvent.click(screen.getByLabelText('選擇年份'))
    expect(onOpenYear).toHaveBeenCalled()
  })

  it('沒有有效值時以顯示中的月份為準、沒有選取月；disableFuture 停用未來月份', () => {
    render(<MonthView value={null} month={new Date(2026, 3, 1)} onSelect={() => {}} onOpenYear={() => {}} constraints={{ disableFuture: true }} />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', '2026 年月份')
    expect(screen.queryAllByRole('radio').filter(r => r.getAttribute('aria-checked') === 'true')).toHaveLength(0)
    expect(screen.getByRole('radio', { name: '11月' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: '10月' })).not.toBeDisabled()
  })
})

describe('TimeView', () => {
  it('沒有值時以今天 00:00 為基準；maxDateTime 之後的時間停用；開啟時捲到選取時間', () => {
    const scrollIntoView = jest.fn()
    const real = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    const onSelectHour = jest.fn()
    const onSelectMinute = jest.fn()
    const { unmount } = render(
      <TimeView value={null} onSelectHour={onSelectHour} onSelectMinute={onSelectMinute} maxDateTime={new Date(2026, 9, 22, 10, 30)} minutesStep={15} />
    )
    Element.prototype.scrollIntoView = real
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    const hours = screen.getByRole('listbox', { name: '時' })
    const minutes = screen.getByRole('listbox', { name: '分' })
    expect(hours.querySelector('[aria-selected="true"]').textContent).toBe('00')
    expect(Array.from(minutes.querySelectorAll('button')).map(b => b.textContent)).toEqual(['00', '15', '30', '45'])
    const h11 = Array.from(hours.querySelectorAll('button')).find(b => b.textContent === '11')
    expect(h11).toBeDisabled()
    expect(h11.className).toContain('pointer-events-none')
    fireEvent.click(Array.from(hours.querySelectorAll('button')).find(b => b.textContent === '09'))
    expect(onSelectHour).toHaveBeenCalledWith(new Date(2026, 9, 22, 9, 0))
    fireEvent.click(Array.from(minutes.querySelectorAll('button')).find(b => b.textContent === '30'))
    expect(onSelectMinute).toHaveBeenCalledWith(new Date(2026, 9, 22, 0, 30))
    unmount()
    // 沒有 maxDateTime、或 maxDateTime 無效時不停用任何時間
    const { unmount: u2 } = render(<TimeView value={new Date(2026, 9, 22, 23, 0)} onSelectHour={() => {}} onSelectMinute={() => {}} />)
    expect(screen.getByRole('listbox', { name: '時' }).querySelectorAll('button:disabled')).toHaveLength(0)
    u2()
    render(<TimeView value={new Date(2026, 9, 22, 23, 0)} onSelectHour={() => {}} onSelectMinute={() => {}} maxDateTime="nope" />)
    expect(screen.getByRole('listbox', { name: '時' }).querySelectorAll('button:disabled')).toHaveLength(0)
  })
})

describe('formatValue', () => {
  it('有效日期依格式輸出，無效值輸出空字串（欄位顯示空白而不是 Invalid Date）', () => {
    expect(formatValue(new Date(2026, 9, 22), 'yyyy/MM/dd')).toBe('2026/10/22')
    expect(formatValue(new Date('x'), 'yyyy/MM/dd')).toBe('')
    expect(formatValue(null, 'yyyy/MM/dd')).toBe('')
  })
})
