/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, FormControl, InputLabel, MenuItem,
  Select, TextField, FormHelperText,
  InputAdornment, Input
} from '@mui/material'
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import React from 'react'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { useFormContext } from 'react-hook-form'
import useFetchPayments from 'hooks/useFetchPayments'
import { MobileDateTimePicker } from '@mui/x-date-pickers'
import format from 'date-fns/format';

import styles from './styles/General'

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
    <Card css={styles.card}>
      <CardContent>
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
        <TextField
          label="金額"
          type="number"
          fullWidth
          variant="outlined"
          css={styles.formControl}
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
        <div css={styles.formControl}>
          <CustomerAutoComplete
            className={styles.formControl}
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
          css={styles.formControl}
          fullWidth
          error={Boolean(errors?.payType)}
        >
          <InputLabel>付款方式</InputLabel>
          <Select
            label='付款方式'
            name="payType"
            defaultValue=""
            error={Boolean(errors?.payType)}
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
              error={Boolean(errors?.handlingFeeDecountWay)}
              onChange={event => {
                setValue('handlingFeeDecountWay', event.target.value)
              }}
            >
              {handlingFeeDecountWayArray.map((data, index) => (
                <MenuItem value={data.value} key={index}>
                  {data.label}
                </MenuItem>
              ))}
            </Select>
            {errors.handlingFeeDecountWay && <FormHelperText>{errors.handlingFeeDecountWay.message}</FormHelperText>}
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
