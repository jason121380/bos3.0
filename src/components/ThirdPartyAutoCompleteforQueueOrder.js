import { TextField } from 'ui/text-field'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, {useEffect, Fragment, useState} from 'react'
import { Autocomplete } from 'ui/combobox'

function ThirdPartyAutoCompleteforQueueOrder(
  {
    className = '',
    onChange = () => {},
    label = '',
    value = [],
    initFirst,
    autoFocus,
    onKeyDown,
    onFocus,
    inputProps,
    name,
    setThirdPartyAlready,
    disabled = false,
  },
  ref
) {
  const designerToggle = useToggle()
  const designers = useFetchTHirdPartys()
  const [options, setOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState(null)
  useEffect(() => {
    if (setThirdPartyAlready !== undefined && !designers.loading) {
      setThirdPartyAlready(!designers.loading)
    }
  }, [designers.loading])
  
  useEffect(() => {
    if (initFirst && designers.data && !designers.loading) {
      onChange(designers.data.merchant.thirdpartyCoupons[0])
    }
  }, [designers, initFirst, onChange])

  useEffect(() => {
    if (!designers.loading) {
      setOptions(idx(designers, _ => _.data.merchant.thirdpartyCoupons))
    }
  }, [designers.loading]);

  useEffect(() => {
    if (!designers.loading) {
      const tmpSelectValue = idx(designers, _ =>
        _.data.merchant.thirdpartyCoupons.find(d => d.id === value))
      setSelectedValue(tmpSelectValue)
    }
  }, [designers.loading, value])
  return (
    <Autocomplete
      disabled={disabled}
      open={designerToggle.open}
      onOpen={designerToggle.toggle}
      onClose={designerToggle.toggle}
      className={className}
      value={selectedValue || null}
      options={options}
      autoHighlight
      getOptionLabel={option =>  !!option ? option.name : ''}
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
          InputProps={{
            ...params.InputProps,
            ...inputProps,
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

export default React.forwardRef(ThirdPartyAutoCompleteforQueueOrder)
