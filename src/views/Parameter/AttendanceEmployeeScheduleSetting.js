import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'

function AttendanceEmployeeScheduleSetting({ className, UESUsing, setUESUsing, inputEnable }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>考勤排班總表設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-[24px]">
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label="可編輯過往班別"
            checked={UESUsing}
            onChange={(e, v) => setUESUsing(v)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AttendanceEmployeeScheduleSetting)
