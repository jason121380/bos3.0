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
        {/* 查詢失敗時 data 為 undefined：當成沒有來源，不讓整頁拋錯（Jason 2026/10/22 fix all） */}
        {(idx(getReference, _ => _.data.getCustomerReference) || []).map(data => (
          <MenuItem key={data} value={data}>{data}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default forwardRef(SourceSelect)