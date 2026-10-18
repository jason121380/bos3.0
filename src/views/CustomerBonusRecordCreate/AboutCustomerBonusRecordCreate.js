/** @jsxImportSource @emotion/react */
import {
  FormControl, Input, InputLabel,
  InputAdornment
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import _ from 'lodash'
import format from 'date-fns/format'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card, CardContent } from 'ui/card'
import { Field, Input as UiInput } from 'ui/input'

// styles 仍以 emotion 物件傳給 MUI FormControl 與 Employee／CustomerAutoComplete（其 className 以 css prop 套用）
const styles = {
  formGroup: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
  fullWidth: css({
    width: '100% !important'
  })
}

function AboutCustomerBonusRecordCreate({ className, submitData, setSubmitData }) {
  return (
    <Card className="mt-6">
      <CardContent>
        <MobileDatePicker
          closeOnSelect
          label='日期'
          value={submitData.date}
          onChange={e => setSubmitData({ ...submitData, date: new Date(e).getTime() })}
          format="yyyy/MM/dd"
          localeText={{
            toolbarTitle: '選擇日期'
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'M月d日'
            }
          }}
          slots={{
            field: inputProps => (
              <FormControl css={styles.formGroup} variant="filled">
                <InputLabel htmlFor="date-picker">日期</InputLabel>
                <Input
                  id="date-picker"
                  type='text'
                  onClick={inputProps.onClick}
                  endAdornment={
                    <InputAdornment position="end"><InsertInvitationIcon /></InputAdornment>
                  }
                  label="日期"
                  value={format(inputProps.value, inputProps.format)}
                />
              </FormControl>
            )
          }}
        />
        <EmployeeAutoComplete
          label="選擇設計師"
          className={styles.formGroup}
          value={submitData.designerId}
          onChange={e => {
            setSubmitData({ ...submitData, designerId: e.userId ? e.userId : '' })
          }}
        />
        <CustomerAutoComplete
          label="選擇顧客"
          className={css([styles.formGroup, styles.fullWidth])}
          value={submitData.customerId}
          onChange={e => {
            setSubmitData({ ...submitData, customerId: e.id ? e.id : '' })
          }}
        />
        <Field label="紅利點數" className="mb-6">
          <UiInput
            type='number'
            value={submitData.bonus}
            onFocus={e => e.target.select()}
            onChange={e => {
              let bonus = e.target.value
              if (bonus.includes('.')) {
                bonus = bonus.slice(bonus.indexOf('.'), 1)
              }
              setSubmitData({ ...submitData, bonus: bonus })
            }}
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
        <Field label="備註">
          <UiInput
            value={submitData.remark}
            onChange={e => setSubmitData({ ...submitData, remark: e.target.value })}
          />
        </Field>
      </CardContent>
    </Card>
  )
}
export default AboutCustomerBonusRecordCreate