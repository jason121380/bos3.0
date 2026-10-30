// 員工清單類下拉（顧客的偏好設計師、顧客端預約的服務設計師）：可打字搜尋的 ui/combobox 單選。
// Jason 2026/10/30 決定：員工清單改成可以打字搜尋（原本是一般清單下拉）。
// onChange 交給原本的欄位 handler（讀 event.target.name／value）：value 為員工 id，按清除鈕時為 ''（與原本選「None」相同）。
// getLabel：清單與欄位顯示的文字（預設本名；顧客端預約頁傳「有暱稱用暱稱」）；inputProps 合併到輸入框（保留原本的 data-testid）。
import React from 'react'
import { Autocomplete } from 'ui/combobox'
import { TextField } from 'ui/text-field'

const defaultLabel = user => user.name

export default function StaffCombobox({ id, label, name, value, users, onChange, disabled = false, loading = false, getLabel = defaultLabel, inputProps }) {
  const list = users || []
  const selected = list.find(user => user.id === value) || null
  const emit = option => {
    const target = { name, value: option ? option.id : '' }
    onChange({ target, currentTarget: target })
  }
  // 原本的清單下拉再選一次目前的員工也會呼叫 handler（顧客端預約頁靠它記下設計師名稱）；
  // combobox 選同一項不觸發 onChange，這裡補上：點目前已選的那一項、或在它上面按 Enter，照樣交給 handler。
  const isSelectedOption = node => !!node && node.getAttribute('aria-selected') === 'true'
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
      getOptionLabel={getLabel}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          onClick={event => {
            props.onClick(event)
            if (isSelectedOption(event.currentTarget)) emit(option)
          }}
        >
          {getLabel(option)}
        </li>
      )}
      onKeyDown={event => {
        if (event.key !== 'Enter' || !selected) return
        // 中文輸入法按 Enter 是確認選字，不是選設計師（keyCode 229 為舊瀏覽器的組字中代碼）
        if ((event.nativeEvent && event.nativeEvent.isComposing) || event.keyCode === 229) return
        const active = event.target.getAttribute('aria-activedescendant')
        if (active && isSelectedOption(document.getElementById(active))) emit(selected)
      }}
      onChange={(event, option) => emit(option)}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={inputProps ? { ...params.inputProps, ...inputProps } : params.inputProps}
          name={name}
          label={label}
          placeholder={loading ? '載入中…' : '請選擇…'}
        />
      )}
    />
  )
}
