import { Switch } from 'ui/switch'
import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import React, { useState, Fragment } from 'react'
import { useHistory } from 'react-router'
import useFetchCreateMembership from 'hooks/useFetchCreateMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { useFetchGetMemberships } from 'hooks/useFetchGetMembership'
import { CirclePicker } from 'react-color'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input, Textarea } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { PageHeader } from 'ui/page-header'

// 色票浮層：沿用舊版置中固定定位（CirclePicker 接受 className）
const colorPickerClass =
  'fixed left-1/2 top-1/2 z-[1400] box-content -translate-x-1/2 -translate-y-1/2 rounded-md border border-solid border-border-strong bg-background pb-3 pl-5 pr-3 pt-5 shadow-float'
// 顏色預覽按鈕：背景色由 style 帶入目前色碼
const swatchClass = 'h-9 w-16 shrink-0 rounded-md border border-solid border-border-strong p-0'

//isLocked
const lockStatus = [
  {
    value: 'TRUE',
    label: '不可更改',
  },
  {
    value: 'FALSE',
    label: '可更改',
  },
  {
    value: 'UNSET',
    label: '依系統參數設定',
  },
]
// 抽成
const commissionWay = [
  { label: '固定金額', value: 'fixed' },
  { label: '依售價-成本(%)', value: 'byCost' },
  { label: '售價(%)', value: 'byPrice' },
]

