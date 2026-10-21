// 數字欄位（onWheel 失焦、onFocus 全選）保留 MUI TextField
import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import produce from 'immer'


function NonDesignationBookingLimitSetting({
  className, inputEnable, aboutBooking, setAboutBooking
}) {
  const handleInputChange = (event, key) => {
    setAboutBooking(
      produce( draft => {
        draft[key] = parseInt(event.target.value === "" ? 0 : Math.abs(event.target.value), 10)
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>同時段預約人數上限</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ gap: 12, flexWrap: 'wrap' }} className="flex items-center mb-[24px]">
          <TextField
            disabled={!inputEnable || aboutBooking.isDynamicBookingLimitUsing}
            variant="outlined"
            label="不指定人數"
            type="number"
            value={aboutBooking.nonDesignationOrderLimit}
            onChange={event => handleInputChange(event, 'nonDesignationOrderLimit')}
            onFocus={e => e.target.select()}
            onWheel={() => document.activeElement.blur()}       
          />
          <CheckboxField
            disabled={!inputEnable}
            label='浮動式預約人數上限'
            checked={aboutBooking.isDynamicBookingLimitUsing}
            onChange={(e, v) => {
              setAboutBooking(
                produce(draft => { draft.isDynamicBookingLimitUsing = v })
              )
            }}
          />
        </div>
        <div className="flex items-center mb-[24px]">
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="指定人數"
            type="number"
            value={aboutBooking.designationOrderLimit}
            onChange={event => handleInputChange(event, 'designationOrderLimit')}
            onFocus={e => e.target.select()}
            onWheel={() => document.activeElement.blur()}              
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(NonDesignationBookingLimitSetting)
