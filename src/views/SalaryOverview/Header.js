/** @jsxImportSource @emotion/react */
import {
  Button,
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { startOfDay, subMonths, format } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  }),
  calendar: css({
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    backgroundColor: 'transparent',
    padding: '0 8px',
  }),
  pillButton: css({
    backgroundColor: 'transparent !important',
    color: '#212121 !important', // 改為深灰色，與帳單列一致
    border: 'none !important',
    borderRadius: '50px !important',
    fontSize: '15.5px !important',
    fontWeight: '700 !important',
    padding: '6px 4px !important',
    minWidth: 'auto !important',
    height: '36px !important',
    textTransform: 'none !important',
    boxShadow: 'none !important',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04) !important', // 灰色的微光懸停
    }
  }),
  dateDisplay: css({
    backgroundColor: '#ffffff !important',
    color: '#212121 !important', // 選中項也改為深灰色
    border: 'none !important',
    borderRadius: '50px !important',
    fontSize: '15.5px !important',
    fontWeight: '700 !important',
    padding: '6px 20px !important',
    minWidth: '100px !important',
    height: '38px !important',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06) !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1) !important',
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

  const handleToThisMonth = () => {
    const date = startOfDay(new Date()).getTime()
    onChange(date)
  }

  const handleToLastMonth = () => {
    const date = subMonths(startOfDay(new Date()), 1).getTime()
    onChange(date)
  }

  return (
    <div {...rest} css={styles.root}>
      {/* 日期選擇器 */}
      <div css={styles.calendar}>
        <Button css={styles.pillButton} onClick={() => handleToLastMonth()}>
          上個月
        </Button>
        <Button css={styles.pillButton} onClick={() => handleToThisMonth()}>
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
            field: (inputProps) => (
              <Button onClick={inputProps.onClick} css={styles.dateDisplay} >
                {format(inputProps.value, inputProps.format)}
              </Button>
            )
          }}
        />
      </div>
    </div>
  )
}

export default Header
