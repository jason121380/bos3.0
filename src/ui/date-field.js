import React from 'react'
import { format as formatDate, isMatch, parse } from 'date-fns'
import { TextField } from './text-field'
import { isValidDate } from './calendar'

// 分段式日期輸入（桌機版 DatePicker／DateTimePicker 的欄位，取代 MUI DateField；Jason 2026/10/20 拍版「日期選擇器本體自己做」）。
// 行為比照 MUI x-date-pickers 6：依 format 切成年／月／日／時／分各段，數字逐段填入（確定下一位不可能時自動跳下一段，
// 例如月份輸入 2 直接跳日、輸入 1 等第二位）、方向鍵上下調整該段、左右換段、Backspace 清除該段。
// onChange 回傳：Date（全部填完且日期存在）、Invalid Date（有段未填或日期不存在，如 2/30）、null（全部清空）；
// 與上次相同不重複呼叫——各頁 handler 依此判斷（Reservation 擋 Invalid Date、AttendanceRecords 判斷 'Invalid Date'）。

const TOKENS = {
  yyyy: { len: 4, min: 1, max: 9999, placeholder: 'YYYY' },
  MM: { len: 2, min: 1, max: 12, placeholder: 'MM' },
  dd: { len: 2, min: 1, max: 31, placeholder: 'DD' },
  HH: { len: 2, min: 0, max: 23, placeholder: 'hh' },
  mm: { len: 2, min: 0, max: 59, placeholder: 'mm' },
}

const tokenAt = (format, i) => Object.keys(TOKENS).find(t => format.startsWith(t, i))

// 'yyyy/MM/dd HH:mm' → [{ token: 'yyyy' }, { sep: '/' }, { token: 'MM' }, …]
export function parseFormat(format) {
  const parts = []
  let i = 0
  while (i < format.length) {
    const token = tokenAt(format, i)
    if (token) {
      parts.push({ token })
      i += token.length
    } else {
      const last = parts[parts.length - 1]
      if (last && last.sep !== undefined) last.sep += format[i]
      else parts.push({ sep: format[i] })
      i += 1
    }
  }
  return parts
}

const tokensOf = parts => parts.filter(p => p.token).map(p => p.token)
const valuesFromDate = (parts, date) => tokensOf(parts).map(t => (isValidDate(date) ? formatDate(date, t) : ''))

// 各段組成輸入框文字；未填的段顯示佔位（YYYY、MM…），已填的補零
function buildText(parts, values) {
  let k = 0
  return parts
    .map(p => {
      if (!p.token) return p.sep
      const v = values[k]
      k += 1
      return v === '' ? TOKENS[p.token].placeholder : String(v).padStart(TOKENS[p.token].len, '0')
    })
    .join('')
}

// 每段在輸入框文字中的起訖位置（選取該段、點擊定位用）
function sectionRanges(parts, values) {
  const out = []
  let pos = 0
  let k = 0
  parts.forEach(p => {
    if (!p.token) {
      pos += p.sep.length
      return
    }
    const v = values[k]
    const len = v === '' ? TOKENS[p.token].placeholder.length : Math.max(TOKENS[p.token].len, String(v).length)
    out.push([pos, pos + len])
    pos += len
    k += 1
  })
  return out
}

function toDate(parts, values, format) {
  if (values.every(v => v === '')) return null
  if (values.some(v => v === '')) return new Date(NaN)
  const text = buildText(parts, values)
  if (!isMatch(text, format)) return new Date(NaN)
  const date = parse(text, format, new Date())
  // 嚴格比對：2026/02/30 會被 parse 進位成 3/2，回寫不一致即視為不存在的日期
  return formatDate(date, format) === text ? date : new Date(NaN)
}

const sameValue = (a, b) => {
  if (a == null || b == null) return a == null && b == null
  if (!isValidDate(a) || !isValidDate(b)) return !isValidDate(a) && !isValidDate(b)
  return a.getTime() === b.getTime()
}

