import React from 'react'
import { startOfDay, startOfMinute, startOfMonth } from 'date-fns'
import { Field } from 'ui/input'
import { cn } from './utils'
import { TextField, InputAdornment } from './text-field'
import { Dialog, DialogContent } from './dialog'
import { Popover, PopoverAnchor, PopoverContent } from './popover'
import { DateField } from './date-field'
import { DayView, MonthView, YearView, TimeView, formatValue, isDayDisabled, isValidDate } from './calendar'

// 日期選擇器（Jason 2026/10/20 拍版「日期選擇器本體自己做」，取代 @mui/x-date-pickers；設計見 docs/redesign/DATE_PICKER.md）。
// 對外介面與原 facade 相同：DatePicker／MobileDatePicker／DateTimePicker／MobileDateTimePicker，props 與 MUI 6 相容。
//
// 白話說明（行為逐條比照 MUI，各頁的 handler 依賴這些細節）：
// 1. 存值原樣：onChange 回傳 Date／null（桌機輸入未完成時為 Invalid Date），不轉字串或時間戳；value 接受 Date、時間戳、null、""。
// 2. 可否打字照舊：Mobile* 欄位唯讀、點開彈層選；DatePicker／DateTimePicker 在滑鼠裝置（pointer: fine）是分段輸入＋月曆鈕，
//    觸控裝置自動變成 Mobile 版（同 MUI 的 desktopModeMediaQuery）。
// 3. 值的生命週期同 MUI：在彈層中每次選取立即 onChange；「取消」還原到開啟時的值、「確認」呼叫 onAccept；
//    點背景／Esc 保留目前的值並關閉；closeOnSelect（手機預設 false、桌機預設 true）選完最後一個視圖即確認並關閉。
// 4. 視圖順序依 views（預設：日期 ['year','day']、日期時間 ['year','day','hours','minutes']），openTo 未給時從 day 開始（views 沒有 day 則從第一個），
//    選完非最後視圖就跳下一個（例如 ['month','year'] 選月後跳年）。
// 5. 驗證同 MUI：onError(reason, value)，reason 為 invalidDate／minDate／maxDate／disableFuture／disablePast／maxTime，錯誤改變時才呼叫；
//    欄位在有錯誤時顯示紅框（slotProps.textField.error 可覆寫）。
// 6. 自訂欄位 slots.field 收到 value（Date）、format、onClick（開啟）、onKeyDown、readOnly、disabled、inputRef、inputProps 等（同 MUI）。
// 手機對話框置中顯示（ui-dialog-centered），不使用底部面板（Jason 2026/10/20）。
// 7. label 放在欄位上方（ui/input 的 Field）；slotProps.textField 的 variant 一律忽略（全站同一種外框）。
// 8. className（含 emotion css prop）落在最外層 .ui-date-picker（同 MUI 落在 TextField 根節點），欄位撐滿它；有 className 時不套預設寬 220px，
//    以免與頁面的 width 同權重而先後不定（打帳單四兄弟靠 width:100% 撐滿欄位）。sx 不支援，頁面改用 className。

const DEFAULT_ACTIONS_TEXT = { cancel: '取消', ok: '確認' }

const toDate = value => {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return value
  return new Date(value)
}

const sameDate = (a, b) => {
  if (a == null || b == null) return a == null && b == null
  if (!isValidDate(a) || !isValidDate(b)) return !isValidDate(a) && !isValidDate(b)
  return a.getTime() === b.getTime()
}

