import { TextField } from 'ui/text-field'
import useFetchMerchantPayWays from 'hooks/useFetchMerchantPayWays'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { forwardRef, memo, Fragment, useEffect, useMemo } from 'react'
import compose from 'utils/compose'
import { Autocomplete } from 'ui/combobox'

// 標籤函式放在模組層（身分固定），ui/combobox 才能沿用篩選結果（效能修正 B，內容不變）
const getOptionLabel = option => option.name

function PaymentAutoComplete(
  { className = '', onChange = () => {}, label = '', value, name, autoFocus, onFocus, onKeyDown, inputProps = {}, setPaymentAlready },
  ref
) {
  const paymentToggle = useToggle()
  const payment = useFetchMerchantPayWays()

  useEffect(() => {
    if (setPaymentAlready !== undefined && !payment.loading) {
      setPaymentAlready(!payment.loading)
    }
  }, [payment.loading, setPaymentAlready])
  const selectedValue = idx(payment, _ => _.data.merchantPayWays.find(d => d.name === value)) || null

  // 只在查詢結果改變時重新整理選項（內容不變），選項身分固定，ui/combobox 才能沿用篩選結果（效能修正 B）
  const options = useMemo(
    () =>
      idx(payment, _ =>
        _.data.merchantPayWays.map(({ fee, id, name, type }) => ({
          fee,
          id,
          name,
          type,
        }))
      ) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 選項只由查詢結果決定；payment 物件每次 render 都是新的
    [payment.data]
  )
  const handleChange = (_e, option) => {
    onChange(option)
  }
  return (
    <Autocomplete
      freeSolo
      open={paymentToggle.open}
      onOpen={paymentToggle.toggle}
      onClose={paymentToggle.toggle}
      className={className}
      onChange={handleChange}
      value={selectedValue}
      options={options}
      autoHighlight
      clearOnBlur={true}
      getOptionLabel={getOptionLabel}
      loading={payment.loading}
      renderOption={(props, option) => (
        <span {...props} data-testid={`${inputProps['data-testid'] ?? ''}-${option.name}`}>
          {option.name}
        </span>
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

// memo(forwardRef(PaymentAutoComplete))：compose 由右到左包裝（Jason 2026/10/22 fix all；原本 compose 只套用第一個 module）
export default compose([memo, forwardRef], PaymentAutoComplete)