export default function MemberCardCreate() {
  const history = useHistory()
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // 是否顯示抽成的card
  const [forSale, setForSale] = useState(false)

  // 宣告新增會員卡mutation
  const { createMembership } = useFetchCreateMembership()

  // 拿到會員卡
  const memberships = useFetchGetMemberships({
    categoryUUIds: [],
    keyword: '',
    pageLimit: 50,
    pageOffset: 0,
  })

  // 拿到會員卡類別
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )

  // 拿店家id
  const merchantId = localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null

  // 儲存要新增的值
  const [submitValue, setSubmitValue] = useState({
    cost: 0,
    sellPrice: 0,
    employeePrice: 0,
    no: '',
    name: '',
    MembershipCategoryUUID: '',
    commissionWay: 'fixed',
    commission: 0,
    isAvailableForSale: forSale,
    isLocked: 'UNSET',
    effecitveDay: 0,
    color: '#FFFFFF',
    textColor: '#FFFFFF',
    image: '',
    comment: '',
  })
  const [colorData, setColorData] = useState(submitValue.color)
  const [colorTextData, setColorTextData] = useState(submitValue.textColor)

  // 按新增
  const handleSubmit = () => {
    //如果抽成card關掉就把抽成的欄位拿掉
    try {
      // 不販售時送出的抽成一律清回固定 0（Jason 2026/10/22 授權修正：原本只 setState，送出的仍是同一次 render 的舊抽成）
      const saleFields = forSale ? {} : { commissionWay: 'fixed', commission: 0, isAvailableForSale: false }
      if (!forSale) {
        setSubmitValue({ ...submitValue, ...saleFields })
      }
      if (parseInt(submitValue.effecitveDay, 10) < 0) {
        openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
      } else {
        createMembership({
          ...submitValue,
          ...saleFields,
          OfficialBrandMerchantId: merchantId,
        })
          .then(() => {
            openSnackbar({ message: '成功會員卡', variant: 'success' })
            memberships.refetch()
            history.push('/member-card-record')
          })
          .catch(err => {
            openSnackbar({ message: err.message, variant: 'error' })
          })
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  //disable 新增
  const valid = !(submitValue.no && submitValue.name && submitValue.MembershipCategoryUUID)
  // 停用原因（STYLE.md §6）：依上方 valid 的三個必填欄位
  const missingFields = [!submitValue.no && '代號', !submitValue.name && '名稱', !submitValue.MembershipCategoryUUID && '會員卡類別'].filter(Boolean)

  return (
    <Page className="ui-root" title="新增會員卡">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader title="新增會員卡" className="pb-0" />
        <Card>
          <CardHeader>
            <CardTitle>一般資訊</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* data-testid、required 原本經 inputProps 傳到 input，現直接放在原生 input 上 */}
            <Field label="代號" required>
              <Input name="no" data-testid="no" required="代號 為必填" onChange={e => setSubmitValue({ ...submitValue, no: e.target.value })} />
            </Field>
            <Field label="名稱" required>
              <Input name="name" data-testid="name" required="名稱 為必填" onChange={e => setSubmitValue({ ...submitValue, name: e.target.value })} />
            </Field>
            <Field label="會員卡類別" required>
              <NativeSelect
                name="MembershipCategoryUUID"
                value={submitValue.MembershipCategoryUUID}
                data-testid="btn"
                onChange={event => {
                  setSubmitValue({ ...submitValue, MembershipCategoryUUID: event.target.value })
                }}
              >
                {categories != null &&
                  categories.map((data, idx) => (
                    <NativeSelectOption key={`${data.uuid}-${idx}`} value={data.uuid}>
                      {data.no} / {data.name}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </Field>
            <Field label="有效天數">
              <Input
                type="number"
                name="effecitveDay"
                onChange={event => {
                  setSubmitValue({ ...submitValue, effecitveDay: parseInt(event.target.value, 10) })
                }}
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <div className="flex items-center gap-2">
              <span className="text-label text-text">是否可販售</span>
              <Switch
                name="isAvailableForSale"
                checked={forSale}
                onChange={() => {
                  setForSale(!forSale)
                  setSubmitValue({ ...submitValue, isAvailableForSale: !forSale })
                }}
              />
            </div>
            {forSale && (
              <Field label="會員卡價格">
                <Input
                  type="number"
                  name="sellPrice"
                  onChange={event => {
                    setSubmitValue({ ...submitValue, sellPrice: parseFloat(event.target.value) })
                  }}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            )}
            <Field label="成本價格">
              <Input
                type="number"
                name="cost"
                onChange={event => {
                  setSubmitValue({ ...submitValue, cost: parseFloat(event.target.value) })
                }}
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <Field label="員工自購價格">
              <Input
                type="number"
                name="employeePrice"
                onChange={event => {
                  setSubmitValue({ ...submitValue, employeePrice: parseFloat(event.target.value) })
                }}
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <Field label="會員卡的顏色">
              <div className="flex items-center gap-2.5">
                <Input
                  className="w-60"
                  name="color"
                  value={submitValue.color}
                  onChange={event => {
                    setSubmitValue({ ...submitValue, color: event.target.value })
                  }}
                />
                <Button
                  aria-label="選擇會員卡的顏色"
                  className={swatchClass}
                  style={{
                    background: `${submitValue.color}`,
                  }}
                  onClick={() => {
                    setShowColorPicker(true)
                    setColorData(submitValue.color)
                  }}
                />
                {showColorPicker && (
                  <Fragment>
                    <CirclePicker
                      className={colorPickerClass}
                      disableAlpha
                      color={colorData}
                      onChange={event => {
                        setColorData(event.hex)
                        setSubmitValue({ ...submitValue, color: event.hex })
                        setShowColorPicker(false)
                      }}
                    />
                  </Fragment>
                )}
              </div>
            </Field>
            <Field label="會員卡文字的顏色">
              <div className="flex items-center gap-2.5">
                <Input
                  className="w-60"
                  name="textColor"
                  value={submitValue.textColor}
                  onChange={event => {
                    setSubmitValue({ ...submitValue, textColor: event.target.value })
                  }}
                />
                <Button
                  aria-label="選擇會員卡文字的顏色"
                  className={swatchClass}
                  style={{
                    background: `${submitValue.textColor}`,
                  }}
                  onClick={() => {
                    setShowTextColorPicker(true)
                    setColorTextData(submitValue.textColor)
                  }}
                />
                {showTextColorPicker && (
                  <Fragment>
                    <CirclePicker
                      className={colorPickerClass}
                      disableAlpha
                      color={colorTextData}
                      onChange={event => {
                        setColorTextData(event.hex)
                        setSubmitValue({ ...submitValue, textColor: event.hex })
                        setShowTextColorPicker(false)
                      }}
                    />
                  </Fragment>
                )}
              </div>
            </Field>
            <Field label="圖片">
              <Input
                name="image"
                onChange={event => {
                  setSubmitValue({ ...submitValue, image: event.target.value })
                }}
              />
            </Field>
            <Field label="會籍說明">
              <Textarea
                name="comment"
                rows={4}
                onChange={event => {
                  setSubmitValue({ ...submitValue, comment: event.target.value })
                }}
              />
            </Field>
            <Field label="打帳單是否能更改預設價格">
              <NativeSelect
                name="isLocked"
                value={submitValue.isLocked}
                onChange={event => {
                  setSubmitValue({ ...submitValue, isLocked: event.target.value })
                }}
              >
                {lockStatus.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </CardContent>
        </Card>
        {forSale && (
          <Card>
            <CardHeader>
              <CardTitle>抽成</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="抽成方式">
                <NativeSelect
                  name="commissionWay"
                  value={submitValue.commissionWay}
                  onChange={event => {
                    setSubmitValue({ ...submitValue, commissionWay: event.target.value })
                  }}
                >
                  {commissionWay.map((data, idx) => (
                    <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={submitValue.commissionWay === 'byCost' || submitValue.commissionWay === 'byPrice' ? '抽成數字%' : '抽成數字'}>
                <Input
                  type="number"
                  name="commission"
                  onChange={event => {
                    setSubmitValue({ ...submitValue, commission: parseFloat(event.target.value) })
                  }}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </CardContent>
          </Card>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {valid && (
            <p id="member-card-create-missing" role="status" className="text-caption text-text-secondary">
              {`尚缺：${missingFields.join('、')}`}
            </p>
          )}
          <Button
            variant="primary"
            type="submit"
            data-testid="submit"
            onClick={() => handleSubmit()}
            disabled={valid}
            aria-describedby={valid ? 'member-card-create-missing' : undefined}
          >
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}
