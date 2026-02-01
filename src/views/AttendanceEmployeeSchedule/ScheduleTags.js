/** @jsxImportSource @emotion/react */
import { Button, Grid, Typography } from '@mui/material'

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
      <Grid sm={11} item>
        <div style={{ marginRight: '20px' }} key="考勤班別">考勤班別 :</div>
        <div style={{ gap: '10ox' }} key="colorButtonGroup">
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
                >
                  <Grid>
                    <div 
                      style={{ 
                        color: `${fontColor(d.color)}` ,
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span 
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '123px',
                          display: 'inline-block',
                        }}
                      >
                        {d.name}
                      </span>
                    </div>
                    {workingHourDisplay ?
                      <div style={{ color: `${fontColor(d.color)}` }}>{showScheduleTime(d)}</div> : ''}
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
      <Grid sm={1} item style={{ justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
        <Button disabled={loading || exportLoading} variant="outlined" color="primary" onClick={exportExcel}>
          匯出
        </Button>
        <Button disabled={loading || isClick} variant="contained" color="primary" onClick={saveData}>
          儲存
        </Button>
      </Grid>
    </Grid>
  )
}

export default ScheduleTags
