import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Fragment } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { MobileDatePicker } from 'ui/date-picker'
import { isBefore, format } from 'date-fns'
import MerchantListAutocompleteForManagement from 'components/MerchantListAutocompleteForManagement'
import BelongAutocomplete from 'components/BelongAutocomplete'
import PaywayAutocomplete from 'components/PaywayAutocomplete'
import produce from 'immer'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

// 建立規則／編輯規則共用的規則表單（2026/10/28 自 EventRuleCreate／EventRuleEdit 的 General.js 合併，畫面與行為逐字保留）。
// 兩頁的差異以 props 明確傳入：
//   isEdit：編輯頁的日期選擇器標題列（「起始時間」「結束時間」＋ M月d日）；建立頁原本沒有，維持不加。
//           建立頁在「適用付款方式」與「入金儲值」之間有一條分隔線，編輯頁原本沒有，維持原樣。
//   submitLabel：底部按鈕文字（建立頁「新增」、編輯頁「儲存」）。
//   isReadOnly：只有編輯頁會傳（已結束的規則唯讀並隱藏底部按鈕）；建立頁不傳，等同原本沒有 readOnly。
// 已結束規則的歸屬多選一律以 isReadOnly 唯讀（Jason 2026/10/22 授權修正：服務／賣卡先入／賣卡後入原本傳成 readOnly，被元件的 isReadOnly=false 蓋掉而仍可修改）
const editPickerToolbar = title => ({
  localeText: {
    toolbarTitle: title
  },
  slotProps: {
    toolbar: {
      toolbarFormat: 'M月d日'
    }
  }
})

