import { Select, MenuItem, FormControl, InputLabel } from 'ui/form-control'
import useFetchGetCustomerReference from 'hooks/useFetchGetCustomerReference'
import { useState, useEffect, forwardRef } from 'react'
import idx from 'idx'
const SourceSelect = ({
  onChange, className = '', value, emptyOption = false,
  label = '客戶來源', ...rest
}, ref) => {
  const getReference = useFetchGetCustomerReference()

  if (getReference.loading) {
    return null
  }

  return (
    <FormControl
      {...rest}
      variant="outlined"
      className={`${className} w-full`}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        inputRef={ref}
        value={value || ''}
        disabled={getReference.loading}
        label={label}
        onChange={onChange}
        name="source"
      >
        {emptyOption && <MenuItem value=""><em>無</em></MenuItem>}
        {getReference.data.getCustomerReference.map(data => (
          <MenuItem key={data} value={data}>{data}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default forwardRef(SourceSelect)