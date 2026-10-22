import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchGetCustomerReference from 'hooks/useFetchGetCustomerReference'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

export default function SourcesAutocomplete({
  className = '',
  onChange = () => { },
  value,
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const getReference = useFetchGetCustomerReference()
  return (
    <Autocomplete
      className={className}
      options={
        // 查詢失敗或回 null 時以空清單顯示，Autocomplete 拿到 null 會整頁壞（2026/10/22）
        (!getReference.loading && idx(getReference, _ => _.data.getCustomerReference)) || []
      }
      value={value}
      autoHighlight
      disableCloseOnSelect
      freeSolo
      multiple
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      renderOption={(props, option, { selected }) => (
        <span style={{ fontSize: 14, padding: 6 }} {...props}>
          <Checkbox
            className="!p-[2px]"
            style={{ color: 'rgb(var(--text))', marginRight: 4}}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
          />
          {option}
        </span>
      )}
      renderInput={params => (
        <TextField {...params} variant="outlined" label="帳單來源" />
      )}
    />
  )
}
