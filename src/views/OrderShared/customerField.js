// 帳單頁首「顧客」欄位的共用片段（四個帳單頁的 Head 原本各一份、逐字相同，2026/10/21 合併；內容原樣搬入）。

// 新增／編輯顧客彈窗的空白表單。店家 id 在每次呼叫時從 localStorage 讀取（與合併前每次寫出物件時讀取相同）
export const emptyCustomerForm = () => ({
  customerId: '',
  category: '',
  name: '',
  cellphone: '',
  birthday: {
    year: '',
    month: '',
    day: '',
  },
  OfficialBrandMerchantId: localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null,
  gender: 'MALE',
  no: '',
  nickName: '',
  PreferDesignerId: '',
  email: '',
  address: '',
  lineId: '',
  remark: '',
})

// 只輸入手機就按「新增顧客」時，先建立顧客送出的 input（addCustomer 的 variables）
export const quickAddCustomerInput = customerCellphone => ({
  OfficialBrandMerchantId: localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null,
  gender: 'MALE',
  cellphone: customerCellphone,
  birthday: {
    year: '',
    month: '',
    day: '',
  },
  name: '',
  category: '',
})

// 顧客自動完成的選項（帳單詳細／掛單詳細／重新開單；打帳單的顯示寫法不同，沒有共用）
// determines the filtered options to be rendered on search：輸入的手機不在清單時多一個「新增 "…"」選項
export const customerFilterOptions = filter => (options, params) => {
  const filtered = filter(options, params)
  const { inputValue } = params
  const isExisting = options.some(option => inputValue === option.cellphone)
  if (inputValue !== '' && !isExisting) {
    filtered.push({
      inputValue,
      cellphone: `新增 "${inputValue}"`,
    })
  }
  return filtered
}

// It's used to fill the input
export const getCustomerOptionLabel = option => {
  // Value selected with enter, right from the input
  if (typeof option === 'string') {
    return option
  }
  // Add "xxx" option created dynamically
  if (option.inputValue) {
    return option.inputValue
  }
  // Regular option
  return option.name === undefined || option.no === undefined
    ? option.cellphone
    : option.name + '/' + option.cellphone + '/' + option.no
}

// Render the option, use getOptionLabel by default
export const renderCustomerOption = ({ key, ...props }, option) => {
  return (
    <li key={option.id || option.cellphone} {...props}>
      {option.name === undefined || option.no === undefined
        ? option.cellphone
        : option.name + '/' + option.cellphone + '/' + option.no}
    </li>
  )
}