function RuleForm({ inputValue, attributions, setInputValue, handleSubmit, isClick, mainEvent, isReadOnly, eventId, isEdit = false, submitLabel }) {
  const handleDateChange = (value, pickerType) => {
    const newValue = cloneDeep(inputValue)
    newValue[pickerType] = value
    if (pickerType === 'endDateForGroup' && isBefore(newValue.endDateForGroup, newValue.startDateForGroup)) {
      newValue.startDateForGroup = newValue.endDateForGroup
    } else if (pickerType === 'startDateForGroup' && isBefore(newValue.endDateForGroup, newValue.startDateForGroup)) {
      newValue.endDateForGroup = newValue.startDateForGroup
    }
    setInputValue(newValue)
  }

  const handleValueChange = (key, value) => {
    setInputValue(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleTypeChange = (key1, key2, value) => {
    setInputValue(
      produce(draft => {
        draft[key1][key2] = value
        if (value === 'ALL') {
          draft[key1].belong = []
        }
      })
    )
  }

  const handleWalletDepositChange = (key1, key2, value) => {
    setInputValue(
      produce(draft => {
        draft[key1][key2] = value
        if (!value) {
          draft[key1].price = 0
        }
      })
    )
  }
  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle>{`${mainEvent.name} ${format(mainEvent.start, "yyyy/MM/dd")} ~ ${format(mainEvent.end, "yyyy/MM/dd")}`}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field label='規則名稱'>
            <Input
              placeholder='請輸入規則名稱'
              value={inputValue.nameForGroup}
              onChange={e => handleValueChange('nameForGroup', e.target.value)}
              readOnly={isReadOnly}
            />
          </Field>
          <div className="flex flex-wrap gap-5 [&_.ui-date-picker]:w-[150px] [&_input]:cursor-pointer">
            <MobileDatePicker
              readOnly={isReadOnly}
              maxDate={mainEvent.end}
              minDate={mainEvent.start}
              closeOnSelect
              label="起始時間"
              value={inputValue.startDateForGroup}
              format="yyyy/MM/dd"
              {...(isEdit ? editPickerToolbar('起始時間') : {})}
              onChange={value => handleDateChange(new Date(value).getTime(), 'startDateForGroup')}
            />
            <MobileDatePicker
              readOnly={isReadOnly}
              maxDate={mainEvent.end}
              minDate={mainEvent.start}
              closeOnSelect
              label="結束時間"
              value={inputValue.endDateForGroup}
              format="yyyy/MM/dd"
              {...(isEdit ? editPickerToolbar('結束時間') : {})}
              onChange={value => handleDateChange(new Date(value).getTime(), 'endDateForGroup')}
            />
          </div>
          <div>
            <p className="mb-3 text-label text-text">適用店家：</p>
            <MerchantListAutocompleteForManagement
              onEdit
              onValueChange={value => handleValueChange('merchants', value)}
              selectIds={inputValue.merchants}
              isReadOnly={isReadOnly}
              inRule
              eventId={eventId}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-label text-text">適用消費類型：</p>
              <ToggleGroup
                size="small"
                exclusive
                value={inputValue.consumptionTypeUsing}
                onChange={(e, v) => v && handleValueChange('consumptionTypeUsing', v)}
              >
                <ToggleGroupItem disabled={isReadOnly} value='ALL'>全部套用</ToggleGroupItem>
                <ToggleGroupItem disabled={isReadOnly} value='CUSTOMIZE'>自訂</ToggleGroupItem>
              </ToggleGroup>
            </div>
            {inputValue.consumptionTypeUsing === 'CUSTOMIZE' && (
              <>
                <NativeSelect
                  readOnly={isReadOnly}
                  value={inputValue.product}
                  onChange={e => handleValueChange('product', e.target.value)}
                  displayEmpty={false}
                  placeholder="請選擇…"
                  label="店販"
                  fullWidth={false}
                  className="min-w-[120px] align-top w-[150px]"
                >
                  <NativeSelectOption value={false}>不套用</NativeSelectOption>
                  <NativeSelectOption value={true}>套用</NativeSelectOption>
                </NativeSelect>
                <div className="h-px bg-border" />
                <NativeSelect
                  readOnly={isReadOnly}
                  value={inputValue.membershipCard}
                  onChange={e => handleValueChange('membershipCard', e.target.value)}
                  displayEmpty={false}
                  placeholder="請選擇…"
                  label="會員卡"
                  fullWidth={false}
                  className="min-w-[120px] align-top w-[150px]"
                >
                  <NativeSelectOption value={false}>不套用</NativeSelectOption>
                  <NativeSelectOption value={true}>套用</NativeSelectOption>
                </NativeSelect>
                <div className="h-px bg-border" />
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-5">
                    <NativeSelect
                      readOnly={isReadOnly}
                      value={inputValue.service.type !== ''}
                      onChange={e => handleTypeChange('service', 'type', e.target.value ? 'ALL' : '')}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="服務"
                      fullWidth={false}
                      className="min-w-[120px] align-top w-[150px]"
                    >
                      <NativeSelectOption value={false}>不套用</NativeSelectOption>
                      <NativeSelectOption value={true}>套用</NativeSelectOption>
                    </NativeSelect>
                    {inputValue.service.type !== '' && (
                      <NativeSelect
                        readOnly={isReadOnly}
                        value={inputValue.service.type}
                        onChange={e => handleTypeChange('service', 'type', e.target.value)}
                        displayEmpty={false}
                        placeholder="請選擇…"
                        label="歸屬"
                        fullWidth={false}
                        className="min-w-[120px] align-top w-[150px]"
                      >
                        <NativeSelectOption value='ALL'>全部套用</NativeSelectOption>
                        <NativeSelectOption value='SPECIFIC'>自訂</NativeSelectOption>
                      </NativeSelect>
                    )}
                  </div>
                  {inputValue.service.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.service.belong}
                      className='Autocomplete'
                      isReadOnly={isReadOnly}
                      onChange={value => handleTypeChange('service', 'belong', value)}
                    />
                  )}
                </div>
                <div className="h-px bg-border" />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-5">
                    <NativeSelect
                      readOnly={isReadOnly}
                      value={inputValue.ticketSellInPerformance.type !== ''}
                      onChange={e => handleTypeChange('ticketSellInPerformance', 'type', e.target.value ? 'ALL' : '')}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="賣卡先入"
                      fullWidth={false}
                      className="min-w-[120px] align-top w-[150px]"
                    >
                      <NativeSelectOption value={false}>不套用</NativeSelectOption>
                      <NativeSelectOption value={true}>套用</NativeSelectOption>
                    </NativeSelect>
                    {inputValue.ticketSellInPerformance.type !== '' && (
                      <>
                        <NativeSelect
                          readOnly={isReadOnly}
                          value={inputValue.ticketSellInPerformance.type}
                          onChange={e => handleTypeChange('ticketSellInPerformance', 'type', e.target.value)}
                          displayEmpty={false}
                          placeholder="請選擇…"
                          label="歸屬"
                          fullWidth={false}
                          className="min-w-[120px] align-top w-[150px]"
                        >
                          <NativeSelectOption value='ALL'>全部套用</NativeSelectOption>
                          <NativeSelectOption value='SPECIFIC'>自訂</NativeSelectOption>
                        </NativeSelect>
                      </>
                    )}
                  </div>
                  {inputValue.ticketSellInPerformance.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketSellInPerformance.belong}
                      className='Autocomplete'
                      isReadOnly={isReadOnly}
                      onChange={value => handleTypeChange('ticketSellInPerformance', 'belong', value)}
                    />
                  )}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-5">
                    <NativeSelect
                      readOnly={isReadOnly}
                      value={inputValue.ticketSellNotInPerformance.type !== ''}
                      onChange={e => handleTypeChange('ticketSellNotInPerformance', 'type', e.target.value ? 'ALL' : '')}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="賣卡後入"
                      fullWidth={false}
                      className="min-w-[120px] align-top w-[150px]"
                    >
                      <NativeSelectOption value={false}>不套用</NativeSelectOption>
                      <NativeSelectOption value={true}>套用</NativeSelectOption>
                    </NativeSelect>
                    {inputValue.ticketSellNotInPerformance.type !== '' && (
                      <>
                        <NativeSelect
                          readOnly={isReadOnly}
                          value={inputValue.ticketSellNotInPerformance.type}
                          onChange={e => handleTypeChange('ticketSellNotInPerformance', 'type', e.target.value)}
                          displayEmpty={false}
                          placeholder="請選擇…"
                          label="歸屬"
                          fullWidth={false}
                          className="min-w-[120px] align-top w-[150px]"
                        >
                          <NativeSelectOption value='ALL'>全部套用</NativeSelectOption>
                          <NativeSelectOption value='SPECIFIC'>自訂</NativeSelectOption>
                        </NativeSelect>
                      </>
                    )}
                  </div>
                  {inputValue.ticketSellNotInPerformance.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketSellNotInPerformance.belong}
                      className='Autocomplete'
                      isReadOnly={isReadOnly}
                      onChange={value => handleTypeChange('ticketSellNotInPerformance', 'belong', value)}
                    />
                  )}
                </div>
                <div className="h-px bg-border" />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-5">
                    <NativeSelect
                      readOnly={isReadOnly}
                      value={inputValue.ticketUsePerformanceEntered.type !== ''}
                      onChange={e => handleTypeChange('ticketUsePerformanceEntered', 'type', e.target.value ? 'ALL' : '')}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="用卡先入"
                      fullWidth={false}
                      className="min-w-[120px] align-top w-[150px]"
                    >
                      <NativeSelectOption value={false}>不套用</NativeSelectOption>
                      <NativeSelectOption value={true}>套用</NativeSelectOption>
                    </NativeSelect>
                    {inputValue.ticketUsePerformanceEntered.type !== '' && (
                      <>
                        <NativeSelect
                          readOnly={isReadOnly}
                          value={inputValue.ticketUsePerformanceEntered.type}
                          onChange={e => handleTypeChange('ticketUsePerformanceEntered', 'type', e.target.value)}
                          displayEmpty={false}
                          placeholder="請選擇…"
                          label="歸屬"
                          fullWidth={false}
                          className="min-w-[120px] align-top w-[150px]"
                        >
                          <NativeSelectOption value='ALL'>全部套用</NativeSelectOption>
                          <NativeSelectOption value='SPECIFIC'>自訂</NativeSelectOption>
                        </NativeSelect>
                      </>
                    )}
                  </div>
                  {inputValue.ticketUsePerformanceEntered.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketUsePerformanceEntered.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketUsePerformanceEntered', 'belong', value)}
                      isReadOnly={isReadOnly}
                    />
                  )}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-5">
                    <NativeSelect
                      readOnly={isReadOnly}
                      value={inputValue.ticketUsePerformanceNotEntered.type !== ''}
                      onChange={e => handleTypeChange('ticketUsePerformanceNotEntered', 'type', e.target.value ? 'ALL' : '')}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="用卡後入"
                      fullWidth={false}
                      className="min-w-[120px] align-top w-[150px]"
                    >
                      <NativeSelectOption value={false}>不套用</NativeSelectOption>
                      <NativeSelectOption value={true}>套用</NativeSelectOption>
                    </NativeSelect>
                    {inputValue.ticketUsePerformanceNotEntered.type !== '' && (
                      <>
                        <NativeSelect
                          readOnly={isReadOnly}
                          value={inputValue.ticketUsePerformanceNotEntered.type}
                          onChange={e => handleTypeChange('ticketUsePerformanceNotEntered', 'type', e.target.value)}
                          displayEmpty={false}
                          placeholder="請選擇…"
                          label="歸屬"
                          fullWidth={false}
                          className="min-w-[120px] align-top w-[150px]"
                        >
                          <NativeSelectOption value='ALL'>全部套用</NativeSelectOption>
                          <NativeSelectOption value='SPECIFIC'>自訂</NativeSelectOption>
                        </NativeSelect>
                      </>
                    )}
                  </div>
                  {inputValue.ticketUsePerformanceNotEntered.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketUsePerformanceNotEntered.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketUsePerformanceNotEntered', 'belong', value)}
                      isReadOnly={isReadOnly}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-label text-text">適用付款方式：</p>
            </div>
            <div className="flex flex-col gap-5">
              <PaywayAutocomplete
                value={inputValue.payTypeUsing}
                onChange={value => handleValueChange('payTypeUsing', value)}
                className='Autocomplete'
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-label text-text">適用規則：</p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-5">
                <Field label='門檻' className='w-40'>
                  <Input
                    value={inputValue.thresholdPrice}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value
                      if (value.match(/^[0-9]*$/)) {
                        handleValueChange('thresholdPrice', Number(value))
                      }
                    }}
                    readOnly={isReadOnly}
                  />
                </Field>
                <Field label='每單發券上限' className='w-40'>
                  <Input
                    value={inputValue.maxCountPerOrder}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value
                      if (value.match(/^[0-9]*$/)) {
                        handleValueChange('maxCountPerOrder', Number(value))
                      }
                    }}
                    readOnly={isReadOnly}
                  />
                </Field>
                <Field label='總張數上限' className='w-40'>
                  <Input
                    value={inputValue.maxCountForGroup}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value
                      if (value.match(/^[0-9]*$/)) {
                        if (Number(value) > mainEvent.maxCount) {
                          openSnackbar({
                            message: `張數上限為${mainEvent.maxCount}`,
                            variant: 'warning'
                          })
                        } else {
                          handleValueChange('maxCountForGroup', Number(value))
                        }
                      }
                    }}
                    readOnly={isReadOnly}
                  />
                </Field>
              </div>
            </div>
          </div>
          {isEdit ? null : <div className="h-px bg-border" />}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-label text-text">入金儲值：</p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-5">
                <NativeSelect
                  readOnly={isReadOnly}
                  value={inputValue.walletDepositForCash.using}
                  onChange={e => {
                    handleWalletDepositChange('walletDepositForCash', 'using', e.target.value)
                  }}
                  displayEmpty={false}
                  placeholder="請選擇…"
                  label="現金"
                  fullWidth={false}
                  className="min-w-[120px] align-top w-[150px]"
                >
                  <NativeSelectOption value={false}>不套用</NativeSelectOption>
                  <NativeSelectOption value={true}>套用</NativeSelectOption>
                </NativeSelect>
                {inputValue.walletDepositForCash.using && (
                  <Field label='金額門檻' className='w-40'>
                    <Input
                      value={inputValue.walletDepositForCash.price}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const value = e.target.value
                        if (value.match(/^[0-9]*$/)) {
                          handleTypeChange('walletDepositForCash', 'price', Number(value))
                        }
                      }}
                      readOnly={isReadOnly}
                    />
                  </Field>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-wrap gap-5">
                <NativeSelect
                  readOnly={isReadOnly}
                  value={inputValue.walletDepositForOtherPay.using}
                  onChange={e => handleWalletDepositChange('walletDepositForOtherPay', 'using', e.target.value)}
                  displayEmpty={false}
                  placeholder="請選擇…"
                  label="其他付款方式"
                  fullWidth={false}
                  className="min-w-[120px] align-top w-[150px]"
                >
                  <NativeSelectOption value={false}>不套用</NativeSelectOption>
                  <NativeSelectOption value={true}>套用</NativeSelectOption>
                </NativeSelect>
                {inputValue.walletDepositForOtherPay.using && (
                  <Field label='金額門檻' className='w-40'>
                    <Input
                      value={inputValue.walletDepositForOtherPay.price}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const value = e.target.value
                        if (value.match(/^[0-9]*$/)) {
                          handleTypeChange('walletDepositForOtherPay', 'price', Number(value))
                        }
                      }}
                      readOnly={isReadOnly}
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
          <div className="h-px bg-border" />
          <FormControlLabel
            disabled={isReadOnly}
            style={{ width: 'fit-content' }}
            control={<Checkbox color="primary" />}
            label='開啟簡訊通知'
            checked={inputValue.isSMSNotifyForGroup}
            onChange={(e, v) => handleValueChange('isSMSNotifyForGroup', v)}
          />
        </CardContent>
        {isReadOnly ? '' : (
          <CardFooter>
            <Button disabled={isClick} onClick={handleSubmit} variant="primary">
              {submitLabel}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Fragment>
  )
}
export default RuleForm
