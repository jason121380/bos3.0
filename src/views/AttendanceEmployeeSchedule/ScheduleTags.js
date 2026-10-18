/** @jsxImportSource @emotion/react */
// 班別按鈕底色為各班別自訂色（動態），沿用 MUI Button
import { Button } from '@mui/material'
import { css } from '@emotion/react'

const ScheduleTags = ({
  setTagId, tagId, fontColor, merchantClockInSchedule,
  saveData, exportExcel, exportLoading, loading, isClick, workingHourDisplay
}) => {
  const chooseScheduleTag = (id, name, color) => {
    if (id === tagId.id) {
      setTagId('')
    } else {
      setTagId({ id, name, color })
    }
  }
  const showScheduleTime = data => {
    const clockInHour = data.clockInHour.toString().padStart(2, '0')
    const clockInMinute = data.clockInMinute.toString().padStart(2, '0')
    const clockOutHour = data.clockOutHour.toString().padStart(2, '0')
    const clockOutMinute = data.clockOutMinute.toString().padStart(2, '0')
    const timeRange = clockInHour + ':' + clockInMinute + '~' + clockOutHour + ':' + clockOutMinute
    return timeRange
  }
  return (
    <div className="ScheduleTags flex items-center">
      <div className="w-full">
        <div className="mb-2 text-label text-text-secondary" key="考勤班別">考勤班別 :</div>
        <div className="flex flex-wrap gap-2.5" key="colorButtonGroup">
          {merchantClockInSchedule && merchantClockInSchedule.length > 0 ? (
            merchantClockInSchedule.map(d => {
              return (
                <Button
                  key={d.id}
                  name={d.name}
                  style={{ backgroundColor: `${d.color}` }}
                  className={tagId !== '' && d.id === tagId.id ? 'btn_focus' : 'btn'}
                  onClick={() => {
                    chooseScheduleTag(d.id, d.name, d.color)
                  }}
                  css={css({
                    borderRadius: '20px !important',
                    padding: '4px 16px !important',
                    minHeight: '40px !important',
                    '&.btn_focus': {
                      boxShadow: '0 0 0 2px rgb(var(--accent)) !important',
                    }
                  })}
                >
                  <div>
                    <div
                      style={{
                        color: `${fontColor(d.color)}`,
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '123px',
                          display: 'inline-block',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        {d.name}
                      </span>
                    </div>
                    {workingHourDisplay ?
                      <div style={{ color: `${fontColor(d.color)}`, fontSize: '11px' }}>{showScheduleTime(d)}</div> : ''}
                  </div>
                </Button>
              )
            })
          ) : (
            <span className="text-body text-text-secondary">
              無資料
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScheduleTags
