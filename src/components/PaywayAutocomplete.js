/** @jsxImportSource @emotion/react */
import { TextField, Checkbox, Autocomplete } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useEffect, useState } from 'react'
import useFetchGetPayWays from 'hooks/useFetchGetPayWays'
import idx from 'idx'
import { css } from '@emotion/react'

const styles = {
  checkbox: css({
    padding: '6px !important',
    fontSize: 14,
    '& span.Mui-checked': {
      color: 'rgb(32, 45, 80) !important'
    },
    '& span.MuiCheckbox-root': {
      padding: '3px !important'
    }
  })
}

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
        <span {...props} css={styles.checkbox}>
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