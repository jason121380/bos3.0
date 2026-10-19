import React from 'react'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { MobileDatePicker as MuiMobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { MobileDateTimePicker as MuiMobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import { Field } from 'ui/input'
import { MuiScope } from 'ui/mui-theme'

// 月曆 facade（第一階段，設計見 docs/redesign/DATE_PICKER.md §六）
//
// 彈層外觀由 ui/mui-theme 的 MuiPickers* 覆寫統一處理（深淺色隨 MuiScope 切換），不在此逐頁寫樣式。
// 頂欄跟隨主題：background 底＋text 字色＋底部 border，不要大面主題藍；主題色只用在選取日等小面積。
// 注意：頂欄覆寫必須能壓過後載入的舊全域 CSS（initialize.scss 的藍底白字），細節見 mui-theme.js 頂欄註解。
//
// 白話說明：
// 1. 這一層只換「外觀」，裡面仍然是 @mui/x-date-pickers 6.19.4 的同名元件。
//    我們刻意不取代 MUI 的 field（輸入框）元件：桌機版 DatePicker／DateTimePicker 的輸入框是
//    「分段式」鍵盤輸入（年、月、日各一段，方向鍵與數字鍵會逐段處理），自己寫一個 <input>
//    會破壞打字行為與 onError 協定。輸入框的視覺（outlined、36px、border-strong、focus accent）
//    由 ui/mui-theme 的橋接主題提供，所以整個元件包在 MuiScope 內。
// 2. 存值原樣：onChange 一律是 MUI 回傳的 Date／null（輸入未完成時可能是 Invalid Date），
//    value 也原樣接受時間戳、Date、null、""。facade 不轉型、不加 getTime()。
// 3. Mobile 版本來就是唯讀（欄位 readOnly 預設 true），只能點開彈層選，facade 不改變這點；
//    元件種類由呼叫端決定，facade 不會偷偷把 Mobile 換成 Desktop（否則會改變可否打字）。
// 4. label 不傳給 MUI picker（避免浮動標籤），改由 ui/input 的 Field 放在欄位上方；沒有 label 時直接渲染 picker。
// 5. slotProps／slots 透傳：呼叫端的 slotProps 完整保留，只有 textField 會補上 variant: 'outlined'
//    （呼叫端若傳 variant 一律以 outlined 覆蓋，讓整站輸入框外觀一致；fullWidth／helperText／
//    onKeyDown／onFocus 等其他 textField props 照舊合併）。slotProps.textField 若是函式（MUI 允許依
//    ownerState 回傳），就先呼叫再合併。呼叫端自訂 slots.field 時 facade 不介入。
// 6. Field 自帶 ui-root；彈層（Popper／Dialog）在 Portal 內，由橋接主題處理外觀。

function withOutlined(textField) {
  if (typeof textField === 'function') {
    return ownerState => ({ ...textField(ownerState), variant: 'outlined' })
  }
  return { ...textField, variant: 'outlined' }
}

function createDatePicker(Picker, displayName) {
  const Wrapped = React.forwardRef(({ label, required, fieldClassName, slotProps, ...props }, ref) => {
    const textField = slotProps && slotProps.textField
    const picker = (
      <Picker
        ref={ref}
        {...props}
        slotProps={{ ...slotProps, textField: withOutlined(textField) }}
      />
    )
    const htmlFor = textField && typeof textField === 'object' ? textField.id : undefined
    return (
      <MuiScope>
        {label ? (
          <Field label={label} htmlFor={htmlFor} required={required} className={fieldClassName}>
            {picker}
          </Field>
        ) : (
          picker
        )}
      </MuiScope>
    )
  })
  Wrapped.displayName = displayName
  return Wrapped
}

export const DatePicker = createDatePicker(MuiDatePicker, 'DatePicker')
export const MobileDatePicker = createDatePicker(MuiMobileDatePicker, 'MobileDatePicker')
export const DateTimePicker = createDatePicker(MuiDateTimePicker, 'DateTimePicker')
export const MobileDateTimePicker = createDatePicker(MuiMobileDateTimePicker, 'MobileDateTimePicker')
