import { FormControl, FormHelperText } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import clsx from 'clsx'
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

  // 各顧客分類售價（customerSellSetting）以 setValue 寫入表單值；畫面上不再顯示逐分類售價欄位
  useFieldArray({
    control,
    name: 'customerSellSetting',
  })
  const handleSelectAllText = e => {
    e.target.select()
  }

  useEffect(() => {
    // 查詢失敗時 data 為 undefined：沒有顧客分類，不讓整頁拋錯
    if (!customerCategories.loading && customerCategories.data) {
      const categories = customerCategories.data.merchantCustomerCategory.map(d => ({
        category: d.name,
        price: watchSellPrice,
      }))

      setValue('customerSellSetting', categories)
    }
  }, [customerCategories, watchSellPrice, setValue])

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
          <NativeSelect
            name="commissionWay"
            onChange={event => {
              setValue('commissionWay', event.target.value)
              if (errors.commissionWay) {
                clearErrors(['commissionWay'])
              }
            }}
            defaultValue=""
            displayEmpty={false}
            placeholder="請選擇…"
            error={!!errors.commissionWay}
            label="抽成方式"
            labelRef={inputLabel}
          >
            <NativeSelectOption value="">
              <em>None</em>
            </NativeSelectOption>
            {commissionWay.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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

      </CardContent>
    </Card>
  )
}

AboutSalesCommission.propTypes = {
  className: PropTypes.object,
}

export default AboutSalesCommission
