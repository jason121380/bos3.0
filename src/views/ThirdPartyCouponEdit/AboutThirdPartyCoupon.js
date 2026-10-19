// 欄位標籤放在上方（Field＋Input／NativeSelect）；扣項方式的值可為空字串，NativeSelect 以 disabled 空值選項顯示提示、onChange 回原始值。
// 原「保留 MUI Select／TextField」註記已由 Jason 同意推翻，比照 ThirdPartyCouponCreate 改版；Checkbox 保留 MUI
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const thirdPartyCouponDeductionType = [
  {
    label: '百分比',
    value: 'PERCENT',
  },
  {
    label: '固定金額',
    value: 'AMOUNT',
  },
]

function AboutThirdPartyCoupon({ className, thirdPartyCoupon, onChange, ...rest }) {
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-6">
        <Field label="名稱" className="w-full">
          <Input
            value={thirdPartyCoupon.name}
            onChange={event => onChange({ event, key: 'name' })}
            data-testid="name"
          />
        </Field>
        <Field label="手續費" className="w-full">
          <Input
            type="number"
            value={thirdPartyCoupon.handlingFee}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => parseFloat(_.target.value)),
                  },
                },
                key: 'handlingFee',
              })
            }
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
        <Field label="手續費扣項方式" className="w-full">
          <NativeSelect
            value={thirdPartyCoupon.type}
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
            {thirdPartyCouponDeductionType.map(key => (
              <NativeSelectOption value={key.value} key={`thirdPartyCoupon-${key.value}`}>
                {key.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="金額呈現為0"
          checked={thirdPartyCoupon.isNoCash}
          onChange={() => {
            onChange({
              event: {
                target: {
                  value: !thirdPartyCoupon.isNoCash,
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

AboutThirdPartyCoupon.propTypes = {
  className: PropTypes.object,
}

export default AboutThirdPartyCoupon
