import { LoaderCircle } from 'lucide-react'
import { TextField } from 'ui/text-field'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete } from 'ui/combobox'

export default React.forwardRef(function CustomerAutoComplete(
  {
    className,
    onChange = () => {},
    inputOnChange = () => {},
    onKeyDown = () => {},
    label = '',
    value = '',
    inputProps,
    fieldProps,
    onFocus,
    name,
    autoFocus,
    withoutCustomer = false,
    designerRef = null,
    setCustomerAlready,
    orderAlready = false,
    bill = [],
  },
  ref
) {
  const customerToggle = useToggle()
  const [customerKeyword, setCustomerKeyword] = useState('')
  const [keyCode, setKeyCode] = useState(null)

  let customers = useFetchCustomersInAutoComplete({
    keyword: customerKeyword,
    customerId: value,
  })
  if (value === undefined && customerKeyword === '') {
    customers = []
  }

  if (setCustomerAlready !== undefined) {
    setCustomerAlready(!customers.loading)
  }
  const [onChangeTime, setOnChangeTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [keyword, setKeyword] = useState('')

  // 打字停 600ms 才查詢：每次輸入記下自己的時間戳，計時到期時回報「是哪一次輸入的計時」，
  // 只有最後一次輸入的計時到期才查（之後又打字就不查，等新的計時）
  const debounceTimer = useRef(null)
  const handleInputChange = event => {
    const changedAt = new Date().getTime()
    setOnChangeTime(changedAt)
    setKeyword(event.target.value)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null
      setCurrentTime(changedAt)
    }, 600)
  }

  // 卸載時取消計時，避免關閉彈窗後仍 setState
  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  useEffect(() => {
    setCustomerKeyword(value)
  }, [value])
  // 原本比對牆鐘差 currentTime - onChangeTime >= 600：計時器可能比 Date 早 1ms 觸發（實測差 599），該次查詢整個不送出，
  // 櫃檯打完電話／編號會找不到人（2026/10/22，Jason「fix all」）。改為比對時間戳是否為最後一次輸入
  useEffect(() => {
    if (currentTime !== 0 && currentTime === onChangeTime) {
      setCustomerKeyword(keyword)
      inputOnChange(keyword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [currentTime] 變動時執行；inputOnChange、keyword、onChangeTime 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [currentTime])

  const options = idx(customers, _ => _.data.customers.customers) || []
  const filteredOption = options.filter(d => d.no !== '' && d.no !== null && d.no === customerKeyword)

  useEffect(() => {
    if (!customers.loading && keyCode === 13) {
      const data = idx(customers, _ => _.data.customers.customers)
      if (!!data && data.length > 0) {
        onChange(data[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [customers.loading] 變動時執行；customers、keyCode、onChange 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [customers.loading])

  const handleKeyDown = e => {
    if (e.keyCode === 13) {
      if (designerRef !== null) {
        designerRef.current.focus()
      }
      setKeyCode(e.keyCode)
    } else {
      setKeyCode(null)
    }
  }

  const selectedValue =
    idx(customers, _ =>
      _.data.customers.customers.find(
        d =>
          d.id === value ||
          (d.cellphone !== '' && keyCode === 13 && d.cellphone === customerKeyword) ||
          (d.no !== '' && keyCode === 13 && d.no === customerKeyword)
      )
    ) || null
  if (withoutCustomer) {
    value = null
  }
  return (
    <Autocomplete
      freeSolo
      onKeyDown={e => handleKeyDown(e)}
      open={customerToggle.open}
      onOpen={customerToggle.toggle}
      onClose={customerToggle.toggle}
      className={className}
      style={{ width: '15rem' }}
      value={selectedValue}
      options={filteredOption.length > 0 ? filteredOption : options}
      autoHighlight
      disabled={withoutCustomer || orderAlready}
      getOptionLabel={option =>
        option.cellphone === customerKeyword || selectedValue !== null
          ? `${option.name}/${option.cellphone}${option.no === null ? '' : `/${option.no}`}`
          : customerKeyword
      }
      loading={customers.loading}
      onChange={(_event, value) =>
        onChange(
          idx(
            value,
            _ =>
              value || {
                id: '',
              }
          )
        )
      }
      renderOption={(props, option) => (
        <span {...props} key={option.id} data-testid={option.name}>
          {option.name} / {option.cellphone}
          {option.no === null ? '' : ` / ${option.no}`}
        </span>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          {...fieldProps}
          fullWidth
          inputRef={ref}
          name={name}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          onChange={handleInputChange}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {customers.loading || orderAlready ? <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
})
