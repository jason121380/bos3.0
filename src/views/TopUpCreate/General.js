import { Input, TextField, InputAdornment } from 'ui/text-field'
import { FormControl, InputLabel, FormHelperText } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import React from 'react'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { useFormContext } from 'react-hook-form'
import idx from 'idx'
import useFetchPayments from 'hooks/useFetchPayments'
import { MobileDateTimePicker } from 'ui/date-picker'
import format from 'date-fns/format';
import { Card, CardContent } from 'ui/card'
import { Field, Input as UiInput } from 'ui/input'

// 原 styles/General 的 formControl（marginBottom spacing(3) !important）；EmployeeAutoComplete／CustomerAutoComplete 以 className 套在根節點
const FORM_CONTROL = '!mb-6'

export default function General() {
  const { register, errors, setValue, watch, clearErrors } = useFormContext()
  const payments = useFetchPayments()
  const { designerId, customerId, payType, date } = watch([
    'designerId',
    'customerId',
    'payType',
    'date',
  ])

  React.useEffect(() => {
    register('customerId', {
      required: '顧客為必填',
    })
    register('designerId', {
      required: '設計師為必填',
    })
    register('payType', {
      required: '付款方式為必填',
    })
    register('handlingFeeDecountWay')
    register('date')
  }, [register])

  const paymentCashOption = [
    <NativeSelectOption value="現金" key={99}>
      現金
    </NativeSelectOption>,
  ]

  const paymentOptions = paymentCashOption.concat(
    payments.loading ? (
      <NativeSelectOption value={null} key={98}>
        <em>None</em>
      </NativeSelectOption>
    ) : (
      // 查詢失敗時只留「現金」（原本 data 為 undefined 時整頁錯誤；Jason 2026/10/22 fix all）
      (idx(payments, _ => _.data.merchantPayWays) || []).map((data, index) => (
        <NativeSelectOption value={data.name} key={index}>
          {data.name}
        </NativeSelectOption>
      ))
    )
  )

  const handlingFeeDecountWayArray = [
    {
      value: 'BYCUSTOMER',
      label: '由客人負擔',
    },
    {
      value: 'BYDESIGNER',
      label: '由設計師負擔',
    },
    {
      value: 'WITHOUTHANDLINGFEE',
      label: '不扣項',
    },
  ]

  return (
    <Card className="mb-6">
      <CardContent>
        <MobileDateTimePicker
          closeOnSelect
          label='選擇日期'
          value={date}
          onChange={val => setValue('date', new Date(val).getTime())}
          format="yyyy/MM/dd HH:mm"
          className={FORM_CONTROL}
          localeText={{
            toolbarTitle: '選擇日期'
          }}
          slots={{
            field: inputProps => (
              <FormControl className={FORM_CONTROL} variant="filled">
                <InputLabel htmlFor="date-picker">日期</InputLabel>
                <Input
                  id="date-picker"
                  type='text'
                  onClick={inputProps.onClick}
                  endAdornment={
                    <InputAdornment position="end"><InsertInvitationIcon/></InputAdornment>
                  }
                  label="日期"
                  value={format(inputProps.value, inputProps.format)}
                />
              </FormControl>
            )
          }}
        />
        <TextField
          label="金額"
          type="number"
          fullWidth
          variant="outlined"
          className={FORM_CONTROL}
          name="money"
          inputProps={{
            max: 2147483647,
          }}
          error={Boolean(errors?.money)}
          helperText={errors?.money?.message}
          inputRef={register({
            valueAsNumber: true,
            required: '金額為必填',
            max: {
              value: 2147483647,
              message: '金額必須小於 2147483647',
            },
          })}
          onWheel={() => document.activeElement.blur()}              
        />
        <EmployeeAutoComplete
          className={FORM_CONTROL}
          onChange={val => {
            setValue('designerId', val.userId)
            if (errors?.designerId) {
              clearErrors(['designerId'])
            }
          }}
          value={designerId}
          fieldProps={{
            label: '選擇設計師',
            error: Boolean(errors?.designerId),
            helperText: errors?.designerId?.message,
          }}
        />
        <div className={FORM_CONTROL}>
          <CustomerAutoComplete
            className={FORM_CONTROL}
            fieldProps={{
              label: '選擇顧客',
              error: Boolean(errors?.customerId),
              helperText: errors?.customerId?.message,
            }}
            value={customerId}
            onChange={val => {
              setValue('customerId', val.id)

              if (errors?.customerId) {
                clearErrors(['customerId'])
              }
            }}
          />
        </div>
        <FormControl
          variant="outlined"
          className={FORM_CONTROL}
          fullWidth
          error={Boolean(errors?.payType)}
        >
          <NativeSelect
            name="payType"
            defaultValue=""
            error={Boolean(errors?.payType)}
            onChange={event => {
              setValue('payType', event.target.value)
              // 現金不收手續費：手續費負擔方送「不扣項」（WITHOUTHANDLINGFEE，與顧客詳細的入金彈窗相同），不把原本的值一起送出；
              // 從現金改回其他付款方式時負擔方回到未選（Jason 2026/10/22 fix all；「照建議」改送 WITHOUTHANDLINGFEE，原本送 null）
              if (event.target.value === '現金') setValue('handlingFeeDecountWay', 'WITHOUTHANDLINGFEE')
              else if (payType === '現金') setValue('handlingFeeDecountWay', null)
              if (errors?.payType) {
                clearErrors(['payType'])
              }
            }}
            displayEmpty={false}
            placeholder="請選擇…"
            label="付款方式"
          >
            {paymentOptions}
          </NativeSelect>
          {errors.payType && <FormHelperText>{errors.payType.message}</FormHelperText>}
        </FormControl>
        {payType !== '現金' && (
          <FormControl variant="outlined" className={FORM_CONTROL} fullWidth>
            <NativeSelect
              name="handlingFeeDecountWay"
              defaultValue=""
              error={Boolean(errors?.handlingFeeDecountWay)}
              onChange={event => {
                setValue('handlingFeeDecountWay', event.target.value)
              }}
              displayEmpty={false}
              placeholder="請選擇…"
              label="選擇入金儲值手續費負擔方"
            >
              {handlingFeeDecountWayArray.map((data, index) => (
                <NativeSelectOption value={data.value} key={index}>
                  {data.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {errors.handlingFeeDecountWay && <FormHelperText>{errors.handlingFeeDecountWay.message}</FormHelperText>}
          </FormControl>
        )}
        <Field label="備註">
          <UiInput
            name="remark"
            ref={register}
          />
        </Field>
      </CardContent>
    </Card>
  )
}
