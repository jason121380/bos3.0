import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import produce from 'immer'

const settings = [
  {
    label: '已取消預約自動提醒，檢查未來15分鐘內是否包含下一組預約區間',
    key: 'isDoneBookingAutoNotify',
  },
  {
    label: '未完成預約自動提醒，提醒下一順位預約顧客本預約未完成、完成後會再另行通知',
    key: 'isUnDoneBookingAutoNotify',
  },
  {
    label: '未完成預約手動提醒，通知下一順位預約顧客「當下時間+設計師輸入時間」的時間點再到店',
    key: 'isUnDoneBookingManualNotify',
  },
]

function BookingCheckInNotificationSetting({
  className,
  inputEnable,
  checkinSettings,
  setCheckinSettings,
  bookingTypeForSocket,
  setBookingTypeForSocket,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>報到通知設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-[24px]">
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label="開啟報到通知功能"
            checked={checkinSettings.isBookingCheckinEnabled}
            onChange={(e, v) =>
              setCheckinSettings(
                produce(draft => {
                  draft.isBookingCheckinEnabled = v
                })
              )
            }
          />
        </div>
        {checkinSettings.isBookingCheckinEnabled &&
          settings.map(({ label, key }) => (
            <div key={key} className="flex items-center mb-[24px]">
              <CheckboxField
                disabled={!inputEnable}
                className="mx-[20px] my-0"
                label={label}
                checked={checkinSettings[key]}
                onChange={(e, v) =>
                  setCheckinSettings(
                    produce(draft => {
                      draft[key] = v
                    })
                  )
                }
              />
            </div>
          ))}
        <div className="flex items-center mb-[24px]">
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label="單日預約紀錄顯示待審核狀態的預約"
            checked={bookingTypeForSocket.includes('UNCHECK')}
            onChange={(e, v) => setBookingTypeForSocket(v ? ['UNCHECK', 'RESERVATION'] : ['RESERVATION'])}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(BookingCheckInNotificationSetting)
