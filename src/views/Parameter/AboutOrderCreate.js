/** @jsxImportSource @emotion/react */
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo, Fragment } from 'react'
import _ from 'lodash'
import produce from 'immer'
import styles from './styles/AboutTeachingModeSetting'

const printLayout = [
  {
    value: 'A4',
    label: 'A4',
  },
  {
    value: '感熱紙(80mm)',
    label: '感熱紙(80mm)',
  },
  {
    value: '感熱紙(57mm)',
    label: '感熱紙(57mm)',
  },
  {
    value: '自動寬度',
    label: '自動寬度',
  },
]
const lockStatus = [
  {
    value: 'TRUE',
    label: '不可更改',
  },
  {
    value: 'FALSE',
    label: '可更改',
  },
]
const BindedThirdPartlockStatus = [
  {
    value: true,
    label: '鎖定',
  },
  {
    value: false,
    label: '不鎖定',
  },
]
const isDesignate = [
  {
    value: 'DESIGNATE',
    label: '指定',
  },
  {
    value: 'NONDESIGNATE',
    label: '不指定',
  },
  {
    value: 'LASTORDER',
    label: '依前筆訂單',
  },
]
const nameDisplay = [
  {
    value: 'NAME',
    label: '顯示姓名',
  },
  {
    value: 'NICKNAME',
    label: '顯示暱稱',
  },
  {
    value: 'BOTH',
    label: '顯示姓名(暱稱)',
  },
]

function AboutOrderCreate({
  className,
  orderCreateSetting,
  setOrderCreateSetting,
  inputEnable,
}) {
  const settingArr = [
    { label: '指定互助人功能', key: 'isHelperDesignationDisplay' },
    { label: '顯示第三方卡券欄位', key: 'isThirdPartTicketDisplay' },
    { label: '訂單時間使用伺服器時間（只允許開出現在的時間的訂單）', key: 'isAbleToChangeDateTimeInOrderCreate' },
    {
      label: '顯示鎖定時間選項',
      key: 'isDateLockDisplay',
      lockDate: () => JSON.parse(localStorage.getItem('lockDate')) === true ? (
        <p className="text-caption text-text-secondary" style={{ margin: '-30px 31px 24px' }}>
          請至打帳單解除鎖定日期
        </p>
      ) : ''
    },
    { label: '固定業績明細於視窗下方', key: 'isDetailBottomed' },
    { label: '訂單可不留顧客客資', key: 'orderWithoutCustomerDefault' },
    { label: '快速開單模式（於背景建立訂單）', key: 'isQuickOrderModeOn' },
    { label: '客戶資料選取後自動帶入偏好設計師', key: 'isAutoSetPreferDesigner' },
    { label: '販賣多張預收卡券時自動依每張卡分項', key: 'isTicketSellSubItem' },
    { label: '訂單明細列印視窗延遲10秒關閉', key: 'isPrintWindowClosureDelayed' },
    { label: '啟用流水號功能', key: 'isOrderSerialNumberUsing' },
    { label: '開單頁面顯示顧客LINE綁定狀態', key: 'isLBCusDisplay' },
    { label: '啟用顧客入金折抵消費', key: 'isCusWalletUsageForOrder' },
  ]
  const optionArr = [
    { label: '訂單明細列印格式', key: 'printFormat', options: printLayout },
    { label: '列印明細設計師顯示格式', key: 'designerNameDisplayOnInvoice', options: nameDisplay },
    { label: '服務是否能更改預設價格', key: 'isServiceLocked', options: lockStatus },
    { label: '商品是否能更改預設價格', key: 'isProductLocked', options: lockStatus },
    { label: '卡券是否能更改預設價格', key: 'isTicketLocked', options: lockStatus },
    { label: '指不指定依據', key: 'designationSettingForOrderCreate', options: isDesignate },
    { label: '服務項目第三方卡券是否鎖定', key: 'isServiceBindedThirdPartTicketLocked', options: BindedThirdPartlockStatus },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>打帳單相關設定</CardTitle>
      </CardHeader>
      <CardContent>
        {settingArr.map(({ label, key, lockDate }) => {
          const isDisabled = key === 'isDateLockDisplay' && orderCreateSetting.isAbleToChangeDateTimeInOrderCreate
          return (
            <Fragment key={label}>
              <div css={styles.serviceInputGroup}>
                <CheckboxField
                  disabled={!inputEnable || isDisabled}
                  css={styles.isUsing}
                  label={label}
                  checked={orderCreateSetting[key]}
                  onChange={(e, v) => {
                    setOrderCreateSetting(
                      produce(draft => { draft[key] = v })
                    )
                  }}
                />
              </div>
              {lockDate ? lockDate() : ''}
            </Fragment>
          )
        })}
        {optionArr.map(({label, key, options}) => (
          <div key={label} css={styles.serviceInputGroup}>
            <div className="flex flex-wrap items-center gap-2 p-2">
              <Field label={label}>
                <NativeSelect
                  disabled={!inputEnable}
                  fullWidth={false}
                  css={styles.orderCreateField}
                  value={orderCreateSetting[key]}
                  onChange={e => {
                    setOrderCreateSetting(
                      produce(draft => { draft[key] = e.target.value })
                    )
                  }}
                >
                  {options.map((data, idx) => (
                    <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default memo(AboutOrderCreate)
