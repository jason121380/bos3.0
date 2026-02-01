/** @jsxImportSource @emotion/react */
import { Autocomplete, TextField } from '@mui/material'
import useFetchMerchantPayWays from 'hooks/useFetchMerchantPayWays'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { forwardRef, memo, Fragment, useEffect } from 'react'
import compose from 'utils/compose'

function PaymentAutoComplete(
  {
    className,
    onChange = () => {},
    label = '',
    value,
    name,
    autoFocus,
    onFocus,
    onKeyDown,
    inputProps = {},
    setPaymentAlready,
  },
  ref
) {
  const paymentToggle = useToggle()
  const payment = useFetchMerchantPayWays()
  
  useEffect(() => {
    if (setPaymentAlready !== undefined && !payment.loading) {
      setPaymentAlready(!payment.loading)
    }
  }, [payment.loading]);
  const selectedValue =
    idx(payment, _ => _.data.merchantPayWays.find(d => d.name === value)) || null

  const options =
    idx(payment, _ =>
      _.data.merchantPayWays.map(({ fee, id, name, type }) => ({
        fee,
        id,
        name,
        type,
      }))
    ) || []
  const handleChange = (_e, option) => {
    onChange(option)
  }
  return (
    <Autocomplete
      freeSolo
      open={paymentToggle.open}
      onOpen={paymentToggle.toggle}
      onClose={paymentToggle.toggle}
      css={className}
      onChange={handleChange}
      value={selectedValue}
      options={options}
      autoHighlight
      clearOnBlur={true}
      getOptionLabel={option => option.name}
      loading={payment.loading}
      renderOption={(props, option) => (
        <span {...props} data-testid={`${inputProps['data-testid'] ?? ''}-${option.name}`}>{option.name}</span>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          onFocus={onFocus}
          name={name}
          inputRef={ref}
          variant="outlined"
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <Fragment>
                {/* {payment.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default compose([forwardRef, memo], PaymentAutoComplete)
