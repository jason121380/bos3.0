import React from 'react'
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  format as formatDate,
  getDate,
  getDaysInMonth,
  getYear,
  setDate,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  setYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import zhTW from 'date-fns/locale/zh-TW'
import { cn } from './utils'

// 自家月曆視圖（日期選擇器本體，Jason 2026/10/20 拍版「日期選擇器本體自己做」）：日格、年份格、時間清單。
// 規則比照原 MUI x-date-pickers（zh-TW）：一週從星期一開始（date-fns zh-TW weekStartsOn=1）、星期標題取單字（一二三四五六日）、
// 月份標題「十月 2026」（LLLL yyyy）、年份範圍 1900–2099；minDate／maxDate／disableFuture／maxDateTime 之外的日期停用。
// 外觀依橋接主題原本的 MuiPickers 覆寫：日格 36px 圓形、hover surface-hover、選取 accent 底白字、今天 accent 細框。

export const LOCALE = zhTW
const fmt = (date, pattern) => formatDate(date, pattern, { locale: zhTW })

export const isValidDate = d => d instanceof Date && !Number.isNaN(d.getTime())

// 換年份並保留月、日、時間；日超過該年該月天數時夾到月底（2/29 換到平年為 2/28，不溢位成 3/1；Jason 2026/10/22 fix all）
const setYearClamped = (date, year) => {
  const firstOfMonth = setYear(setDate(date, 1), year)
  return setDate(firstOfMonth, Math.min(getDate(date), getDaysInMonth(firstOfMonth)))
}

// 日期是否超出限制（以「日」為單位比較；maxDateTime 另以時間比較）
export function isDayDisabled(day, { minDate, maxDate, disableFuture, disablePast, maxDateTime, minDateTime, shouldDisableDate } = {}) {
  const today = new Date()
  const min = minDate != null ? new Date(minDate) : minDateTime != null ? new Date(minDateTime) : null
  const max = maxDate != null ? new Date(maxDate) : maxDateTime != null ? new Date(maxDateTime) : null
  if (min && isValidDate(min) && endOfDay(day) < startOfDay(min)) return true
  if (max && isValidDate(max) && startOfDay(day) > endOfDay(max)) return true
  if (disableFuture && startOfDay(day) > endOfDay(today)) return true
  if (disablePast && endOfDay(day) < startOfDay(today)) return true
  if (shouldDisableDate && shouldDisableDate(day)) return true
  return false
}

const NavButton = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40"
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d={children} />
    </svg>
  </button>
)

const PREV = 'M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'
const NEXT = 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'
const DROP = 'M7 10l5 5 5-5z'

