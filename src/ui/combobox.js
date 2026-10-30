import React from 'react'
import ReactDOM from 'react-dom'
import { CompatLayer } from './compat-layer'
import { useCombobox } from 'downshift'
import { ChevronDown, X } from 'lucide-react'
import { cn, focusRing, phoneIconHit } from './utils'
import { useLayerRef } from './layer-stack'

// 自家搜尋下拉（取代 MUI Autocomplete，Jason 2026/10/20 拍版「Autocomplete 自己做」）。
// 行為（鍵盤、無障礙）交給 headless 的 downshift，外觀全部依 STYLE.md。
// 介面刻意與 MUI Autocomplete 相容：呼叫端只換 import，props（options/value/onChange(event, value, reason)/
// getOptionLabel/isOptionEqualToValue/filterOptions/renderOption/renderInput/multiple/freeSolo/open…）原樣保留。
// renderInput 回傳的 TextField 不會被渲染，只讀它的 props（label、placeholder、inputRef、onKeyDown、onFocus、
// onChange、InputProps、inputProps、error、helperText…）改用自家輸入框呈現；標籤一律放在欄位上方（STYLE §6）。
// 事件順序比照 MUI：TextField 的 onKeyDown → Autocomplete 的 onKeyDown → 內部選取（呼叫端可設 event.defaultMuiPrevented 擋下）。

const labelOf = (getOptionLabel, option) => {
  if (option === null || option === undefined) return ''
  const label = getOptionLabel(option)
  return label === null || label === undefined ? '' : String(label)
}

// 與 MUI createFilterOptions 相容（ignoreCase、ignoreAccents 以外的常用設定）
export function createFilterOptions(config = {}) {
  const { ignoreCase = true, limit, matchFrom = 'any', stringify, trim = false } = config
  return (options, { inputValue, getOptionLabel }) => {
    let input = trim ? inputValue.trim() : inputValue
    if (ignoreCase) input = input.toLowerCase()
    const filtered = !input
      ? options
      : options.filter(option => {
          let candidate = stringify ? stringify(option) : labelOf(getOptionLabel, option)
          if (ignoreCase) candidate = candidate.toLowerCase()
          return matchFrom === 'start' ? candidate.indexOf(input) === 0 : candidate.indexOf(input) > -1
        })
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered
  }
}

const defaultFilterOptions = createFilterOptions()
const defaultGetOptionLabel = option => (typeof option === 'string' ? option : option && option.label !== undefined ? option.label : option)

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

// 選單掛載點：在對話框內就掛在對話框裡（配合 Radix 焦點鎖與外點關閉），否則掛在 body。
// 正式對話框與日期浮層都是 role=dialog，不再輸出 MuiDialog-paper／MuiPopover-paper。
const findPortalHost = node => (node && node.closest('[role="dialog"]')) || document.body

