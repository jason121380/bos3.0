// 廠商選擇 Autocomplete 保留 MUI
import { TextField } from 'ui/text-field'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import React from 'react'
import _ from 'lodash'
import { Autocomplete } from 'ui/combobox'

function AboutMerchantVendorCreate({ className, vendorOption, isLodaing, submitData, setSubmitData }) {
  const handleInputChange = (key, value) => {
    const newData = _.cloneDeep(submitData)
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
            getOptionLabel={option => option.name}
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
        <Field label="代號" htmlFor="merchantVendor-no" required>
          <Input
            id="merchantVendor-no"
            value={submitData.no}
            onChange={event => handleInputChange('no', event.target.value)}
          />
        </Field>
        <Field label="名稱" htmlFor="merchantVendor-name">
          <Input
            id="merchantVendor-name"
            value={submitData.name}
            onChange={event => handleInputChange('name', event.target.value)}
          />
        </Field>
        <Field label="暱稱" htmlFor="merchantVendor-nickname">
          <Input
            id="merchantVendor-nickname"
            value={submitData.nickname}
            onChange={event => handleInputChange('nickname', event.target.value)}
          />
        </Field>
        <Field label="備註" htmlFor="merchantVendor-remark">
          <Input
            id="merchantVendor-remark"
            value={submitData.remark}
            onChange={event => handleInputChange('remark', event.target.value)}
          />
        </Field>
      </CardContent>
    </Card>
  )
}
export default AboutMerchantVendorCreate