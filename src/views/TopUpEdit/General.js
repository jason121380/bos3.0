/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, FormControl, InputLabel, MenuItem,
  Select, TextField, FormHelperText,
  InputAdornment, Input
} from '@mui/material'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import useFetchPayments from 'hooks/useFetchPayments'
import { MobileDateTimePicker } from '@mui/x-date-pickers'
import format from 'date-fns/format';

import styles from './styles/General'

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

export default function General() {
  const { register, errors, setValue, watch, clearErrors, getValues } = useFormContext()
  const payments = useFetchPayments()
  const { designerId, customerId, payType, handlingFeeDecountWay, date } = watch([
    'designerId',
    'customerId',
    'money',
    'payType',
    'handlingFeeDecountWay',
    'date',
  ])
  const defaultValue = getValues()

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

  if (payments.loading) return 'loading..'

  const paymentCashOption = [
    <MenuItem value="現金" key={99}>
      現金
    </MenuItem>,
  ]

  const paymentOptions = paymentCashOption.concat(
    payments.loading ? (
      <MenuItem value={null} key={98}>
        <em>None</em>
      </MenuItem>
    ) : (
      payments.data.merchantPayWays.map((data, index) => (
        <MenuItem value={data.name} key={index}>
          {data.name}
        </MenuItem>
      ))
    )
  )

  return (
    <Card css={styles.card}>
      <CardContent>
        {date && (
          <MobileDateTimePicker
            closeOnSelect
            label='選擇日期'
            value={date}
            onChange={val => setValue('date', new Date(val).getTime())}
            format="yyyy/MM/dd HH:mm"
            css={styles.formControl}
            localeText={{
              toolbarTitle: '選擇日期'
            }}
            slots={{
              field: inputProps => (
                <FormControl css={styles.formControl} variant="filled">
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
        )}
        <TextField
          label="金額"
          type="number"
          fullWidth
          variant="outlined"
          css={styles.formControl}
          name="money"
          inputProps={{
            // min: 1,
            max: 2147483647,
          }}
          error={Boolean(errors?.money)}
          helperText={errors?.money?.message}
          inputRef={register({
            valueAsNumber: true,
            required: '金額為必填',
            // min: {
            //   value: 1,
            //   message: '金額必須大於 0',
            // },
            max: {
              value: 2147483647,
              message: '金額必須小於 2147483647',
            },
          })}
          onWheel={() => document.activeElement.blur()}              
        />
        <EmployeeAutoComplete
          className={styles.formControl}
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
        <div style={{ marginBottom: '24px' }}>
          <CustomerAutoComplete
            className={styles.formControl}
            value={customerId}
            fieldProps={{
              label: '選擇顧客',
              error: Boolean(errors?.customerId),
              helperText: errors?.customerId?.message,
            }}
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
          css={styles.formControl}
          fullWidth
          error={Boolean(errors?.payType)}
        >
          <InputLabel>付款方式</InputLabel>
          <Select
            label='付款方式'
            name="payType"
            error={Boolean(errors?.payType)}
            defaultValue={defaultValue.payType}
            onChange={event => {
              setValue('payType', event.target.value)
              if (errors?.payType) {
                clearErrors(['payType'])
              }
            }}
          >
            {paymentOptions}
          </Select>
          {errors.payType && <FormHelperText>{errors.payType.message}</FormHelperText>}
        </FormControl>
        {payType !== '現金' && (
          <FormControl variant="outlined" css={styles.formControl} fullWidth>
            <InputLabel>選擇入金儲值手續費負擔方</InputLabel>
            <Select
              name="handlingFeeDecountWay"
              label='選擇入金儲值手續費負擔方'
              defaultValue=""
              onChange={event => {
                setValue('handlingFeeDecountWay', event.target.value)
              }}
              value={handlingFeeDecountWay}
            >
              {handlingFeeDecountWayArray.map((data, index) => (
                <MenuItem value={data.value} key={index}>
                  {data.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label="備註"
          fullWidth
          variant="outlined"
          name="remark"
          inputRef={register}
        />
      </CardContent>
    </Card>
  )
}
