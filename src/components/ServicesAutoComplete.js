import { TextField } from 'ui/text-field'
import { useFetchServicesForAutoComplete } from 'hooks/useFetchServices'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { Fragment, forwardRef, useState, useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'

function ServicesAutoComplete(
  {
    className = '',
    orderId,
    onChange = () => {},
    onFieldChange = () => {},
    label = '',
    value,
    autoFocus,
    onFocus,
    onKeyDown,
    tabIndex,
    name,
    inputProps,
    setServiceAlready,
    getData
  },
  ref
) {
  const servicesToggle = useToggle()
  const [servicesKeyword, setServicesKeyword] = useState('')

  const services = useFetchServicesForAutoComplete({
    orderId,
  })
  const handleFieldChange = event => {
    idx(event, _ => {
      setServicesKeyword(_.target.value)
      onFieldChange()
    })
  }
  
  useEffect(() => {
    if (setServiceAlready !== undefined && !services.loading) {
      setServiceAlready(!services.loading)
    }
  }, [services.loading])

  const options = idx(services, _ => _.data.services.data) || []
  const selectedValue = idx(services, _ => _.data.services.data.find(d => d.id === value)) || null

  useEffect(() => {
    if (options.length > 0) getData && getData(options)
  }, [options])

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
      // 顯示代號讓同名同價的服務分得出來；key 用 id，避免 MUI 預設用標籤當 key 時出現重複 key
      renderOption={(props, option) => (
        <span {...props} key={option.id} data-testid={option.no}>{`${option.name}${option.no ? `(${option.no})` : ''} - ${option.price}`}</span>
      )}
      // 沒有選項、載入中時 MUI 的彈出層顯示英文，這裡改成中文
      noOptionsText="查無符合的服務"
      loadingText="載入中…"
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
export default forwardRef(ServicesAutoComplete)