const DateField = React.forwardRef(function DateField(
  { value, onChange, format, disabled, readOnly, inputRef, onFocus, onBlur, onKeyDown, onClick, InputProps, inputProps, placeholder, ...rest },
  ref
) {
  const parts = React.useMemo(() => parseFormat(format), [format])
  const tokens = tokensOf(parts)
  const [values, setValues] = React.useState(() => valuesFromDate(parts, value))
  const [active, setActive] = React.useState(-1)
  const buffer = React.useRef('')
  const lastEmitted = React.useRef(value)
  const localInput = React.useRef(null)

  // 外部值改變（例如從月曆選取）時同步各段；若等於自己剛送出的值則不覆蓋（保留輸入到一半的狀態）
  React.useEffect(() => {
    if (sameValue(value, lastEmitted.current)) return
    lastEmitted.current = value
    setValues(valuesFromDate(parts, value))
  }, [value, parts])

  const ranges = sectionRanges(parts, values)
  const empty = values.every(v => v === '')
  const display = active === -1 && empty ? '' : buildText(parts, values)

  // 聚焦中的段落反白（同 MUI）
  React.useLayoutEffect(() => {
    const el = localInput.current
    if (el && active >= 0 && document.activeElement === el && ranges[active]) el.setSelectionRange(ranges[active][0], ranges[active][1])
  })

  const commit = next => {
    setValues(next)
    const date = toDate(parts, next, format)
    if (sameValue(date, lastEmitted.current)) return
    lastEmitted.current = date
    if (onChange) onChange(date)
  }
  const setSection = (index, text) => {
    const next = values.slice()
    next[index] = text
    commit(next)
  }

  const handleKeyDown = event => {
    if (onKeyDown) onKeyDown(event)
    if (event.defaultPrevented || readOnly || disabled) return
    const idx = active < 0 ? 0 : active
    const meta = TOKENS[tokens[idx]]
    if (/^\d$/.test(event.key)) {
      event.preventDefault()
      const query = (buffer.current + event.key).slice(-meta.len)
      const num = Number(query)
      // 超過上限：以這一位重新開始；填滿或下一位必定超過上限：跳下一段
      if (num > meta.max) {
        buffer.current = event.key
        setSection(idx, event.key)
        return
      }
      setSection(idx, query)
      if (query.length >= meta.len || num * 10 > meta.max) {
        buffer.current = ''
        if (idx < tokens.length - 1) setActive(idx + 1)
      } else buffer.current = query
      return
    }
    buffer.current = ''
    if (event.key === 'ArrowRight') setActive(Math.min(tokens.length - 1, idx + 1))
    else if (event.key === 'ArrowLeft') setActive(Math.max(0, idx - 1))
    else if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(tokens.length - 1)
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const step = event.key === 'ArrowUp' ? 1 : -1
      // 空段從「現在」開始調整（同 MUI）
      let n = values[idx] === '' ? Number(formatDate(new Date(), tokens[idx])) : Number(values[idx]) + step
      if (n > meta.max) n = meta.min
      if (n < meta.min) n = meta.max
      setSection(idx, String(n).padStart(meta.len, '0'))
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      if (values[idx] === '' && event.key === 'Backspace' && idx > 0) setActive(idx - 1)
      else setSection(idx, '')
    } else return
    event.preventDefault()
  }

  return (
    <TextField
      ref={ref}
      {...rest}
      value={display}
      placeholder={placeholder !== undefined ? placeholder : buildText(parts, tokens.map(() => ''))}
      disabled={disabled}
      inputRef={node => {
        localInput.current = node
        if (typeof inputRef === 'function') inputRef(node)
        else if (inputRef) inputRef.current = node
      }}
      InputProps={InputProps}
      onClick={onClick}
      inputProps={{
        inputMode: 'numeric',
        autoComplete: 'off',
        readOnly,
        ...inputProps,
        // 文字由各段組成，鍵盤事件自行處理；onChange 只為受控 input 的 React 要求
        onChange: () => {},
        onKeyDown: handleKeyDown,
        onPaste: event => {
          if (readOnly || disabled) return
          const text = event.clipboardData.getData('text').trim()
          if (!isMatch(text, format)) return
          event.preventDefault()
          commit(valuesFromDate(parts, parse(text, format, new Date())))
        },
        onMouseUp: event => {
          const caret = event.currentTarget.selectionStart || 0
          const i = ranges.findIndex(([s, e]) => caret >= s && caret <= e)
          setActive(i === -1 ? ranges.length - 1 : i)
          buffer.current = ''
        },
        onFocus: event => {
          if (active < 0) setActive(0)
          if (onFocus) onFocus(event)
        },
        onBlur: event => {
          setActive(-1)
          buffer.current = ''
          if (onBlur) onBlur(event)
        },
      }}
    />
  )
})

export { DateField }
export default DateField
