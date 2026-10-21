import { TextField } from 'ui/text-field'
import useFetchServiecAndTicketList from 'hooks/useFetchServiecAndTicketList'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { Fragment, forwardRef, useState, useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'

function ServicesIncludesTicketsAutoComplete(
  {
    // 跨組契約：className 為 Tailwind 字串，直通到 ui/combobox 根節點（其內以 cn 合併預設 class）
    className = '',
    onChange = () => {},
    label = '',
    value,
    autoFocus,
    onFocus,
    onKeyDown,
    tabIndex,
    name,
    inputProps,
    setServiceAlready,
  },
  ref
) {
  const servicesToggle = useToggle()
  const [servicesKeyword, setServicesKeyword] = useState('')

  const services = useFetchServiecAndTicketList()
  const handleFieldChange = event => {
    idx(event, _ => {
      setServicesKeyword(_.target.value)
    })
  }
  
  useEffect(() => {
    if (setServiceAlready !== undefined && !services.loading) {
      setServiceAlready(!services.loading)
    }
  }, [services.loading])

  const options = idx(services, _ => _.data.getServiecAndTicketList) || []
  const selectedValue = idx(services, _ => _.data.getServiecAndTicketList.find(d => d.id === value)) || null
  
  useEffect(() => {
    if (selectedValue?.no === servicesKeyword || selectedValue?.name.includes(servicesKeyword)) {
      setServicesKeyword(selectedValue.name)
    }
  }, [selectedValue])

  useEffect(() => {
    if (Array.isArray(value) && value.length === 0) {
      setServicesKeyword('')
    }
  }, [value])

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    const newOptions = [...options].sort((a, b) => {
      return a.no - b.no
    })
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
        if (
          data.name !== '' &&
          data.name !== null &&
          data.name.toLowerCase().includes(keyWord.toLowerCase())
        ) {
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
      open={servicesToggle.open}
      onOpen={servicesToggle.toggle}
      onClose={servicesToggle.toggle}
      className={className}
      value={selectedValue}
      options={options}
      autoHighlight
      filterOptions={filterOptions}
      getOptionLabel={option => 
        servicesKeyword === option.no
          ? option.no === '' ? `${option.name}${option.no !== '' ? `(${option.no})` : ''}` : option.no
          : `${option.name}${option.no !== '' ? `(${option.no})` : ''}`
      }
      loading={services.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      renderOption={(props, option) => (
        <span {...props} data-testid={option.no}>{`${option.name} - ${option.price}`}</span>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          onChange={handleFieldChange}
          variant="outlined"
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          inputRef={ref}
          tabIndex={tabIndex}
          name={name}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <Fragment>
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
        />
      )}
    />
  )
}
export default forwardRef(ServicesIncludesTicketsAutoComplete)