function usePopupPosition(anchorRef, open) {
  const [style, setStyle] = React.useState(null)
  const [host, setHost] = React.useState(null)
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return undefined
    const anchor = anchorRef.current
    const target = findPortalHost(anchor)
    setHost(target)
    const update = () => {
      const rect = anchor.getBoundingClientRect()
      if (target === document.body) {
        setStyle({ position: 'absolute', top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width })
      } else {
        const box = target.getBoundingClientRect()
        setStyle({
          position: 'absolute',
          top: rect.bottom - box.top + target.scrollTop + 4,
          left: rect.left - box.left + target.scrollLeft,
          width: rect.width,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef])
  return { style, host }
}

const Autocomplete = React.forwardRef(function Autocomplete(
  {
    options = [],
    value: valueProp,
    defaultValue,
    onChange,
    getOptionLabel = defaultGetOptionLabel,
    isOptionEqualToValue = (option, val) => option === val,
    filterOptions = defaultFilterOptions,
    renderOption,
    renderInput,
    multiple = false,
    freeSolo = false,
    disableCloseOnSelect = false,
    autoHighlight = false,
    autoSelect = false,
    clearOnBlur = !freeSolo,
    disableClearable = false,
    disabled = false,
    readOnly = false,
    loading = false,
    loadingText = '載入中…',
    noOptionsText = '查無符合',
    open: openProp,
    onOpen,
    onClose,
    inputValue: inputValueProp,
    onInputChange,
    popupIcon,
    forcePopupIcon = 'auto',
    fullWidth = false,
    size,
    id: idProp,
    className,
    style,
    onKeyDown: rootOnKeyDown,
    onFocus: rootOnFocus,
    // 以下 MUI props 不需對應行為，接收後忽略，避免落到 DOM
    autoComplete,
    handleHomeEndKeys,
    closeText,
    variant,
    name,
    css: _css, // 沒有 emotion pragma 的檔案若傳物件，不落到 DOM
    ...rest
  },
  ref
) {
  const autoId = React.useRef(`cb-${Math.random().toString(36).slice(2, 9)}`).current
  const id = idProp || autoId
  const anchorRef = React.useRef(null)
  const inputEl = React.useRef(null)
  const fieldPropsRef = React.useRef({})
  const [dirty, setDirty] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  // 非受控（沒傳 value）時比照 MUI 自己記住選取值；81 處用法中有 17 處是非受控
  const [innerValue, setInnerValue] = React.useState(defaultValue !== undefined ? defaultValue : multiple ? [] : null)
  const value = valueProp !== undefined ? valueProp : innerValue
  const selectedList = multiple ? (Array.isArray(value) ? value : []) : []
  const isSelected = option =>
    multiple
      ? selectedList.some(v => isOptionEqualToValue(option, v))
      : value !== null && value !== undefined && isOptionEqualToValue(option, value)
  const singleSelected = !multiple && value !== null && value !== undefined ? options.find(o => isOptionEqualToValue(o, value)) ?? value : null
  const selectedLabel = multiple ? '' : labelOf(getOptionLabel, singleSelected)

  const [innerInput, setInnerInput] = React.useState(selectedLabel)
  const inputText = inputValueProp !== undefined ? inputValueProp : innerInput
  const setInputText = (text, event, reason) => {
    if (inputValueProp === undefined) setInnerInput(text)
    if (onInputChange) onInputChange(event, text, reason)
  }

  // 外部 value 改變（非輸入中）時，單選欄位顯示的文字跟著更新
  React.useEffect(() => {
    if (!multiple && !dirty && inputValueProp === undefined) setInnerInput(selectedLabel)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [selectedLabel] 變動時執行；dirty、inputValueProp、multiple 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [selectedLabel])

  const filtered = filterOptions(options, { inputValue: dirty ? inputText : '', getOptionLabel: o => labelOf(getOptionLabel, o) })
  const [innerOpen, setInnerOpen] = React.useState(false)
  const isOpen = openProp !== undefined ? !!openProp : innerOpen
  const showPopup = isOpen && !readOnly && !disabled && (filtered.length > 0 || loading || !freeSolo)

  // onChange 簽名比照 MUI：(event, value, reason, details)，details 為 { option }
  const commit = (event, next, reason, details) => {
    if (valueProp === undefined) setInnerValue(next)
    if (onChange) onChange(event, next, reason, details)
  }
  const selectOption = (event, option) => {
    if (multiple) {
      const exists = selectedList.some(v => isOptionEqualToValue(option, v))
      commit(event, exists ? selectedList.filter(v => !isOptionEqualToValue(option, v)) : [...selectedList, option], exists ? 'removeOption' : 'selectOption', { option })
      setDirty(false)
      setInputText('', event, 'reset')
    } else {
      commit(event, option, 'selectOption', { option })
      setDirty(false)
      setInputText(labelOf(getOptionLabel, option), event, 'reset')
    }
  }
  // 同 MUI：只在狀態真的改變時呼叫 onOpen／onClose。同一次點擊會同時觸發自家 onClick 與 downshift 的 InputClick，
  // 只比對渲染時的 isOpen 會放行兩次——呼叫端以 toggle 接 onOpen／onClose 時（服務項目下拉）開了又關、選項點不到。
  // 以 ref 記下最近一次要求的狀態，每次渲染再與實際狀態同步
  const requestedOpen = React.useRef(isOpen)
  requestedOpen.current = isOpen
  const setOpen = (next, event) => {
    if (next === requestedOpen.current) return
    requestedOpen.current = next
    if (openProp === undefined) setInnerOpen(next)
    if (next && onOpen) onOpen(event || { type: 'open' })
    if (!next && onClose) onClose(event || { type: 'close' }, 'blur')
  }

  // 觸控（iPhone／平板）點選項時（Jason 2026/10/20 回報 iPhone 打帳單點選項沒反應）：
  // ①downshift 在掛載時記下「元件內部元素」，選單是開啟後才以 Portal 掛上，它不認得選單；觸控的 touchend 被判為「點在外面」而送出 InputBlur 關選單
  //   （滑鼠不受影響：它另外檢查焦點仍在輸入框）；②瀏覽器在觸控時先讓輸入框失焦、才觸發選項 click，mousedown.preventDefault 擋不住。
  // 手指剛按在選單上（1 秒內）的失焦一律視為「正在點選項」：不關選單、不重設文字，讓 click 照常完成選取
  const menuPointerAt = React.useRef(0)
  const inMenuInteraction = () => Date.now() - menuPointerAt.current < 1000
  const lastEvent = React.useRef(null)
  const { getMenuProps, getInputProps, getItemProps, highlightedIndex, setHighlightedIndex } = useCombobox({
    id,
    items: filtered,
    isOpen: showPopup,
    inputValue: inputText,
    selectedItem: multiple ? null : singleSelected,
    itemToString: item => labelOf(getOptionLabel, item),
    defaultHighlightedIndex: autoHighlight ? 0 : -1,
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        // 失焦：除非 autoSelect，否則不因 highlight 自動選取（比照 MUI）
        case useCombobox.stateChangeTypes.InputBlur:
          if (inMenuInteraction()) return state
          return { ...changes, selectedItem: state.selectedItem, inputValue: state.inputValue }
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return multiple || disableCloseOnSelect ? { ...changes, isOpen: disableCloseOnSelect ? true : changes.isOpen, highlightedIndex: state.highlightedIndex, inputValue: state.inputValue } : changes
        default:
          return changes
      }
    },
    onStateChange: ({ type, selectedItem, isOpen: nextOpen }) => {
      const event = lastEvent.current
      const T = useCombobox.stateChangeTypes
      if ((type === T.ItemClick || type === T.InputKeyDownEnter) && selectedItem !== undefined && selectedItem !== null) {
        menuPointerAt.current = 0
        selectOption(event, selectedItem)
        if (!disableCloseOnSelect && !multiple) setOpen(false, event)
        if (multiple && !disableCloseOnSelect) setOpen(false, event)
      }
      if (nextOpen !== undefined && type !== T.ItemClick && type !== T.InputKeyDownEnter) setOpen(nextOpen, event)
    },
  })

  const blurTimer = React.useRef(null)
  const cancelPendingBlur = () => {
    clearTimeout(blurTimer.current)
    blurTimer.current = null
  }
  React.useEffect(() => () => clearTimeout(blurTimer.current), [])

  const getBlurOption = () => autoSelect && highlightedIndex >= 0 ? filtered[highlightedIndex] : undefined
  const finishBlur = (event, blurOption) => {
    if (inMenuInteraction()) {
      setFocused(false)
      // downshift 自己也會在失焦時關選單（它以「滑鼠按住中」判斷是否在點選單，觸控時失焦早於模擬的 mousedown，判斷不到），一併略過
      event.nativeEvent.preventDownshiftDefault = true
      return
    }
    setFocused(false)
    if (blurOption !== undefined) {
      selectOption(event, blurOption)
    } else if (freeSolo && dirty && !multiple) {
      // freeSolo：失焦時把輸入文字當作值（比照 MUI autoSelect 以外的行為，只在 clearOnBlur 為 false 時保留）
      if (clearOnBlur) setInputText(selectedLabel, event, 'reset')
    } else if (clearOnBlur || !freeSolo) {
      setInputText(multiple ? '' : selectedLabel, event, 'reset')
    }
    setDirty(false)
    setOpen(false, event)
  }

  const finishBlurRef = React.useRef(finishBlur)
  finishBlurRef.current = finishBlur

  const handleBlur = event => {
    if (inMenuInteraction()) {
      finishBlur(event)
      return
    }
    cancelPendingBlur()
    if (event.relatedTarget && event.relatedTarget !== document.body && event.relatedTarget !== document &&
        document.activeElement === document.body && inputEl.current && inputEl.current.closest('[role="dialog"]')) {
      // 滑鼠移焦時 activeElement 會短暫是 body；此時同步移除選項／圖層節點，
      // 會讓 Dialog 的 FocusScope MutationObserver 搶先聚焦容器，打斷按鈕聚焦。
      // 等下一個 task 才完成 blur，讓原生焦點先落定；同時阻止 downshift 提早關閉。
      // 僅處理窗內 body 的交接空檔；一般表單、觸控選取仍走原路徑。
      // 保留失焦當下的 autoSelect 選項，收尾讀最新欄位值，避免移焦後寫回舊值；重聚焦或卸載時取消。
      event.nativeEvent.preventDownshiftDefault = true
      const blurOption = getBlurOption()
      blurTimer.current = setTimeout(() => {
        blurTimer.current = null
        finishBlurRef.current(event, blurOption)
      }, 0)
      return
    }
    finishBlur(event, getBlurOption())
  }

  const handleKeyDown = event => {
    lastEvent.current = event
    const fp = fieldPropsRef.current
    if (fp.onKeyDown) fp.onKeyDown(event)
    if (rootOnKeyDown) rootOnKeyDown(event)
    if (event.defaultMuiPrevented) {
      event.nativeEvent.preventDownshiftDefault = true
      return
    }
    if (event.key === 'Enter' && freeSolo && highlightedIndex < 0 && dirty && inputText !== '') {
      event.nativeEvent.preventDownshiftDefault = true
      commit(event, multiple ? [...selectedList, inputText] : inputText, 'createOption', { option: inputText })
      setDirty(false)
      if (multiple) setInputText('', event, 'reset')
      setOpen(false, event)
      return
    }
    if (event.key === 'Backspace' && multiple && inputText === '' && selectedList.length > 0 && !readOnly) {
      commit(event, selectedList.slice(0, -1), 'removeOption', { option: selectedList[selectedList.length - 1] })
    }
    if (event.key === 'Escape' && !isOpen && !disableClearable && !readOnly && dirty) {
      setInputText('', event, 'clear')
    }
  }

  const clear = event => {
    event.preventDefault()
    commit(event, multiple ? [] : null, 'clear')
    setDirty(false)
    setInputText('', event, 'clear')
    if (inputEl.current) inputEl.current.focus()
  }

  // downshift 的輸入框 props（ref 同時交給呼叫端 TextField 的 inputRef）
  const downshiftInputProps = getInputProps({
    ref: node => {
      inputEl.current = node
      assignRef(fieldPropsRef.current.inputRef, node)
    },
    disabled,
    readOnly,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    onFocus: event => {
      cancelPendingBlur()
      setFocused(true)
      const fp = fieldPropsRef.current
      if (fp.onFocus) fp.onFocus(event)
    },
    onClick: event => {
      lastEvent.current = event
      if (!readOnly && !disabled) setOpen(true, event)
    },
    onChange: event => {
      lastEvent.current = event
      setDirty(true)
      setInputText(event.target.value, event, 'input')
      if (!isOpen) setOpen(true, event)
      const fp = fieldPropsRef.current
      if (fp.onChange) fp.onChange(event)
    },
  })

  const hasValue = multiple ? selectedList.length > 0 : value !== null && value !== undefined && value !== ''
  const showClear = !disableClearable && !readOnly && !disabled && hasValue && (focused || dirty)
  const showPopupIcon = forcePopupIcon === true || (forcePopupIcon === 'auto' && !freeSolo) || !!popupIcon

  const endAdornment = (
    <span className="flex shrink-0 items-center gap-0.5">
      {showClear && (
        <button type="button" tabIndex={-1} aria-label="清除" title="清除" className={cn(phoneIconHit, 'flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-hover hover:text-text', focusRing)} onMouseDown={clear}>
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
      {showPopupIcon && (
        <span
          role="presentation"
          className={cn('flex items-center justify-center text-text-tertiary', !popupIcon && 'h-6 w-6', isOpen && !popupIcon && 'rotate-180')}
          onMouseDown={event => {
            event.preventDefault()
            if (readOnly || disabled) return
            setOpen(!isOpen, event)
            if (inputEl.current) inputEl.current.focus()
          }}
        >
          {popupIcon || <ChevronDown className="h-4 w-4 transition-transform" strokeWidth={1.75} />}
        </span>
      )}
    </span>
  )

  const chips = multiple
    ? selectedList.map((item, index) => (
        <span key={`${labelOf(getOptionLabel, item)}-${index}`} className="inline-flex h-6 max-w-full items-center gap-1 rounded-full bg-surface-hover pl-2.5 pr-1 text-label font-normal text-text">
          <span className="truncate">{labelOf(getOptionLabel, item)}</span>
          {!readOnly && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={`移除 ${labelOf(getOptionLabel, item)}`}
              title={`移除 ${labelOf(getOptionLabel, item)}`}
              className={cn(phoneIconHit, 'flex h-4 w-4 items-center justify-center rounded-full text-text-tertiary hover:text-text', focusRing)}
              onMouseDown={event => {
                event.preventDefault()
                commit(event, selectedList.filter((_, i) => i !== index), 'removeOption', { option: item })
              }}
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </span>
      ))
    : null

  const params = {
    id,
    disabled,
    fullWidth: true,
    size,
    InputLabelProps: { id: `${id}-label`, htmlFor: id },
    InputProps: { ref: anchorRef, className: '', startAdornment: chips, endAdornment },
    inputProps: downshiftInputProps,
  }
  const rendered = renderInput ? renderInput(params) : null
  const fp = (rendered && rendered.props) || {}
  fieldPropsRef.current = fp
  const InputProps = fp.InputProps || params.InputProps
  // placeholder 放在 InputProps 或 inputProps 時，MUI 都會傳到輸入框（InputBase）；這裡比照，避免掉到外框 div 上而看不到
  const { ref: _anchorIgnored, className: inputPropsClassName, startAdornment, endAdornment: endNode, placeholder: rootPlaceholder, ...inputRootRest } = InputProps
  const finalInputProps = { ...(fp.inputProps || params.inputProps) }
  // 呼叫端常以 {...params.inputProps, ...額外} 覆寫；確保 downshift 的事件與 ref 不被蓋掉
  ;['ref', 'onKeyDown', 'onBlur', 'onFocus', 'onClick', 'onChange', 'value', 'id', 'aria-autocomplete', 'aria-controls', 'aria-activedescendant', 'aria-expanded', 'role', 'aria-labelledby'].forEach(key => {
    if (downshiftInputProps[key] !== undefined) finalInputProps[key] = downshiftInputProps[key]
  })

  const label = fp.label
  const error = !!fp.error
  const helperText = fp.helperText
  const small = (fp.size || size) === 'small'
  const wide = fullWidth || fp.fullWidth

  const { style: popupStyle, host } = usePopupPosition(anchorRef, showPopup)

  const menuProps = getMenuProps({}, { suppressRefError: true })
  const downshiftMenuRef = React.useRef(null)
  downshiftMenuRef.current = menuProps.ref
  const { ref: layerRef, zIndex } = useLayerRef(undefined, showPopup)
  const setMenuRef = React.useCallback(node => {
    assignRef(downshiftMenuRef.current, node)
    layerRef(node)
  }, [layerRef])
  const menu = (
    <ul
      {...menuProps}
      ref={setMenuRef}
      // 不讓點選單時輸入框失焦（避免 Radix 焦點鎖搶回焦點、選單先關閉）
      onMouseDown={event => event.preventDefault()}
      onPointerDown={() => {
        menuPointerAt.current = Date.now()
      }}
      className={cn(
        'ui-root z-[1500] m-0 max-h-80 list-none overflow-y-auto rounded-lg border border-solid border-border bg-background p-1 shadow-float',
        !showPopup && 'hidden'
      )}
      style={{ ...(popupStyle || {}), zIndex, pointerEvents: 'auto' }}
    >
      {showPopup &&
        (filtered.length === 0 ? (
          <li className="px-3 py-2 text-body text-text-tertiary">{loading ? loadingText : noOptionsText}</li>
        ) : (
          filtered.map((option, index) => {
            const selected = isSelected(option)
            const itemProps = getItemProps({ item: option, index })
            const optionProps = {
              ...itemProps,
              key: itemProps.id || `${id}-option-${index}`,
              'data-option-index': index,
              'aria-selected': selected,
              className: cn(
                'flex min-h-9 cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-body text-text',
                highlightedIndex === index && 'bg-surface-hover',
                selected && 'font-medium'
              ),
              onClick: event => {
                lastEvent.current = event
                itemProps.onClick && itemProps.onClick(event)
              },
            }
            return renderOption ? (
              <React.Fragment key={optionProps.key}>{renderOption(optionProps, option, { selected, index, inputValue: inputText })}</React.Fragment>
            ) : (
              <li {...optionProps}>{labelOf(getOptionLabel, option)}</li>
            )
          })
        ))}
    </ul>
  )

  return (
    <div
      ref={ref}
      className={cn('ui-root relative flex flex-col gap-1.5', wide ? 'w-full' : 'w-[240px] max-w-full', className)}
      style={style}
      onFocus={rootOnFocus}
      onClick={fp.onClick}
      {...rest}
    >
      {label && (
        <label htmlFor={finalInputProps.id} id={`${id}-label`} className={cn('text-label', error ? 'text-danger' : 'text-text-secondary')}>
          {label}
          {fp.required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div
        ref={node => {
          anchorRef.current = node
          assignRef(fp.ref, node)
        }}
        {...inputRootRest}
        className={cn(
          'flex w-full min-w-0 flex-wrap items-center gap-1 rounded-md border border-solid bg-background px-2.5 py-1 transition-colors',
          small ? 'min-h-8' : 'min-h-9 max-sm:min-h-10',
          error ? 'border-danger' : 'border-border-strong hover:border-border-strong-hover',
          'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
          (disabled || fp.disabled) && 'pointer-events-none bg-surface opacity-60',
          inputPropsClassName
        )}
      >
        {startAdornment}
        <input
          {...finalInputProps}
          name={fp.name || name}
          placeholder={fp.placeholder ?? finalInputProps.placeholder ?? rootPlaceholder}
          autoFocus={fp.autoFocus}
          className={cn('min-w-[60px] flex-1 border-0 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary', finalInputProps.className)}
        />
        {endNode}
      </div>
      {helperText && <p className={cn('m-0 text-caption', error ? 'text-danger' : 'text-text-tertiary')}>{helperText}</p>}
      {/* 行為登記獨立於選單，開關／重開時不重新掛載 downshift 的選單與 ref。 */}
      <CompatLayer open={showPopup} onEscapeKeyDown={event => event.preventDefault()} />
      {host ? ReactDOM.createPortal(menu, host) : null}
    </div>
  )
})

export { Autocomplete }
export default Autocomplete
