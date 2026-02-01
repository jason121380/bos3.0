/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, Fragment } from 'react'
import {
  DialogContent, DialogTitle, Button, Divider, DialogActions,
  createTheme, ThemeProvider
} from '@mui/material'
import { cloneDeep } from 'lodash'
import { format } from 'date-fns'
import { green, grey } from '@mui/material/colors'
import { openSnackbar } from 'elements/snackbars'
import useFetchSetAdminBookingTimes from 'hooks/useFetchSetAdminBookingTimes'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  content: css({
    display: 'flex',
    gap: '5px 10px',
    flexWrap: 'wrap',
  }),
  cancel: css({
    background: 'red',
    color: 'white'
  })
}

const theme = createTheme({
  palette: {
    primary: {
      main: green[400] + '!important'
    },
    secondary: {
      main: grey[400] + '!important'
    },
  }
})

export default function HolidayEdit({ holidayData, setHolidayData, setHolidayModel, refetchData }) {
  const { setTimes } = useFetchSetAdminBookingTimes()
  const [timeOption, setTimeOption] = useState([])
  const [isClick, setIsClick] = useState(false)
  const { startTime, endTime, designerId } = holidayData

  useEffect(() => {
    const option = []
    for (let i = startTime; i < endTime; i += 1800000) {
      option.push({
        time: i,
        select: true
      })
    }
    setTimeOption(option)
    return () => {
      setHolidayData({})
      setTimeOption([])
      setIsClick(false)
    }
  }, [])

  const handleSelectTime = (value, index) => {
    const newOption = cloneDeep(timeOption)
    newOption[index].select = value
    setTimeOption(newOption)
  }

  const handleOnClose = () => {
    !isClick && setHolidayModel(false)
  }

  const handleSetHoliday = async () => {
    const time = []
    setIsClick(true)
    timeOption.forEach(d => {
      if (!d.select) {
        time.push(d.time)
      }
    })
    try {
      const res = await setTimes({
        input: {
          designerId: designerId,
          datetimes: time,
          appointable: true
        }
      })
      if (res.data.adminBookingTimes) {
        openSnackbar({
          message: '編輯成功',
          variant: 'success'
        })
        handleOnClose()
        refetchData()
      } else {
        openSnackbar({
          message: '編輯失敗',
          variant: 'warning'
        })
        setIsClick(false)
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  return (
    <Fragment>
      <DialogTitle>編輯公休</DialogTitle>
      <Divider />
      <DialogContent css={styles.content} dividers style={{ border: 'none' }}>
        <ThemeProvider theme={theme}>
          {timeOption.map(({ time, select }, i) => (
            <Button
              style={{ color: 'white' }}
              key={time}
              variant='contained'
              color={select ? 'primary' : 'secondary'}
              onClick={() => handleSelectTime(!select, i)}
            >{format(time, 'HH:mm')}</Button>
          ))}
        </ThemeProvider>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' disabled={isClick} color='primary' onClick={handleSetHoliday}>確定</Button>
        <Button variant='contained' disabled={isClick} onClick={handleOnClose}>取消</Button>
      </DialogActions>
    </Fragment>
  )
}
