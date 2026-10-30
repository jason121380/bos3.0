// 新增／編輯付款方式共用（2026/10/30 自兩頁合併，兩份只差屬性排列順序）。
// 欄位標籤放在上方（Field＋Input／NativeSelect）；手續費類別、扣項方式的值可為空字串，NativeSelect 以 disabled 空值選項顯示提示、onChange 回原始值。
// 下拉是自家清單（不是系統選單）；Checkbox 使用 ui/checkbox
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { PaymentEnum } from 'helper/enum'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const deductions = [
  {
    label: '無扣項',
    value: 'none',
  },
  {
    label: '業績',
    value: 'onSales',
  },
  {
    label: '薪水',
    value: 'onSalary',
  },
]

function AboutProject({ className, payment, onChange, ...rest }) {
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-6">
        <Field label="名稱" className="w-full">
          <Input
            value={payment.name}
            onChange={event => onChange({ event, key: 'name' })}
            data-testid="name"
          />
        </Field>
        <Field label="手續費類別" className="w-full">
          <NativeSelect
            value={payment.amountType}
            data-testid="fee-category"
            onChange={event =>
              onChange({
                event,
                key: 'amountType',
              })
            }
          >
            <NativeSelectOption value="" disabled>
              選擇手續費類別
            </NativeSelectOption>
            {Object.keys(PaymentEnum).map(key => (
              <NativeSelectOption value={key} key={`payment-${key}`}>
                {PaymentEnum[key]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label={`手續費${payment.amountType ? ' - ' + PaymentEnum[payment.amountType] : ''}`} className="w-full">
          <Input
            type="text"
            value={payment.fee}
            onFocus={event => {
              idx(event, _ => _.target.select())
            }}
            data-testid={`fee-${PaymentEnum[payment.amountType]}`}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: payment.amountType === 'AMOUNT' ? Math.floor(idx(event, _ => _.target.value)) : idx(event, _ => _.target.value),
                  },
                },
                key: 'fee',
              })
            }
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
        <Field label="手續費扣項方式" className="w-full">
          <NativeSelect
            value={payment.type}
            data-testid="payment-deductions"
            onChange={event =>
              onChange({
                event,
                key: 'type',
              })
            }
          >
            <NativeSelectOption value="" disabled>
              選擇手續費扣項方式
            </NativeSelectOption>
            {deductions.map(data => (
              <NativeSelectOption value={data.value} key={`payment-${data.value}-${data.label}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="金額呈現為0"
          checked={payment.isNoCash}
          onChange={() => {
            onChange({
              event: {
                target: {
                  value: !payment.isNoCash,
                },
              },
              key: 'isNoCash',
            })
          }}
        />
      </CardContent>
    </Card>
  )
}

AboutProject.propTypes = {
  className: PropTypes.object,
}

export default AboutProject
