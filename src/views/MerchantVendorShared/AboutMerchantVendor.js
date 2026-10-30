// 廠商選擇使用 ui/combobox Autocomplete（樣式由正式 ui 元件提供）
import { TextField } from 'ui/text-field'
import cloneDeep from 'lodash/cloneDeep'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Autocomplete } from 'ui/combobox'

// 新增／編輯廠商共用（2026/10/30 自兩頁合併）。兩頁原本只差欄位 id 寫法與「代號」必填星號：
// 以 isEdit 保留各頁原本的 id（新增頁 merchantVendor-no…、編輯頁 merchantVendorNo…）與新增頁的 required 標示。
const FIELD_IDS = {
  create: { no: 'merchantVendor-no', name: 'merchantVendor-name', nickname: 'merchantVendor-nickname', remark: 'merchantVendor-remark' },
  edit: { no: 'merchantVendorNo', name: 'merchantVendorName', nickname: 'merchantVendorNickname', remark: 'merchantVendorRemark' },
}

function AboutMerchantVendor({ className, vendorOption, isLodaing, submitData, setSubmitData, isEdit = false }) {
  const ids = isEdit ? FIELD_IDS.edit : FIELD_IDS.create
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
            getOptionLabel={option => (option ? option.name : '')}
            onChange={(event, value) => handleInputChange('vendorUUId', value)}
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
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
        <Field label="代號" htmlFor={ids.no} required={!isEdit}>
          <Input id={ids.no} value={submitData.no} onChange={event => handleInputChange('no', event.target.value)} />
        </Field>
        <Field label="名稱" htmlFor={ids.name}>
          <Input id={ids.name} value={submitData.name} onChange={event => handleInputChange('name', event.target.value)} />
        </Field>
        <Field label="暱稱" htmlFor={ids.nickname}>
          <Input id={ids.nickname} value={submitData.nickname} onChange={event => handleInputChange('nickname', event.target.value)} />
        </Field>
        <Field label="備註" htmlFor={ids.remark}>
          <Input id={ids.remark} value={submitData.remark} onChange={event => handleInputChange('remark', event.target.value)} />
        </Field>
      </CardContent>
    </Card>
  )
}
export default AboutMerchantVendor
