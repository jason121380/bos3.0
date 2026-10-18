/** @jsxImportSource @emotion/react */
import { TextField, Checkbox, Autocomplete } from '@mui/material'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useFetchGetAttributionLazy } from 'hooks/useFetchGetAttribution'
import { useEffect, useState } from 'react'
import idx from 'idx'

const BelongAutocomplete = ({ value, onChange = () => { }, fetchData = false, optionData, isloading, isReadOnly = false, ...rest }) => {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const [attributions, setAttributions] = useState([])
  const [getAttributionLazy, attributionLazyData] = useFetchGetAttributionLazy()

  useEffect(() => {
    if (fetchData) {
      getAttributionLazy()
    } else {
      setAttributions(optionData)
    }
  }, [])

  useEffect(() => {
    if (!attributionLazyData.loading && attributionLazyData.data) {
      const data = idx(attributionLazyData, _ => _.data.getAttribution).map(({ name }) => name)
      setAttributions(data)
    }
  }, [attributionLazyData.loading, attributionLazyData.data])

  return (
    <Autocomplete
      {...rest}
      fullWidth
      options={attributions}
      value={value}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      disabled={attributionLazyData.loading || isloading}
      onChange={(e, v) => onChange(v)}
      readOnly={isReadOnly}
      renderOption={(props, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 6 }} {...props}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" label="歸屬" />
      )}
    />
  )
}

export default BelongAutocomplete