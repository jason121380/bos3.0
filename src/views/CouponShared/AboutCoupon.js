// 欄位標籤統一放在欄位上方（Field＋Input／NativeSelect）。
// 下拉選項值可能是空字串或布林值（isLaunched），NativeSelect 的 onChange(event) 與 MUI Select 相容、
// event.target.value 回傳原始型別值，所以既有的 onChange 包裝原樣保留（不改用 Radix Select 的 onValueChange）
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

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
const sellOption = [
  {
    value: 'USING',
    label: '使用時入業績',
  },
  {
    value: 'SELLING',
    label: '販賣時入業績',
  },
  {
    value: 'USINGSAVEDEDUCT',
    label: '使用時入業績（扣項依販賣時設定）',
  },
]
const handlingFeeSelect = [
  {
    value: 'SELLING',
    label: '販賣時整筆扣除',
  },
  {
    value: 'USING',
    label: '每次使用時扣除',
  },
]

// 新增卡券／編輯卡券共用的「一般資訊」（2026/10/28 自兩頁合併，畫面與行為逐字保留）。
// isEdit：編輯頁原本多兩個小行為，新增頁沒有，維持原樣——
//   1. 服務類別查詢回來前下拉先顯示空白（避免帶入的類別 id 對不到選項）；
//   2. 金額、次數欄位滾動滑鼠滾輪時先移開焦點，避免滾輪改到數字。
function AboutService({ className, onChange, coupon, isEdit = false, ...rest }) {
  const serviceCategories = useFetchServiceCategories()
  const loading = isEdit && !idx(serviceCategories, _ => _.data)
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field label="代號">
          <Input value={coupon.no} onChange={event => onChange({ event, key: 'no' })} />
        </Field>
        <Field label="名稱">
          <Input value={coupon.name} onChange={event => onChange({ event, key: 'name' })} />
        </Field>
        <Field label="服務類別">
          <NativeSelect
            value={loading ? '' : coupon.ServiceCategoryId}
            onChange={event => onChange({ event, key: 'ServiceCategoryId' })}
          >
            <NativeSelectOption value="" disabled>
              選擇服務類別
            </NativeSelectOption>
            {idx(serviceCategories, _ =>
              _.data.serviceCategories.map((data, idx) => (
                <NativeSelectOption value={data.id} key={`service-category-${idx}`}>
                  {data.name}
                </NativeSelectOption>
              ))
            )}
          </NativeSelect>
        </Field>
        <Field label="價格">
          <Input
            type="number"
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => parseInt(_.target.value, 10)),
                  },
                },
                key: 'price',
              })
            }
            value={coupon.price}
            onWheel={isEdit ? () => document.activeElement.blur() : undefined}
          />
        </Field>
        <Field label="次數">
          <Input
            type="number"
            value={coupon.ticketAvailableCount}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => +_.target.value || 1),
                  },
                },
                key: 'ticketAvailableCount',
              })
            }
            onWheel={isEdit ? () => document.activeElement.blur() : undefined}
          />
        </Field>
        <Field label="打帳單是否能更改預設價格">
          <NativeSelect
            value={coupon.isLocked}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'isLocked',
              })
            }
          >
            {lockStatus.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="業績入帳模式">
          <NativeSelect
            value={coupon.performanceCalculationMode}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'performanceCalculationMode',
              })
            }
          >
            {sellOption.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="手續費扣款模式">
          <NativeSelect
            value={coupon.handlingFeeDecountMode}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'handlingFeeDecountMode',
              })
            }
          >
            {handlingFeeSelect.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="卡券上架狀態設定">
          <NativeSelect
            value={coupon.isLaunched}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'isLaunched',
              })
            }
          >
            <NativeSelectOption value={true}>上架</NativeSelectOption>
            <NativeSelectOption value={false}>下架</NativeSelectOption>
          </NativeSelect>
        </Field>
      </CardContent>
    </Card>
  )
}

AboutService.propTypes = {
  className: PropTypes.object,
  isEdit: PropTypes.bool,
}

export default AboutService
