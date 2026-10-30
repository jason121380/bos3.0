import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useFetchGetAttributionLazy } from 'hooks/useFetchGetAttribution'
import { useEffect, useState } from 'react'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

const BelongAutocomplete = ({ value, onChange = () => { }, fetchData = false, optionData, isloading, isReadOnly = false, ...rest }) => {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const [attributions, setAttributions] = useState([])
  const [getAttributionLazy, attributionLazyData] = useFetchGetAttributionLazy()

  useEffect(() => {
    if (fetchData) {
      getAttributionLazy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  // 呼叫端給選項時跟著 optionData 更新（原本只在掛載時讀一次，選項較晚到時下拉仍是空的；Jason 2026/10/22 fix all）
  useEffect(() => {
    if (!fetchData) {
      setAttributions(optionData)
    }
  }, [fetchData, optionData])

  useEffect(() => {
    if (!attributionLazyData.loading && attributionLazyData.data) {
      const data = idx(attributionLazyData, _ => _.data.getAttribution).map(({ name }) => name)
      setAttributions(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [attributionLazyData.loading, attributionLazyData.data])

  return (
    <Autocomplete
      {...rest}
      fullWidth
      options={attributions}
      value={value}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      disabled={attributionLazyData.loading || isloading}
      onChange={(e, v) => onChange(v)}
      readOnly={isReadOnly}
      renderOption={(props, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 6 }} {...props}>
          <Checkbox
            style={{ color: 'rgb(var(--text))', padding: 2, marginRight: 4 }}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" label="歸屬" />
      )}
    />
  )
}

export default BelongAutocomplete