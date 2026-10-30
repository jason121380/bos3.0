// 員工清單類下拉（顧客的偏好設計師）：可打字搜尋的 ui/combobox 單選。
// Jason 2026/10/30 決定：員工清單改成可以打字搜尋（原本是一般清單下拉）。
// onChange 交給原本的欄位 handler（讀 event.target.name／value）：value 為員工 id，按清除鈕時為 ''（與原本選「None」相同）。
import React from 'react'
import { Autocomplete } from 'ui/combobox'
import { TextField } from 'ui/text-field'

export default function StaffCombobox({ id, label, name, value, users, onChange, disabled = false, loading = false }) {
  const list = users || []
  const selected = list.find(user => user.id === value) || null
  return (
    <Autocomplete
      id={id}
      fullWidth
      autoHighlight
      options={list}
      value={selected}
      disabled={disabled}
      loading={loading}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      getOptionLabel={option => (option && option.name) || ''}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.name}
        </li>
      )}
      onChange={(event, option) => {
        const target = { name, value: option ? option.id : '' }
        onChange({ target, currentTarget: target })
      }}
      renderInput={params => <TextField {...params} name={name} label={label} placeholder={loading ? '載入中…' : '請選擇…'} />}
    />
  )
}
