import { LoaderCircle } from 'lucide-react'
import { TextField } from 'ui/text-field'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect, useState, forwardRef } from 'react'
import { Autocomplete } from 'ui/combobox'

// 沒給 couponUsages 時的預設值放模組層：參數預設 [] 每次渲染都是新陣列，effect（依賴 couponUsages）會每次渲染都 setState 而無限重新渲染
const NO_COUPON_USAGES = []

function CustomerTicketRecordAutoCompleteForOrderCreate({
  className = '',
  onChange = () => { },
  value,
  customerId,
  couponUsages = NO_COUPON_USAGES,
  editOrderUseTicketDisabled = false,
  inputProps = {
    'data-testid': '',
  },
  ticketRecordsForOrderLazyDataV2,
  onKeyDown,
  onFocus,
  autoFocus,
  name,
  label = '卡券代號/名稱' // 沒傳時與舊版相同；打帳單改成「標籤在上」時傳入 ''
}, ref) {
  const [options, setOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState(null)

  useEffect(() => {
    if (!ticketRecordsForOrderLazyDataV2.loading && ticketRecordsForOrderLazyDataV2.data) {
      let data = cloneDeep(idx(ticketRecordsForOrderLazyDataV2, _ => _.data.ticketRecordsForOrderV2))
      const valueArr = []
      couponUsages.forEach(d => d.customerTicketId && valueArr.push(d.customerTicketId))
      data = data.filter(d => {
        const filterData = d.ticketRecordForOrder.filter(d => !valueArr.includes(d.id) || d.id === value)
        d.ticketRecordForOrder = filterData
        return filterData.length > 0
      })
      let valueIndex = ''
      data.forEach((d, index) => {
        const filterData = d.ticketRecordForOrder.filter(d => d.id === value)
        if (filterData.length > 0) valueIndex = index
      })
      setOptions(data)
      setSelectedValue(data[valueIndex])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [ticketRecordsForOrderLazyDataV2.loading, value, couponUsages])

  return (
    <Autocomplete
      disabled={editOrderUseTicketDisabled}
      className={className}
      value={selectedValue || null}
      options={options}
      autoHighlight
      getOptionLabel={option => `${option.ticketName} ${option.remark !== '' ? option.remark : ''}`}
      loading={ticketRecordsForOrderLazyDataV2.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value.ticketRecordForOrder[0]))}
      filterOptions={(currentOption, input) => {
        const keyWords = input.inputValue.toLowerCase()
        const filterOptions = currentOption.filter(d => d.ticketName.toLowerCase().includes(keyWords))
        return filterOptions
      }}
      renderOption={(props, option) => (
        <div {...props} data-testid={`${inputProps['data-testid']}-${option.ticketName}`} key={props.id}>
          {`${option.ticketName} 剩餘${option.ticketRecordForOrder.length}張 ${option.remark !== '' ? option.remark : ''}`}
        </div>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          variant="outlined"
          inputRef={ref}
          onFocus={onFocus}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          name={name}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {ticketRecordsForOrderLazyDataV2.loading ? <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default forwardRef(CustomerTicketRecordAutoCompleteForOrderCreate)