// 同 MUI validateDate／validateDateTime 的錯誤代碼
function validate(value, props, withTime) {
  if (value == null) return null
  if (!isValidDate(value)) return 'invalidDate'
  const { minDate, maxDate, minDateTime, maxDateTime, disableFuture, disablePast, shouldDisableDate } = props
  const now = new Date()
  if (disablePast && startOfDay(value) < startOfDay(now)) return 'disablePast'
  if (disableFuture && startOfDay(value) > startOfDay(now)) return 'disableFuture'
  if (shouldDisableDate && shouldDisableDate(value)) return 'shouldDisableDate'
  if (minDate != null && startOfDay(value) < startOfDay(toDate(minDate))) return 'minDate'
  if (maxDate != null && startOfDay(value) > startOfDay(toDate(maxDate))) return 'maxDate'
  if (withTime && maxDateTime != null) {
    const max = toDate(maxDateTime)
    if (startOfDay(value) > startOfDay(max)) return 'maxDate'
    if (value > max) return 'maxTime'
  }
  if (withTime && minDateTime != null) {
    const min = toDate(minDateTime)
    if (startOfDay(value) < startOfDay(min)) return 'minDate'
    if (value < min) return 'minTime'
  }
  return null
}

const useDesktopMode = () => {
  const query = '(pointer: fine)'
  // 同 MUI：環境不支援 matchMedia（如測試）時為手機版
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  const [desktop, setDesktop] = React.useState(get)
  React.useEffect(() => {
    if (!window.matchMedia) return undefined
    const mql = window.matchMedia(query)
    const onChange = () => setDesktop(mql.matches)
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange)
    return () => (mql.removeEventListener ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange))
  }, [])
  return desktop
}

const CALENDAR_ICON =
  'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z'

