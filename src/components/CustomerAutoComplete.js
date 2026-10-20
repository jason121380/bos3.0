import { LoaderCircle } from 'lucide-react'
import { TextField } from 'ui/text-field'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
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

  const handleInputChange = event => {
    setOnChangeTime(new Date().getTime())
    setKeyword(event.target.value)
    const currentTimer = setInterval(() => {
      setCurrentTime(new Date().getTime())
      clearInterval(currentTimer)
    }, 600)
  }

  useEffect(() => {
    setCustomerKeyword(value)
  }, [value])
  
  useEffect(() => {
    if (currentTime - onChangeTime >= 600) {
      setCustomerKeyword(keyword)
      inputOnChange(keyword)
    }
  }, [currentTime])

  const options = idx(customers, _ => _.data.customers.customers) || []
  const filteredOption = options.filter(
    d => d.no !== '' && d.no !== null && d.no === customerKeyword
  )

  useEffect(() => {
    if (!customers.loading && keyCode === 13) {
      const data = idx(customers, _ => _.data.customers.customers)
      if (!!data && data.length > 0) {
        onChange(data[0])
      }
    }
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
                {customers.loading || orderAlready ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
})
