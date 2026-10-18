/** @jsxImportSource @emotion/react */
import { TextField, Checkbox, Autocomplete } from '@mui/material'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useEffect, useState } from 'react'
import { useFetchGetMainEventsForAutocomplete } from 'hooks/useFetchGetMainEvent'
import idx from 'idx'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const MainEventAutocomplete = ({ value = [], onChange = () => { }, isReadOnly = false, ...rest }) => {
  const getMainEvents= useFetchGetMainEventsForAutocomplete()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getMainEvents.loading) {
      const data = idx(getMainEvents, _ => _.data.mainEvents)
      const newValue = data.filter(d => value.includes(d.id))
      setSelectValue(newValue)
      setOptions(data)
    }
  }, [getMainEvents.loading, value])

  return (
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
      disabled={getMainEvents.loading}
      onChange={(e, v) => onChange(v ? v.map(d => d.id) : [])}
      readOnly={isReadOnly}
      getOptionLabel={option => option.nameDefault}
      renderOption={({ key, ...props }, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 0 }} {...props} key={option.id}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option.nameDefault}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" placeholder='選擇活動' />
      )}
    />
  )
}

export default MainEventAutocomplete