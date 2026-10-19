import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import clsx from 'clsx'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import useStore from 'hooks/useStore'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import { useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const commissionWay = [
  { label: '固定金額', value: 'fixed' },
  { label: '依售價-成本(%)', value: 'byCost' },
  { label: '售價(%)', value: 'byPrice' },
]
function AboutSalesCommission({ className, product, onChange, ...rest }) {
  const inputLabel = useRef()

  const { errors, register, setValue, clearErrors, watch, control } = useStore()

  const watchSellPrice = watch('sellPrice')
  const commissionWayValue = watch('commissionWay')

  const customerCategories = useFetchMerchantCustomerCategory()

  const { fields } = useFieldArray({
    control,
    name: 'customerSellSetting',
  })
  const handleSelectAllText = e => {
    e.target.select()
  }

  useEffect(() => {
    if (!customerCategories.loading) {
      const categories = customerCategories.data.merchantCustomerCategory.map(d => ({
        category: d.name,
        price: watchSellPrice,
      }))

      setValue('customerSellSetting', categories)
    }
  }, [customerCategories, watchSellPrice])

  useEffect(() => {
    register({ name: 'commissionWay' })
  }, [register])

  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>抽成</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormControl
          variant="outlined"
          fullWidth
          error={!!errors.commissionWay}
        >
          <InputLabel ref={inputLabel}>抽成方式</InputLabel>
          <Select
            label='抽成方式'
            name="commissionWay"
            onChange={event => {
              setValue('commissionWay', event.target.value)
              if (errors.commissionWay) {
                clearErrors(['commissionWay'])
              }
            }}
            defaultValue=""
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {commissionWay.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
          {errors.commissionWay && <FormHelperText>{errors.commissionWay.message}</FormHelperText>}
        </FormControl>
        <TextField
          type="number"
          label={
            commissionWayValue === 'byCost' || commissionWayValue === 'byPrice'
              ? '抽成數字%'
              : '抽成數字'
          }
          variant="outlined"
          fullWidth
          onFocus={handleSelectAllText}
          name="commission"
          error={!!errors.commission}
          helperText={errors.commission && errors.commission.message}
          inputProps={{
            'data-testid': 'commission',
            ref: register({
              valueAsNumber: true,
            }),
          }}
          onWheel={() => document.activeElement.blur()}              
        />
        {/* <Typography variant="h5" component="h5">
          售價
        </Typography>
        <Divider /> */}

        {fields.map((data, index) => {
          const error = idx(
            errors,
            _ => !!_.customerSellSetting?.find(d => d.price.message.indexOf(data.category) > -1)
          )
          const helperText =
            idx(
              errors,
              _ =>
                _.customerSellSetting.find(d => d.price.message.indexOf(data.category) > -1).price
                  .message
            ) || ''

          // return (
          // <Fragment key={data.id}>
          //   <TextField
          //    
          //     variant="outlined"
          //     fullWidth
          //     type="number"
          //     label={data.category}
          //     name={`customerSellSetting[${index}].price`}
          //     defaultValue={data.price}
          //     error={error}
          //     helperText={helperText}
          //     onFocus={handleSelectAllText}
          //     inputProps={{
          //       'data-testid': data.category,
          //       ref: register({
          //         required: `${data.category} 為必填`,
          //         min: {
          //           value: 1,
          //           message: `${data.category} 必須大於 0`,
          //         },
          //         valueAsNumber: true,
          //       }),
          //     }}
          //   />
          //   <TextField
          //     name={`customerSellSetting[${index}].category`}
          //     defaultValue={data.category}
          //     type="hidden"
          //     inputRef={register({
          //       required: `售價類別 為必填`,
          //     })}
          //   />
          // </Fragment>
          // )
        })}
      </CardContent>
    </Card>
  )
}

AboutSalesCommission.propTypes = {
  className: PropTypes.object,
}

export default AboutSalesCommission