function createPicker({ displayName, withTime, mobileOnly }) {
  const Picker = React.forwardRef(function Picker(props, ref) {
    const {
      label,
      required,
      fieldClassName,
      value: valueProp,
      onChange,
      onAccept,
      onClose,
      onOpen,
      open: openProp,
      format = withTime ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd',
      views: viewsProp,
      openTo,
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      disableFuture,
      disablePast,
      shouldDisableDate,
      disabled = false,
      readOnly,
      closeOnSelect: closeOnSelectProp,
      localeText = {},
      slots = {},
      slotProps = {},
      onError,
      inputRef,
      autoFocus,
      className,
      name,
      minutesStep,
      onKeyDown,
      onFocus,
      // MUI 專用、無對應或已不支援的 props：接收後忽略，不落到 DOM
      sx,
      orientation,
      showToolbar,
      ampm,
      timezone,
      reduceAnimations,
      desktopModeMediaQuery,
      dayOfWeekFormatter,
      displayWeekNumber,
      loading,
      renderLoading,
      ...rest
    } = props
    // 其餘 props 只保留 data-*／aria-*／id 落到外層；MUI 專用或拼錯的 props（如既有的 ocaleText）不輸出成 DOM 屬性
    const domProps = Object.fromEntries(Object.entries(rest).filter(([k]) => k === 'id' || k.startsWith('data-') || k.startsWith('aria-')))
    const desktopMedia = useDesktopMode()
    const desktop = !mobileOnly && desktopMedia
    const closeOnSelect = closeOnSelectProp !== undefined ? closeOnSelectProp : desktop
    const value = toDate(valueProp)
    const views = viewsProp || (withTime ? ['year', 'day', 'hours', 'minutes'] : ['year', 'day'])
    const firstView = openTo || (views.includes('day') ? 'day' : views[0])
    const constraints = { minDate: minDate != null ? toDate(minDate) : minDate, maxDate: maxDate != null ? toDate(maxDate) : maxDate, disableFuture, disablePast, shouldDisableDate, maxDateTime, minDateTime }

    const [openState, setOpenState] = React.useState(false)
    const open = openProp !== undefined ? openProp : openState
    const [view, setView] = React.useState(firstView)
    const [month, setMonth] = React.useState(() => startOfMonth(isValidDate(value) ? value : new Date()))
    const committed = React.useRef(value) // 開啟時的值：「取消」還原目標
    const published = React.useRef(value) // 最後一次送出的值
    const rootRef = React.useRef(null)
    const paperRef = React.useRef(null)
    const openerRef = React.useRef(null)
    const wasOpen = React.useRef(false)
    // 受控 open 也可能由外層開啟；必須在日視圖掛載、移動焦點前記住原焦點。
    if (open && !wasOpen.current) openerRef.current = document.activeElement
    wasOpen.current = open

    React.useEffect(() => {
      published.current = value
    })

    const publish = next => {
      if (sameDate(next, published.current)) return
      published.current = next
      if (onChange) onChange(next)
    }
    const openPicker = () => {
      if (disabled || readOnly) return
      committed.current = value
      setView(firstView)
      setMonth(startOfMonth(isValidDate(value) ? value : new Date()))
      if (openProp === undefined) setOpenState(true)
      if (onOpen) onOpen()
    }
    const closePicker = () => {
      if (openProp === undefined) setOpenState(false)
      if (onClose) onClose()
    }
    const accept = next => {
      committed.current = next
      if (onAccept) onAccept(next)
      closePicker()
    }
    const cancel = () => {
      publish(committed.current)
      closePicker()
    }
    const dismiss = () => closePicker()

    // 視圖選取：非最後一個視圖跳下一個（partial），最後一個為 finish
    const reference = () => {
      if (isValidDate(value)) return value
      return withTime ? startOfMinute(new Date()) : startOfDay(new Date())
    }
    const selectFrom = (fromView, next) => {
      publish(next)
      const order = views.filter(v => v !== 'minutes' || withTime)
      const i = order.indexOf(fromView)
      const isLast = i === order.length - 1 || i === -1
      if (!isLast) {
        const nextView = order[i + 1]
        setView(nextView === 'minutes' ? 'hours' : nextView)
        if (isValidDate(next)) setMonth(startOfMonth(next))
        return
      }
      if (closeOnSelect) accept(next)
    }
    const mergeDay = day => {
      const base = reference()
      const d = new Date(day)
      d.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds())
      return d
    }

    // 驗證錯誤：改變時才呼叫 onError（同 MUI useValidation）
    const error = validate(value, constraints, withTime)
    const lastError = React.useRef(null)
    React.useEffect(() => {
      if (error === lastError.current) return
      lastError.current = error
      if (onError) onError(error, value)
    })

    // 桌機彈層：點外面或 Esc 關閉（保留目前值）
    React.useEffect(() => {
      if (!open || !desktop) return undefined
      const onDown = event => {
        if (paperRef.current && paperRef.current.contains(event.target)) return
        if (rootRef.current && rootRef.current.contains(event.target)) return
        dismiss()
      }
      document.addEventListener('mousedown', onDown)
      return () => {
        document.removeEventListener('mousedown', onDown)
      }
    })

    // ---- 欄位 ----
    const rawTextField = slotProps.textField
    const textField = typeof rawTextField === 'function' ? rawTextField({}) : rawTextField || {}
    const { variant: _variant, error: tfError, InputProps: tfInputProps, inputProps: tfInputProps2, ...tfRest } = textField
    const ariaLabel = isValidDate(value) ? `選擇日期，目前為 ${formatValue(value, 'yyyy/MM/dd')}` : '選擇日期'
    // 頁面傳入的按鍵處理：props.onKeyDown 與 slotProps.textField.onKeyDown 都呼叫（原本 textField 的被欄位自己的處理蓋掉，
    // 會員卡到期日等頁面的「Enter 跳下一欄」失效、Enter 一律開月曆）
    const callerKeyDown = event => {
      if (onKeyDown) onKeyDown(event)
      if (tfRest.onKeyDown) tfRest.onKeyDown(event)
    }
    // 頁面先處理。頁面有傳按鍵處理時 Enter 歸頁面（各頁都用 Enter 跳下一欄，多數沒有 preventDefault；原本會跳欄又同時開月曆，
    // Codex review PR #265），不開月曆；空白鍵、或頁面沒傳處理時維持 Enter／空白鍵開月曆；頁面 preventDefault 的按鍵一律不開
    const hasCallerKeyDown = Boolean(onKeyDown || tfRest.onKeyDown)
    const openOnKey = event => {
      callerKeyDown(event)
      if (event.defaultPrevented) return
      if (event.key === 'Enter' && hasCallerKeyDown) return
      if (!desktop && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        openPicker()
      }
    }

    let field
    if (slots.field) {
      const CustomField = slots.field
      field = (
        <CustomField
          value={value}
          format={format}
          onClick={disabled || readOnly ? undefined : openPicker}
          onKeyDown={openOnKey}
          readOnly={readOnly !== undefined ? readOnly : true}
          disabled={disabled}
          inputRef={inputRef}
          inputProps={{ 'aria-label': ariaLabel }}
          name={name}
          className={className}
          {...(slotProps.field || {})}
        />
      )
    } else if (desktop) {
      field = (
        <DateField
          {...tfRest}
          name={name}
          value={value}
          onChange={publish}
          format={format}
          disabled={disabled}
          readOnly={readOnly}
          inputRef={inputRef}
          autoFocus={autoFocus}
          error={tfError !== undefined ? tfError : !!error}
          onKeyDown={callerKeyDown}
          fullWidth
          className={tfRest.className}
          inputProps={tfInputProps2}
          InputProps={{
            ...tfInputProps,
            endAdornment: (
              <InputAdornment position="end">
                <button
                  type="button"
                  aria-label={ariaLabel}
                  disabled={disabled || readOnly}
                  onClick={openPicker}
                  className="-mr-1 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-hover disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                    <path d={CALENDAR_ICON} />
                  </svg>
                </button>
              </InputAdornment>
            ),
          }}
        />
      )
    } else {
      field = (
        <TextField
          {...tfRest}
          name={name}
          value={formatValue(value, format)}
          placeholder={tfRest.placeholder !== undefined ? tfRest.placeholder : format.replace('yyyy', 'YYYY').replace('dd', 'DD').replace('HH', 'hh')}
          disabled={disabled}
          inputRef={inputRef}
          autoFocus={autoFocus}
          error={tfError !== undefined ? tfError : !!error}
          fullWidth
          className={tfRest.className}
          InputProps={{ ...tfInputProps, readOnly: true }}
          inputProps={{ 'aria-label': ariaLabel, ...tfInputProps2, onChange: () => {}, className: cn('cursor-pointer', tfInputProps2 && tfInputProps2.className) }}
          onClick={openPicker}
          onKeyDown={openOnKey}
        />
      )
    }

    // ---- 彈層內容 ----
    const toolbar = slotProps.toolbar || {}
    const title = localeText.toolbarTitle || (withTime ? '選擇日期與時間' : '選擇日期')
    // 未指定時：有日期視圖顯示「10月20日」（含時間加 HH:mm）；只有年月視圖時同 MUI 顯示「十月 2026」
    const toolbarFormat = toolbar.toolbarFormat || (!views.includes('day') ? (views.includes('month') ? 'LLLL yyyy' : 'yyyy') : withTime ? 'M月d日 HH:mm' : 'M月d日')
    const panel = (
      <div className="flex">
        {view === 'year' && <YearView value={value} month={month} constraints={constraints} onSelect={next => selectFrom('year', next)} />}
        {view === 'month' && (
          <MonthView value={value} month={month} constraints={constraints} onOpenYear={() => views.includes('year') && setView('year')} onSelect={next => selectFrom('month', next)} />
        )}
        {view === 'day' && (
          <DayView
            value={value}
            month={month}
            onMonthChange={setMonth}
            constraints={constraints}
            autoFocus
            onOpenYear={() => views.includes('year') && setView('year')}
            onSelect={day => selectFrom('day', mergeDay(day))}
          />
        )}
        {(view === 'hours' || view === 'minutes') && (
          <TimeView value={isValidDate(value) ? value : reference()} maxDateTime={maxDateTime} minutesStep={minutesStep} onSelectHour={next => publish(next)} onSelectMinute={next => selectFrom('minutes', next)} />
        )}
      </div>
    )

    let overlay = null
    if (open && desktop) {
      overlay = (
        <Popover open onOpenChange={next => { if (!next) dismiss() }}>
          <PopoverAnchor virtualRef={rootRef} />
          <PopoverContent ref={paperRef} role="dialog" aria-label={title} side="bottom" align="start" sideOffset={4}
            // 保留原 mousedown 外點規則：欄位、焦點移出及 pointerdown 均不額外關閉。
            onInteractOutside={event => event.preventDefault()}
            onOpenAutoFocus={event => event.preventDefault()}
            onEscapeKeyDown={event => { event.preventDefault(); dismiss() }}
            onCloseAutoFocus={event => {
              event.preventDefault()
              const target = openerRef.current
              // 外點已聚焦其他欄位時不搶回焦點；Esc／選值後則回到開啟欄位。
              if (target && target.isConnected && document.activeElement === document.body) target.focus()
            }}
            className="ui-root overflow-hidden rounded-xl border border-solid border-border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            {panel}
          </PopoverContent>
        </Popover>
      )
    } else if (open) {
      overlay = (
        <Dialog open onOpenChange={next => { if (!next) dismiss() }}>
          <DialogContent hideClose aria-label={title} aria-labelledby={undefined} aria-describedby={undefined}
            onOpenAutoFocus={event => { if (view === 'day') event.preventDefault() }}
            onCloseAutoFocus={event => {
              event.preventDefault()
              if (openerRef.current && openerRef.current.isConnected) openerRef.current.focus()
            }}
            className="ui-dialog-centered min-w-[320px] w-auto max-w-[calc(100vw-32px)] max-sm:inset-x-auto max-sm:bottom-auto max-sm:left-1/2 max-sm:top-1/2 max-sm:w-auto max-sm:max-w-[calc(100vw-32px)] max-sm:-translate-x-1/2 max-sm:-translate-y-1/2 max-sm:rounded-2xl max-sm:border max-sm:pb-0 max-sm:data-[state=open]:slide-in-from-bottom-0 max-sm:data-[state=closed]:slide-out-to-bottom-0 [&>div[aria-hidden]]:hidden">
            {!toolbar.hidden && (
              <div className="flex flex-col gap-1 border-0 border-b border-solid border-border px-6 pb-4 pt-4">
                <span className="text-caption font-medium text-text-secondary">{title}</span>
                <span className="text-[26px] font-normal leading-9 text-text">{isValidDate(value) ? formatValue(value, toolbarFormat) : '––'}</span>
              </div>
            )}
            {panel}
            <div className="flex justify-end gap-2 px-4 pb-3 pt-1">
              <button type="button" onClick={cancel} className="h-9 rounded-full px-4 text-label font-medium text-accent hover:bg-surface-hover">
                {DEFAULT_ACTIONS_TEXT.cancel}
              </button>
              <button type="button" onClick={() => accept(published.current)} className="h-9 rounded-full px-4 text-label font-medium text-accent hover:bg-surface-hover">
                {DEFAULT_ACTIONS_TEXT.ok}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    const body = (
      <div
        ref={node => {
          rootRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn('ui-root ui-date-picker inline-flex min-w-0 max-w-full flex-col', slots.field ? null : textField.fullWidth ? 'w-full' : !className && 'w-[220px]', slots.field ? null : className)}
        onFocus={onFocus}
        {...domProps}
      >
        {field}
        {overlay}
      </div>
    )
    const htmlFor = textField && textField.id
    return label ? (
      <Field label={label} htmlFor={htmlFor} required={required} className={fieldClassName}>
        {body}
      </Field>
    ) : (
      body
    )
  })
  Picker.displayName = displayName
  return Picker
}

export const DatePicker = createPicker({ displayName: 'DatePicker', withTime: false, mobileOnly: false })
export const MobileDatePicker = createPicker({ displayName: 'MobileDatePicker', withTime: false, mobileOnly: true })
export const DateTimePicker = createPicker({ displayName: 'DateTimePicker', withTime: true, mobileOnly: false })
export const MobileDateTimePicker = createPicker({ displayName: 'MobileDateTimePicker', withTime: true, mobileOnly: true })
