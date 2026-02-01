/** @jsxImportSource @emotion/react */
import { Button, ButtonGroup, Grid } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { endOfDay, startOfDay, startOfMonth, endOfMonth, format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(3, 0, 3, 0),
  }),
  field: css({
    width: '150px',
    marginLeft: theme.spacing(2),
  }),
  designer: css({
    minWidth: '120px',
  }),
  calendar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
}

export default function DatePicker({
  jumpToToday,
  jumpToYesterday,
  jumpToBeforeYesterday,
  jumpToLastMonth,
  jumpToWholeMonth,
  jumpToTomorrow,
  jumpAfterToTomorrow,
  date,
  onChange,
  hideEndDate,
  hideStartDate,
  onlyMonthYear,
  displayMonth,
  inMerchantDailyReport,
  lastInLeaderBoard,
  onlyDayTime,
  futureDate
}) {

  const { startDate, endDate } = date

  const handleCalendarAccept = (date, edge) => {
    date = new Date(date).getTime()
    if (edge === 'start') {
      if (onlyMonthYear) {
        onChange({
          target: 'startDate',
          value: startOfMonth(date).getTime(),
        })
        onChange({
          target: 'endDate',
          value: endOfMonth(date).getTime(),
        })
      } else {
        onChange({
          target: 'startDate',
          value: startOfDay(date).getTime(),
        })

        if (date > endDate) {
          onChange({
            target: 'endDate',
            value: endOfDay(date).getTime(),
          })
        }
      }
    } else {
      onChange({
        target: 'endDate',
        value: endOfDay(date).getTime(),
      })

      if (date < startDate) {
        onChange({
          target: 'startDate',
          value: startOfDay(date).getTime(),
        })
      }
    }
    if (inMerchantDailyReport && onlyDayTime && edge === 'end') {
      onChange({
        target: 'startDate',
        value: startOfDay(date).getTime(),
      })
      onChange({
        target: 'endDate',
        value: endOfDay(date).getTime(),
      })
    }
  }

  const handleJumpToday = () => {
    jumpToToday()
  }
  const handleJumpYesterday = () => {
    jumpToYesterday()
  }
  const handleJumpBeforeYesterday = () => {
    jumpToBeforeYesterday()
  }
  const handleJumpLastMonth = () => {
    jumpToLastMonth()
  }
  const handleJumpWholeMonth = () => {
    jumpToWholeMonth()
  }
  const handleJumpToTomorrow = () => {
    jumpToTomorrow()
  }
  const handleJumpAfterToTomorrow = () => {
    jumpAfterToTomorrow()
  }
  return (
    <Grid container css={styles.container} className='DatePicker'>
      {displayMonth ? (
        <Grid item>
          <ButtonGroup variant="contained">
            <Button onClick={handleJumpLastMonth}>
              上個月
            </Button>
            <Button onClick={handleJumpWholeMonth}>
              本月
            </Button>
          </ButtonGroup>
        </Grid>
      ) : (
        <Grid item>
          <ButtonGroup variant="contained">
            {(!inMerchantDailyReport || !onlyDayTime) && (
              <Button onClick={handleJumpWholeMonth}>
                本月
              </Button>
            )}
            {lastInLeaderBoard && (
              <Button onClick={handleJumpLastMonth}>
                上個月
              </Button>
            )}
            {!futureDate &&
              <Button onClick={handleJumpBeforeYesterday}>
                前天
              </Button>
            }
            {!futureDate &&
              <Button onClick={handleJumpYesterday}>
                昨天
              </Button>
            }
            <Button onClick={handleJumpToday}>
              今天
            </Button>
            {futureDate &&
              <Button onClick={handleJumpToTomorrow}>
                明天
              </Button>
            }
            {futureDate &&
              <Button onClick={handleJumpAfterToTomorrow}>
                後天
              </Button>
            }
          </ButtonGroup>
        </Grid>
      )}
      <Grid item>
        <ButtonGroup variant="contained">
          {!hideStartDate && (
            <MobileDatePicker
              closeOnSelect
              label='選擇日期'
              value={startDate}
              onChange={date => handleCalendarAccept(date, 'start')}
              format={onlyMonthYear ? 'yyyy/MM' : 'yyyy/MM/dd'}
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slots={{
                field: inputProps => (
                  <Button
                    onClick={inputProps.onClick}
                    variant='contained'
                  >
                    {format(inputProps.value, inputProps.format)}
                  </Button>
                )
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                },
              }}
            />
          )}
          {!hideEndDate && (
            <MobileDatePicker
              closeOnSelect
              label='選擇日期'
              value={endDate}
              onChange={date => handleCalendarAccept(date, 'end')}
              format='yyyy/MM/dd'
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slots={{
                field: inputProps => (
                  <Button
                    onClick={inputProps.onClick}
                    variant='contained'
                  >{format(inputProps.value, inputProps.format)}</Button>
                )
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
            />
          )}
        </ButtonGroup>
      </Grid>
    </Grid>
  )
}
