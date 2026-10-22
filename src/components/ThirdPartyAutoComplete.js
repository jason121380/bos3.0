import { TextField } from 'ui/text-field'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useEffect, Fragment, useState } from 'react'
import { Autocomplete } from 'ui/combobox'

function ThirdPartyAutoComplete(
  {
    className = '',
    onChange = () => { },
    label = '',
    value = [],
    initFirst,
    autoFocus,
    onKeyDown,
    onFocus,
    fieldProps = {},
    name,
    setThirdPartyAlready,
    disabled = false,
  },
  ref
) {
  const designerToggle = useToggle()
  const designers = useFetchTHirdPartys()
  const [options, setOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState('')
  useEffect(() => {
    if (setThirdPartyAlready !== undefined && !designers.loading) {
      setThirdPartyAlready(!designers.loading)
    }
  }, [designers.loading, setThirdPartyAlready]);
  useEffect(() => {
    if (initFirst && designers.data && !designers.loading) {
      onChange(idx(designers, _ => _.data.merchant.thirdpartyCoupons[0]))
    }
  }, [designers, initFirst, onChange])

  useEffect(() => {
    if (!designers.loading) {
      // 查詢失敗或回 null 時以空清單顯示，Autocomplete 拿到 null 會整頁壞（2026/10/22）
      setOptions(idx(designers, _ => _.data.merchant.thirdpartyCoupons) || [])
    }
  }, [designers.loading]);

  useEffect(() => {
    if (!designers.loading) {
      const selectedValue = idx(designers, _ =>
        _.data.merchant.thirdpartyCoupons.find(d => d.id === value)
      )
      setSelectedValue(selectedValue)
    }
  }, [designers.loading, value]);
  return (
    <Autocomplete
      disabled={disabled}
      open={designerToggle.open}
      onOpen={designerToggle.toggle}
      onClose={designerToggle.toggle}
      className={className}
      value={!!selectedValue ? selectedValue : null}
      options={options}
      autoHighlight
      getOptionLabel={option => !!option ? option.name : ''}
      inputValue={!!selectedValue ? selectedValue.name : ''}
      loading={designers.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      renderOption={(props, option) => <span {...props} data-testid={option.name}>{option.name}</span>}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          variant="outlined"
          inputRef={ref}
          name={name}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          {...fieldProps}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Fragment>
                {/* {designers.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default React.forwardRef(ThirdPartyAutoComplete)
