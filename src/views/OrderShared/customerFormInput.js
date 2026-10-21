import produce from 'immer'

// 新增／編輯顧客彈窗的欄位輸入處理（四個帳單頁的 AddCustomerModal 原本各一份、逐字相同，2026/10/21 合併；內容原樣搬入）。
// 送出（新增／更新顧客）的處理各頁不同，仍在各頁。

// 性別選項（另有「未知」選項由各頁畫在最前面）
export const GENDER_OPTIONS = [
  {
    value: 'MALE',
    label: '男',
  },
  {
    value: 'FEMALE',
    label: '女',
  },
]

// 一般欄位：依 input 的 name 寫回表單
export const makeFieldChange = setValues => event => {
  if (event.persist) event.persist()
  setValues(
    produce(draft => {
      draft[event.target.name] = event.target.value
    })
  )
}

// 生日：民國年最多 3 碼、月 ≤ 12、日 ≤ 31（可清空）；超出的輸入不接受
export const makeBirthdayChange = (birthdayObj, setBirthdayObj) => e => {
  switch (e.target.name) {
    case 'year':
      if (e.target.value.length <= 3) {
        setBirthdayObj({ ...birthdayObj, year: e.target.value })
      }
      break
    case 'month':
      if (parseInt(e.target.value, 10) <= 12 || e.target.value === '') {
        setBirthdayObj({ ...birthdayObj, month: e.target.value })
      }
      break
    case 'day':
      if (parseInt(e.target.value, 10) <= 31 || e.target.value === '') {
        setBirthdayObj({ ...birthdayObj, day: e.target.value })
      }
      break
    default:
      break
  }
}
