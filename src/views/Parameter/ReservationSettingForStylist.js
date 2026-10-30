import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'

function ReservationSettingForStylist({ className, inputEnable, CBRDStylist, setCBRDStylist }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>預約設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label="預約總覽顯示顧客備註"
            checked={CBRDStylist}
            onChange={(e, v) => setCBRDStylist(v)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(ReservationSettingForStylist)
