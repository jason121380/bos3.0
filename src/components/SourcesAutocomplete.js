/** @jsxImportSource @emotion/react */
import { Checkbox, TextField, Autocomplete } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useFetchGetCustomerReference from 'hooks/useFetchGetCustomerReference'
import idx from 'idx'
import { css } from '@emotion/react'

export default function SourcesAutocomplete({
  className = {},
  onChange = () => { },
  value,
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const getReference = useFetchGetCustomerReference()
  return (
    <Autocomplete
      css={className}
      options={
        !getReference.loading ?
          idx(getReference, _ => _.data.getCustomerReference) : []
      }
      value={value}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      renderOption={(props, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 6 }} {...props}>
          <Checkbox
            css={css({ padding: '2px !important' })}
            style={{ color: 'rgb(var(--text))', marginRight: 4}}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" label="訂單來源" />
      )}
    />
  )
}
