import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Fragment } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { MobileDatePicker } from 'ui/date-picker'
import MLAutocpmplete from 'components/MerchantListAutocpmpleteForManagement'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

function General({ dateChange, inputValue, valueChange, isClick, submit }) {
  const isReadOnly = Boolean(inputValue.endDateActual)

  const PrivateToggle = () => (
    <ToggleGroup onChange={(e, v) => v !== null && valueChange('isPublic', v)} value={inputValue.isPublic} exclusive>
      <ToggleGroupItem disabled={isReadOnly} value={true}>公開</ToggleGroupItem>
      <ToggleGroupItem disabled={isReadOnly} value={false}>私人</ToggleGroupItem>
    </ToggleGroup>
  )

  return (
    <Fragment>
      <Card>
        <CardHeader className="items-center" action={<PrivateToggle />}>
          <CardTitle>活動設定</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-5 [&_.ui-date-picker]:w-[150px] [&_input]:cursor-pointer">
            <MobileDatePicker
              readOnly={isReadOnly}
              closeOnSelect
              label="預設起始時間"
              showToolbar={false}
              value={inputValue.startDateDefault}
              format="yyyy/MM/dd"
              localeText={{
                toolbarTitle: '預設起始時間'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              onChange={value => dateChange(new Date(value).getTime(), 'startDateDefault')}
            />
            <MobileDatePicker
              readOnly={isReadOnly}
              closeOnSelect
              label="預設結束時間"
              showToolbar={false}
              value={inputValue.endDateDefault}
              format="yyyy/MM/dd"
              localeText={{
                toolbarTitle: '預設結束時間'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              onChange={value => dateChange(new Date(value).getTime(), 'endDateDefault')}
            />
          </div>
          <Field label='活動名稱'>
            <Input
              placeholder='請輸入活動名稱'
              value={inputValue.nameDefault}
              onChange={e => valueChange('nameDefault', e.target.value)}
              readOnly={isReadOnly}
            />
          </Field>
          <div style={{ display: inputValue.isPublic ? 'none' : '' }}>
            <MLAutocpmplete
              onEdit
              selectIds={inputValue.merchantIds}
              onValueChange={v => valueChange('merchantIds', v)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Field label='總張數上限' className='w-40'>
              <Input
                value={inputValue.maxCountDefault}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const value = e.target.value
                  if (value.match(/^[0-9]*$/)) {
                    valueChange('maxCountDefault', Number(value))
                  }
                }}
                readOnly={isReadOnly}
              />
            </Field>
            <FormControlLabel
              disabled={isReadOnly}
              style={{ width: 'fit-content' }}
              control={<Checkbox color="primary" />}
              label='開啟簡訊通知'
              checked={inputValue.isSMSNotifyDefault}
              onChange={(e, v) => valueChange('isSMSNotifyDefault', v)}
            />
          </div>
        </CardContent>
        {isReadOnly ? '' : (
          <CardFooter>
            <Button disabled={isClick} onClick={submit} variant="primary">
              儲存
            </Button>
          </CardFooter>
        )}
      </Card>
    </Fragment>
  )
}
export default General
