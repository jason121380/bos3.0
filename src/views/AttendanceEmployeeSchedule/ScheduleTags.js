/** @jsxImportSource @emotion/react */
import { Button, Grid, Typography } from '@mui/material'
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
    <Grid container alignItems="center" className="ScheduleTags" spacing={1}>
      <Grid item xs={12}>
        <div style={{ marginRight: '20px' }} key="考勤班別">考勤班別 :</div>
        <div style={{ gap: '10px', display: 'flex', flexWrap: 'wrap' }} key="colorButtonGroup">
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
                      boxShadow: '0 0 0 2px #1A73E8 !important',
                    }
                  })}
                >
                  <Grid>
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
                  </Grid>
                </Button>
              )
            })
          ) : (
            <Typography component="h1" variant="h3">
              無資料
            </Typography>
          )}
        </div>
      </Grid>
    </Grid>
  )
}

export default ScheduleTags
