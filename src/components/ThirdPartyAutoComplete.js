import { TextField } from 'ui/text-field'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useEffect, Fragment, useState, memo } from 'react'
import { Autocomplete } from 'ui/combobox'

// 標籤函式放在模組層（身分固定），ui/combobox 才能沿用篩選結果（效能修正 B，內容不變）
const getOptionLabel = option => (!!option ? option.name : '')

function ThirdPartyAutoComplete(
  {
    className = '',
    onChange = () => {},
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
  }, [designers.loading, setThirdPartyAlready])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designers.loading])

  useEffect(() => {
    if (!designers.loading) {
      const selectedValue = idx(designers, _ => _.data.merchant.thirdpartyCoupons.find(d => d.id === value))
      setSelectedValue(selectedValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designers.loading, value])
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
      getOptionLabel={getOptionLabel}
      inputValue={!!selectedValue ? selectedValue.name : ''}
      loading={designers.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      renderOption={(props, option) => (
        <span {...props} data-testid={option.name}>
          {option.name}
        </span>
      )}
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

// memo：打帳單整頁重畫時，props 沒變的第三方卡券下拉不重畫（效能修正 B）
export default memo(React.forwardRef(ThirdPartyAutoComplete))
