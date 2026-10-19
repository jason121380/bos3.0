/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import useFetchTickets from 'hooks/useFetchTickets'
import useToggle from 'hooks/useToggle'
import idx from 'idx'

import React, { useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'

function TicketAutoComplete(
  {
    className = {},
    onChange = () => {},
    label = '',
    orderId,

    onFieldChange = () => {},
    value,
    onKeyDown,
    onFocus,
    autoFocus,
    name,
    tabIndex,
    inputProps = {},
    isTicketSellingEditable,
    setCouponAlready,
    isLaunched,
    getData
  },
  ref
) {
  const ticketsToggle = useToggle()

  const [ticketsKeyword, setTicketsKeyword] = React.useState('')
  const tickets = useFetchTickets({
    isLaunched: isLaunched,
    orderId: orderId
  })

  useEffect(() => {
    if (setCouponAlready !== undefined && !tickets.loading) {
      setCouponAlready(!tickets.loading)
    }
  }, [tickets.loading]);
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
  }, [options])

  useEffect(() => {
    if (selectedValue?.no === ticketsKeyword || selectedValue?.name.includes(ticketsKeyword)) {
      setTicketsKeyword(selectedValue.name)
    }
  }, [selectedValue])

  useEffect(() => {
    if (value.length === 0) {
      setTicketsKeyword('')
    }
  }, [value])
  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    const newOptions = options.sort((a, b) => {
      return a.no - b.no
    })
    let filterByNo = []
    let filterByName = []
    if (keyWord !== '' && keyWord.trim() !== '') {
      filterByNo = newOptions.filter((data, index) => {
        if (data.no !== '' && data.no !== null && data.no.toLowerCase() === keyWord.toLowerCase()) {
          return data.no.toLowerCase() === keyWord.toLowerCase()
        }
      })
      filterByName = newOptions.filter((data, index) => {
        if (
          data.name !== '' &&
          data.name !== null &&
          data.name.toLowerCase().includes(keyWord.toLowerCase())
        ) {
          return data.name.toLowerCase().includes(keyWord.toLowerCase())
        }
      })

      const filterOptions = [...filterByNo, ...filterByName]
      // 挑出重複的選項
      const filteredArray = filterOptions.filter((data, index) => {
        return filterOptions.indexOf(data) === index
      })
      return filteredArray
    } else {
      return options
    }
  }
  return (
    <Autocomplete
      options={options}
      disabled={isTicketSellingEditable === undefined ? false : !isTicketSellingEditable}
      open={ticketsToggle.open}
      onOpen={ticketsToggle.toggle}
      onClose={ticketsToggle.toggle}
      css={className}
      value={selectedValue}
      autoHighlight
      filterOptions={filterOptions}
      getOptionLabel={option =>
        ticketsKeyword === option.no
          ? option.no === '' ? `${option.name}${option.no !== '' ? `(${option.no})` : ''}` : option.no
          : `${option.name}${option.no !== '' ? `(${option.no})` : ''}`
      }
      loading={tickets.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value) || { id: '' })}
      renderOption={(props, option) => (
        <span {...props} data-testid={`${inputProps['data-testid']}-${option.name}`}>{option.name}</span>
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
