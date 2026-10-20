import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useEffect, useState } from 'react'
import useFetchGetPayWays from 'hooks/useFetchGetPayWays'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const PaywayAutocomplete = ({ value, onChange = () => { }, isReadOnly = false, ...rest }) => {
  const getPayWays = useFetchGetPayWays()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getPayWays.loading) {
      const data = idx(getPayWays, _ => _.data.payWays)
      const newValue = data.filter(d => value.includes(d.value))
      setSelectValue(newValue)
      setOptions(data)
    }
  }, [getPayWays.loading, value])

  return (
    <Autocomplete
      {...rest}
      fullWidth
      options={options}
      value={selectValue}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      disabled={getPayWays.loading}
      onChange={(e, v) => onChange(v ? v.map(d => d.value) : [])}
      readOnly={isReadOnly}
      renderOption={(props, option, { selected }) => (
        <span {...props} className={`${props.className} !p-[6px] [font-size:14px]`}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option.label}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" placeholder='選擇方式' />
      )}
    />
  )
}

export default PaywayAutocomplete