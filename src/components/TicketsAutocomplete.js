import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useEffect, useState } from 'react'
import { useFetchTicketsForAutocomplete } from 'hooks/useFetchTickets'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'
import compareNo from 'utils/compareNo'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />
// 沒給 value 時當成沒選（模組層常數：參數預設 [] 每次渲染都是新陣列，會讓依賴 value 的 effect 每次渲染都 setState）
const NO_VALUE = []

const TicketsAutocomplete = ({ value = NO_VALUE, onChange = () => {}, isReadOnly = false, ...rest }) => {
  const getTickets = useFetchTicketsForAutocomplete()
  const [selectValue, setSelectValue] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!getTickets.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有卡券，不讓整頁拋錯（Jason 2026/10/22 fix all）
      const data = idx(getTickets, _ => _.data.ticketsForList) || []
      const newValue = data.filter(d => value.includes(d.id))
      setSelectValue(newValue)
      setOptions(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getTickets.loading, value])

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue.toLowerCase()
    // 代號自然排序（英數代號也有效）、空代號排最後（原本 a.no - b.no 對英數代號得 NaN；Jason 2026/10/22 fix all）
    const filterOptions = [...options]
      .sort((a, b) => compareNo(a.no, b.no))
      .filter(d => {
        if (d.no && d.name) {
          const no = d.no.toLowerCase()
          const name = d.name.toLowerCase()
          return no.includes(keyWord) || name.includes(keyWord)
        }
        return false
      })
    return filterOptions
  }

  return (
    <div>
      <Autocomplete
        {...rest}
        fullWidth
        options={options}
        value={selectValue}
        autoHighlight
        disableCloseOnSelect
        closeText="close"
        freeSolo
        multiple
        forcePopupIcon
        disabled={getTickets.loading}
        onChange={(e, v) => onChange(v ? v.map(d => d.id) : [])}
        readOnly={isReadOnly}
        getOptionLabel={option => option.name}
        filterOptions={filterOptions}
        renderOption={({ key, ...props }, option, { selected }) => (
          <span style={{ fontSize: 14, padding: 6 }} {...props} key={option.id}>
            <Checkbox style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }} icon={icon} checkedIcon={checkedIcon} checked={selected} />
            {`${option.no && option.no.trim() ? `${option.no} - ` : ''}${option.name}`}
          </span>
        )}
        renderInput={params => <TextField {...params} variant="outlined" label="卡券" placeholder="選擇卡券" />}
      />
    </div>
  )
}

export default TicketsAutocomplete
