/** @jsxImportSource @emotion/react */
import { TextField, Checkbox, Autocomplete } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useEffect, useState } from 'react'
import { useFetchTicketsForAutocomplete } from 'hooks/useFetchTickets'
import idx from 'idx'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const TicketsAutocpmplete = ({ value, onChange = () => { }, isReadOnly = false, ...rest }) => {
  const getTickets = useFetchTicketsForAutocomplete()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getTickets.loading) {
      const data = idx(getTickets, _ => _.data.ticketsForList)
      const newValue = data.filter(d => value.includes(d.id))
      setSelectValue(newValue)
      setOptions(data)
    }
  }, [getTickets.loading, value])

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue.toLowerCase()
    const filterOptions = options.sort((a, b) => a.no - b.no).filter(d => {
      if (d.no && d.name) {
        const no = d.no.toLowerCase()
        const name = d.name.toLowerCase()
        return no.includes(keyWord) || name.includes(keyWord)
      }
    })
    return filterOptions
  }

  return (
    <div>
      <Autocomplete
        {...rest}
        fullWidth
        options={options}
        value={selectValue}
        autoHighlight
        disableCloseOnSelect
        closeText='close'
        freeSolo
        multiple
        forcePopupIcon
        disabled={getTickets.loading}
        onChange={(e, v) => onChange(v ? v.map(d => d.id) : [])}
        readOnly={isReadOnly}
        getOptionLabel={option => option.name}
        filterOptions={filterOptions}
        renderOption={({ key, ...props }, option, { selected }) => (
          <span style={{ fontSize: 14, padding: 6 }} {...props} key={option.id}>
            <Checkbox
              style={{ color: '#202D50', padding: 2, marginRight: 4 }}
              icon={icon}
              checkedIcon={checkedIcon}
              checked={selected}
            />
            {`${(option.no && option.no.trim()) ? `${option.no} - ` : ''}${option.name}`}
          </span>
        )}
        renderInput={params => (
          <TextField {...params} variant="outlined" placeholder='選擇卡券' />
        )}
      />
    </div>
  )
}

export default TicketsAutocpmplete