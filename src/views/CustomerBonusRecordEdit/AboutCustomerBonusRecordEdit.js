import { Input, InputAdornment } from 'ui/text-field'
import { FormControl, InputLabel } from 'ui/form-control'
import { MobileDatePicker } from 'ui/date-picker'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import _ from 'lodash'
import format from 'date-fns/format'
import { Card, CardContent } from 'ui/card'
import { Field, Input as UiInput } from 'ui/input'

// Employee／CustomerAutoComplete 的 className 以字串直通（原 emotion 物件等值轉 Tailwind）

function AboutMerchantVendorCreate({ className, submitData, setSubmitData }) {
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
              <FormControl className="!mb-[24px]" variant="filled">
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
          className="!mb-[24px]"
          value={submitData.designerId}
          onChange={e => {
            setSubmitData({ ...submitData, designerId: e.userId ? e.userId : '' })
          }}
        />
        <CustomerAutoComplete
          label="選擇顧客"
          className="!mb-[24px] !w-full"
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
                bonus = bonus.slice(0, bonus.indexOf('.'))
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
export default AboutMerchantVendorCreate