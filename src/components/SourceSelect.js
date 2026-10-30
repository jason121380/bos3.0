import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
      <NativeSelect
        inputRef={ref}
        value={value || ''}
        disabled={getReference.loading}
        onChange={onChange}
        name="source"
        // 空值對應「無」。未開 displayEmpty 時關閉的按鈕是透明空白，看起來像沒選到（打帳單「帳單來源」）
        displayEmpty
        label={label}
      >
        {emptyOption && <NativeSelectOption value=""><em>無</em></NativeSelectOption>}
        {/* 查詢失敗時 data 為 undefined：當成沒有來源，不讓整頁拋錯（Jason 2026/10/22 fix all） */}
        {(idx(getReference, _ => _.data.getCustomerReference) || []).map(data => (
          <NativeSelectOption key={data} value={data}>{data}</NativeSelectOption>
        ))}
      </NativeSelect>
    </FormControl>
  )
}

export default forwardRef(SourceSelect)