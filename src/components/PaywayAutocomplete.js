import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useEffect, useState } from 'react'
import useFetchGetPayWays from 'hooks/useFetchGetPayWays'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />
// 沒給 value 時當成沒選（模組層常數：參數預設 [] 每次渲染都是新陣列，會讓依賴 value 的 effect 每次渲染都 setState）
const NO_VALUE = []

const PaywayAutocomplete = ({ value = NO_VALUE, onChange = () => { }, isReadOnly = false, ...rest }) => {
  const getPayWays = useFetchGetPayWays()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getPayWays.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有付款方式，不讓整頁拋錯（Jason 2026/10/22 fix all）
      const data = idx(getPayWays, _ => _.data.payWays) || []
      const newValue = data.filter(d => value.includes(d.value))
      setSelectValue(newValue)
      setOptions(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getPayWays.loading, value])

  return (
    <Autocomplete
      {...rest}
      fullWidth
      options={options}
      value={selectValue}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      disabled={getPayWays.loading}
      onChange={(e, v) => onChange(v ? v.map(d => d.value) : [])}
      readOnly={isReadOnly}
      renderOption={(props, option, { selected }) => (
        <span {...props} className={`${props.className} !p-[6px] [font-size:14px]`}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option.label}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" label="支付方式" placeholder='選擇方式' />
      )}
    />
  )
}

export default PaywayAutocomplete