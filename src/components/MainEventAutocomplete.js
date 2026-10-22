import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useEffect, useState } from 'react'
import { useFetchGetMainEventsForAutocomplete } from 'hooks/useFetchGetMainEvent'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />
// 沒給 value 時的預設值放模組層：參數預設 [] 每次渲染都是新陣列，effect（依賴 value）會每次渲染都 setState 而無限重新渲染
const NO_VALUE = []

const MainEventAutocomplete = ({ value = NO_VALUE, onChange = () => { }, isReadOnly = false, ...rest }) => {
  const getMainEvents= useFetchGetMainEventsForAutocomplete()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getMainEvents.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有活動，不讓整頁拋錯（Jason 2026/10/22 fix all）
      const data = idx(getMainEvents, _ => _.data.mainEvents) || []
      const newValue = data.filter(d => value.includes(d.id))
      setSelectValue(newValue)
      setOptions(data)
    }
  }, [getMainEvents.loading, value])

  return (
    <Autocomplete
      {...rest}
      fullWidth
      options={options}
      value={selectValue}
      autoHighlight
      disableCloseOnSelect
      closeText='close'
      freeSolo
      multiple
      forcePopupIcon
      disabled={getMainEvents.loading}
      onChange={(e, v) => onChange(v ? v.map(d => d.id) : [])}
      readOnly={isReadOnly}
      getOptionLabel={option => option.nameDefault}
      renderOption={({ key, ...props }, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 0 }} {...props} key={option.id}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option.nameDefault}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" placeholder='選擇活動' />
      )}
    />
  )
}

export default MainEventAutocomplete