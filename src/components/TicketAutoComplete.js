import { TextField } from 'ui/text-field'
import useFetchTickets from 'hooks/useFetchTickets'
import useToggle from 'hooks/useToggle'
import idx from 'idx'

import React, { useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'
import compareNo from 'utils/compareNo'

function TicketAutoComplete(
  {
    className = '',
    onChange = () => {},
    label = '',
    orderId,

    onFieldChange = () => {},
    value = '', // 沒給時當成沒選（原本直接讀 value.length 而拋錯；Jason 2026/10/22 fix all）
    onKeyDown,
    onFocus,
    autoFocus,
    name,
    tabIndex,
    inputProps = {},
    isTicketSellingEditable,
    setCouponAlready,
    isLaunched,
    getData,
  },
  ref
) {
  const ticketsToggle = useToggle()

  const [ticketsKeyword, setTicketsKeyword] = React.useState('')
  const tickets = useFetchTickets({
    isLaunched: isLaunched,
    orderId: orderId,
  })

  useEffect(() => {
    if (setCouponAlready !== undefined && !tickets.loading) {
      setCouponAlready(!tickets.loading)
    }
  }, [tickets.loading, setCouponAlready])
  const handleFieldChange = event => {
    idx(event, _ => {
      setTicketsKeyword(_.target.value)
      onFieldChange()
    })
  }
  const options = idx(tickets, _ => _.data.tickets) || []
  const selectedValue = idx(tickets, _ => _.data.tickets.find(d => d.id === value)) || null
  // const selectedValue =
  //   idx(tickets, _ => _.data.tickets.find(d => d.id === value || d.no === ticketsKeyword)) || null
  // React.useEffect(() => {
  //   const val =
  //     idx(tickets, _ =>
  //       _.data.tickets.find(d => d.no !== '' && d.no !== null && d.no === ticketsKeyword)
  //     ) || null
  //   onChange(val)
  // }, [selectedValue])

  useEffect(() => {
    if (options.length > 0) getData && getData(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（getData）；只在 [options] 變動時呼叫，補上會每次 render 重跑
  }, [options])

  useEffect(() => {
    if (selectedValue?.no === ticketsKeyword || selectedValue?.name.includes(ticketsKeyword)) {
      setTicketsKeyword(selectedValue.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [selectedValue] 變動時執行；ticketsKeyword 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [selectedValue])

  useEffect(() => {
    if (value.length === 0) {
      setTicketsKeyword('')
    }
  }, [value])
  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    // 代號自然排序（英數代號也有效）、空代號排最後（原本 a.no - b.no 對英數代號得 NaN、空代號當 0 排最前；Jason 2026/10/22 fix all）
    const newOptions = [...options].sort((a, b) => compareNo(a.no, b.no))
    let filterByNo = []
    let filterByName = []
    if (keyWord !== '' && keyWord.trim() !== '') {
      filterByNo = newOptions.filter((data, index) => {
        if (data.no !== '' && data.no !== null && data.no.toLowerCase() === keyWord.toLowerCase()) {
          return data.no.toLowerCase() === keyWord.toLowerCase()
        }
        return false
      })
      filterByName = newOptions.filter((data, index) => {
        if (data.name !== '' && data.name !== null && data.name.toLowerCase().includes(keyWord.toLowerCase())) {
          return data.name.toLowerCase().includes(keyWord.toLowerCase())
        }
        return false
      })

      const filterOptions = [...filterByNo, ...filterByName]
      // 挑出重複的選項
      const filteredArray = filterOptions.filter((data, index) => {
        return filterOptions.indexOf(data) === index
      })
      return filteredArray
    } else {
      return newOptions
    }
  }
  return (
    <Autocomplete
      options={options}
      disabled={isTicketSellingEditable === undefined ? false : !isTicketSellingEditable}
      open={ticketsToggle.open}
      onOpen={ticketsToggle.toggle}
      onClose={ticketsToggle.toggle}
      className={className}
      value={selectedValue}
      autoHighlight
      filterOptions={filterOptions}
      // 沒有代號（空字串或 null）時只顯示名稱（原本只排除空字串，null 顯示成「名稱(null)」；比照 ServicesAutoComplete，Jason 2026/10/22 fix all）
      getOptionLabel={option =>
        ticketsKeyword === option.no
          ? option.no === ''
            ? `${option.name}${option.no ? `(${option.no})` : ''}`
            : option.no
          : `${option.name}${option.no ? `(${option.no})` : ''}`
      }
      loading={tickets.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value) || { id: '' })}
      renderOption={(props, option) => (
        <span {...props} data-testid={`${inputProps['data-testid']}-${option.name}`}>
          {option.name}
        </span>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          // onChange={event => setTicketsKeyword(idx(event, _ => _.target.value))}
          onChange={handleFieldChange}
          variant="outlined"
          inputRef={ref}
          onKeyDown={onKeyDown}
          name={name}
          onFocus={onFocus}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {/* {tickets.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default React.forwardRef(TicketAutoComplete)
