/** @jsxImportSource @emotion/react */
import {
  Button, ButtonGroup, Grid, TextField, Box, CardContent,
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { startOfDay, subMonths, format } from 'date-fns'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchMerchantMonthlyCheckoutRemark from 'hooks/useFetchMerchantMonthlyCheckoutRemark'
import useFetchSettingMerchantMonthlyCheckoutRemark from 'hooks/useFetchSettingMerchantMonthlyCheckoutRemark'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  calendar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white + '!important',
    color: theme.palette.text.primary + '!important',
  }),
  calendarTodayIcon: css({
    marginRight: theme.spacing(1),
  }),
  titleInput: css({
    width: '600px',
    '& textarea': {
      padding: '0px !important'
    }
  }),
}

function Header({
  date,
  onChange,
  onCloseAccount,
  status,
  disableMonthlyCheckoutBtn,
  ...rest
}) {
  const [titleRemark, setTitleRemark] = useState('')
  const [titleRemarkDisplay, setTitleRemarkDisplay] = useState(false)
  const merchantMonthlyCheckoutRemarkData = useFetchMerchantMonthlyCheckoutRemark({ date: date })
  const {
    setMerchantMerchantMonthlyCheckoutRemark,
  } = useFetchSettingMerchantMonthlyCheckoutRemark()

  useEffect(() => {
    if (!merchantMonthlyCheckoutRemarkData.loading) {
      const titleRemark = idx(
        merchantMonthlyCheckoutRemarkData,
        _ => _.data.merchantMonthlyCheckoutRemark
      )
      if (titleRemark.length > 0) {
        setTitleRemarkDisplay(true)
      } else {
        setTitleRemarkDisplay(false)
      }
      setTitleRemark(titleRemark)
    }
  }, [merchantMonthlyCheckoutRemarkData.loading])

  const handleToThisMonth = () => {
    const date = startOfDay(new Date()).getTime()
    onChange(date)
  }

  const handleToLastMonth = () => {
    const date = subMonths(startOfDay(new Date()), 1).getTime()
    onChange(date)
  }

  const handleOnBlur = () => {
    if (titleRemark.trim().length > 0) {
      setTitleRemarkDisplay(true)
    }
  }

  const handelTitleRemarkOnChange = e => {
    setTitleRemark(e.target.value)
    setMerchantMerchantMonthlyCheckoutRemark({ date: date, remark: e.target.value })
  }
  return (
    <div {...rest} css={styles.root}>
      <Grid style={{ display: 'flex' }} className='SalaryOverviewRemark' justifyContent="space-between">
        <Grid item sm={6} xs={12}>
          {!titleRemarkDisplay ? (
            <TextField
              variant="standard"
              label="備註"
              css={styles.titleInput}
              onChange={handelTitleRemarkOnChange}
              value={titleRemark}
              multiline
              onBlur={handleOnBlur}
            />
          ) : (
            <CardContent className="titleRemark" style={{ width: 'auto' }}>
              <Box
                variant="body1"
                onClick={() => setTitleRemarkDisplay(false)}
                style={{ cursor: 'pointer', whiteSpace: 'pre-wrap', minWidth: 200 }}
              >
                {titleRemark}
              </Box>
            </CardContent>
          )}
        </Grid>
        <Grid css={styles.calendar} item sm={6} xs={12}>
          <ButtonGroup variant="contained">
            <Button css={styles.calendarButton} onClick={() => handleToLastMonth()}>
              上個月
            </Button>
            <Button css={styles.calendarButton} onClick={() => handleToThisMonth()}>
              本月
            </Button>
            <MobileDatePicker
              closeOnSelect
              format="yyyy/M"
              showToolbar={false}
              views={['year', 'month']}
              value={date}
              onChange={value => onChange(new Date(value).getTime())}
              localeText={{
                toolbarTitle: '選擇時間'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              slots={{
                field: inputProps => (
                  <Button onClick={inputProps.onClick} css={styles.calendarButton} >
                    {format(inputProps.value, inputProps.format)}
                  </Button>
                )
              }}
            />
          </ButtonGroup>
        </Grid>
      </Grid>
    </div>
  )
}

export default Header
