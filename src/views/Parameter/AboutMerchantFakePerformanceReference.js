import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'

const fakePerformanceRefer = [
  {
    value: 'CASH',
    label: '實收金額',
  },
  {
    value: 'PERFORMANCE',
    label: '服務人員業績',
  },
]

function AboutMerchantFakePerformanceReference({
  className,
  setMerchantFakePerformanceRefer,
  merchantFakePerformanceRefer,
  inputEnable,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>虛業績依據設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="flex flex-wrap items-center gap-2 p-2">
            <Field label='虛業績依據'>
              <NativeSelect
                disabled={!inputEnable}
                fullWidth={false}
                className="w-[150px] flex mr-[12px]"
                value={merchantFakePerformanceRefer}
                onChange={e => setMerchantFakePerformanceRefer(e.target.value)}
              >
                {fakePerformanceRefer.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMerchantFakePerformanceReference)
