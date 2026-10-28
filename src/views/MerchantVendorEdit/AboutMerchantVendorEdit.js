// 廠商選擇使用 ui/combobox Autocomplete（樣式由正式 ui 元件提供）
import { TextField } from 'ui/text-field'
import cloneDeep from 'lodash/cloneDeep'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Autocomplete } from 'ui/combobox'

function AboutMerchantVendorEdit({ className, vendorOption, isLodaing, submitData, setSubmitData }) {
  const handleInputChange = (key, value) => {
    const newData = cloneDeep(submitData)
    newData[key] = value
    setSubmitData(newData)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>廠商資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field label="選擇廠商">
          <Autocomplete
            disabled={isLodaing}
            options={vendorOption}
            value={submitData.vendorUUId}
            autoHighlight
            getOptionLabel={option => option ? option.name : ''}
            onChange={(event, value) => handleInputChange('vendorUUId', value)}
            renderOption={(props, option) => (
              <li {...props}>{option.name}</li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
          />
        </Field>
        <Field label="代號" htmlFor="merchantVendorNo">
          <Input
            id="merchantVendorNo"
            value={submitData.no}
            onChange={event => handleInputChange('no', event.target.value)}
          />
        </Field>
        <Field label="名稱" htmlFor="merchantVendorName">
          <Input
            id="merchantVendorName"
            value={submitData.name}
            onChange={event => handleInputChange('name', event.target.value)}
          />
        </Field>
        <Field label="暱稱" htmlFor="merchantVendorNickname">
          <Input
            id="merchantVendorNickname"
            value={submitData.nickname}
            onChange={event => handleInputChange('nickname', event.target.value)}
          />
        </Field>
        <Field label="備註" htmlFor="merchantVendorRemark">
          <Input
            id="merchantVendorRemark"
            value={submitData.remark}
            onChange={event => handleInputChange('remark', event.target.value)}
          />
        </Field>
      </CardContent>
    </Card>
  )
}
export default AboutMerchantVendorEdit