// 日格：6 週固定高度；方向鍵移動焦點、Enter／空白鍵選取、PageUp／PageDown 換月
export function DayView({ value, month, onMonthChange, onSelect, onOpenYear, constraints, autoFocus }) {
  const gridRef = React.useRef(null)
  const selected = isValidDate(value) ? value : null
  const today = new Date()
  const [focusDay, setFocusDay] = React.useState(() => selected || (isSameMonth(today, month) ? today : startOfMonth(month)))
  // 換月（按鈕或年份）時，焦點日移到該月：優先選取日，否則該月 1 日
  React.useEffect(() => {
    setFocusDay(prev => (isSameMonth(prev, month) ? prev : selected && isSameMonth(selected, month) ? selected : startOfMonth(month)))
  }, [month, selected])
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const weekdays = days.slice(0, 7).map(d => fmt(d, 'EEEEEE').charAt(0))
  const prevDisabled = constraints.minDate != null && endOfMonth(addMonths(month, -1)) < startOfDay(new Date(constraints.minDate))
  const nextDisabled =
    (constraints.maxDate != null && startOfMonth(addMonths(month, 1)) > endOfDay(new Date(constraints.maxDate))) ||
    (constraints.disableFuture && startOfMonth(addMonths(month, 1)) > today)

  const moveFocus = next => {
    setFocusDay(next)
    if (!isSameMonth(next, month)) onMonthChange(startOfMonth(next))
    requestAnimationFrame(() => {
      const el = gridRef.current && gridRef.current.querySelector(`[data-day="${fmt(next, 'yyyy-MM-dd')}"]`)
      if (el) el.focus()
    })
  }
  const onKeyDown = event => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (map[event.key] !== undefined) moveFocus(addDays(focusDay, map[event.key]))
    else if (event.key === 'PageUp') moveFocus(addMonths(focusDay, -1))
    else if (event.key === 'PageDown') moveFocus(addMonths(focusDay, 1))
    else return
    event.preventDefault()
  }

  return (
    <div className="flex w-[320px] max-w-full flex-col">
      <div className="flex h-12 items-center justify-between pl-6 pr-3">
        <button type="button" onClick={onOpenYear} aria-label="選擇年份" className="flex items-center gap-1 rounded-md px-1 text-label font-semibold text-text hover:bg-surface-hover">
          <span aria-live="polite">{fmt(month, 'LLLL yyyy')}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-text-secondary" aria-hidden="true">
            <path d={DROP} />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          <NavButton label="上個月" onClick={() => onMonthChange(addMonths(month, -1))} disabled={prevDisabled}>
            {PREV}
          </NavButton>
          <NavButton label="下個月" onClick={() => onMonthChange(addMonths(month, 1))} disabled={nextDisabled}>
            {NEXT}
          </NavButton>
        </div>
      </div>
      <div role="grid" aria-label={fmt(month, 'LLLL yyyy')} ref={gridRef} onKeyDown={onKeyDown} className="px-3 pb-2">
        <div role="row" className="flex justify-center">
          {weekdays.map((w, i) => (
            <span key={i} role="columnheader" className="flex h-10 w-9 items-center justify-center text-caption text-text-tertiary">
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, w) => (
          <div key={w} role="row" className="my-0.5 flex justify-center">
            {days.slice(w * 7, w * 7 + 7).map(day => {
              const outside = !isSameMonth(day, month)
              if (outside) return <span key={day.getTime()} className="mx-0.5 h-9 w-9" />
              const disabled = isDayDisabled(day, constraints)
              const isSelected = selected && isSameDay(day, selected)
              const isToday = isSameDay(day, today)
              const focusable = isSameDay(day, focusDay)
              return (
                <button
                  key={day.getTime()}
                  type="button"
                  role="gridcell"
                  data-day={fmt(day, 'yyyy-MM-dd')}
                  aria-selected={isSelected || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={fmt(day, 'yyyy年M月d日')}
                  tabIndex={focusable ? 0 : -1}
                  autoFocus={autoFocus && focusable}
                  disabled={disabled}
                  onClick={() => onSelect(day)}
                  onFocus={() => setFocusDay(day)}
                  className={cn(
                    'mx-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-solid border-transparent text-[13px] text-text transition-colors',
                    'hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isToday && !isSelected && 'border-accent',
                    isSelected && 'bg-accent font-semibold text-white hover:bg-accent',
                    disabled && 'pointer-events-none text-text-tertiary opacity-60'
                  )}
                >
                  {fmt(day, 'd')}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// 年份格：1900–2099（受 minDate／maxDate／disableFuture 限制），開啟時捲到目前年份
export function YearView({ value, month, onSelect, constraints }) {
  const listRef = React.useRef(null)
  const current = getYear(isValidDate(value) ? value : month)
  const thisYear = getYear(new Date())
  const minYear = constraints.minDate != null ? getYear(new Date(constraints.minDate)) : 1900
  const maxYear = constraints.maxDate != null ? getYear(new Date(constraints.maxDate)) : constraints.disableFuture ? thisYear : 2099
  const years = []
  for (let y = 1900; y <= 2099; y += 1) years.push(y)
  React.useEffect(() => {
    const el = listRef.current && listRef.current.querySelector('[aria-checked="true"]')
    if (el) {
      if (el.scrollIntoView) el.scrollIntoView({ block: 'center' })
      el.focus()
    }
  }, [])
  return (
    <div ref={listRef} role="radiogroup" aria-label="選擇年份" className="grid max-h-[304px] w-[320px] max-w-full grid-cols-4 gap-y-2 overflow-y-auto px-2 py-2">
      {years.map(y => {
        const disabled = y < minYear || y > maxYear
        const isSelected = y === current
        return (
          <button
            key={y}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(setYearClamped(isValidDate(value) ? value : month, y))}
            className={cn(
              'mx-auto h-9 w-[72px] rounded-lg text-body text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              y === thisYear && !isSelected && 'font-semibold',
              isSelected && 'bg-accent font-semibold text-white hover:bg-accent',
              disabled && 'pointer-events-none opacity-40'
            )}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}

// 月份格：一月～十二月（受 minDate／maxDate／disableFuture 限制）
export function MonthView({ value, month, onSelect, onOpenYear, constraints }) {
  const base = isValidDate(value) ? value : month
  const year = getYear(base)
  const now = new Date()
  return (
    <div className="flex w-[320px] max-w-full flex-col">
      {/* 同 MUI：月份視圖上方也有「十月 2026 ▾」標頭，點擊切換到年份 */}
      <div className="flex h-12 items-center pl-6 pr-3">
        <button type="button" onClick={onOpenYear} aria-label="選擇年份" className="flex items-center gap-1 rounded-md px-1 text-label font-semibold text-text hover:bg-surface-hover">
          <span aria-live="polite">{fmt(base, 'LLLL yyyy')}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-text-secondary" aria-hidden="true">
            <path d={DROP} />
          </svg>
        </button>
      </div>
    <div role="radiogroup" aria-label={`${year} 年月份`} className="grid grid-cols-3 gap-y-2 px-2 py-3">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(year, m, 1)
        const last = endOfMonth(first)
        const min = constraints.minDate != null ? new Date(constraints.minDate) : null
        const max = constraints.maxDate != null ? new Date(constraints.maxDate) : null
        const disabled = (min && last < startOfDay(min)) || (max && first > endOfDay(max)) || (constraints.disableFuture && first > now)
        const isSelected = isValidDate(value) && value.getMonth() === m && getYear(value) === year
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(new Date(year, m, Math.min(base.getDate(), endOfMonth(first).getDate()), base.getHours(), base.getMinutes()))}
            className={cn(
              'mx-auto h-9 w-[84px] rounded-lg text-body text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isSelected && 'bg-accent font-semibold text-white hover:bg-accent',
              disabled && 'pointer-events-none opacity-40'
            )}
          >
            {fmt(first, 'LLL')}
          </button>
        )
      })}
    </div>
    </div>
  )
}

// 時間：時、分兩欄清單（24 小時制），超過 maxDateTime 的時間停用
export function TimeView({ value, onSelectHour, onSelectMinute, maxDateTime, minutesStep = 1 }) {
  const base = isValidDate(value) ? value : startOfDay(new Date())
  const max = maxDateTime != null ? new Date(maxDateTime) : null
  const hourRef = React.useRef(null)
  const minuteRef = React.useRef(null)
  React.useEffect(() => {
    ;[hourRef, minuteRef].forEach(ref => {
      const el = ref.current && ref.current.querySelector('[aria-selected="true"]')
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' })
    })
  }, [])
  const column = (ref, label, items, selectedValue, toDate, onPick) => (
    <ul ref={ref} role="listbox" aria-label={label} className="m-0 max-h-[280px] w-[72px] list-none overflow-y-auto p-1">
      {items.map(n => {
        const candidate = toDate(n)
        const disabled = max && isValidDate(max) && candidate > max
        const isSelected = n === selectedValue
        return (
          <li key={n} role="option" aria-selected={isSelected}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(candidate)}
              className={cn(
                'my-0.5 h-9 w-full rounded-lg text-[14px] text-text tabular-nums hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isSelected && 'bg-accent font-semibold text-white hover:bg-accent',
                disabled && 'pointer-events-none opacity-40'
              )}
            >
              {String(n).padStart(2, '0')}
            </button>
          </li>
        )
      })}
    </ul>
  )
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: Math.ceil(60 / minutesStep) }, (_, i) => i * minutesStep)
  return (
    <div className="flex flex-1 justify-center gap-2 px-2 py-2">
      {column(hourRef, '時', hours, base.getHours(), h => setHours(base, h), onSelectHour)}
      {column(minuteRef, '分', minutes, base.getMinutes(), m => setMinutes(base, m), onSelectMinute)}
    </div>
  )
}

export const formatValue = (date, pattern) => (isValidDate(date) ? fmt(date, pattern) : '')
