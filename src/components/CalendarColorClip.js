/** @jsxImportSource @emotion/react */
import Chip from '@mui/material/Chip'
import { css } from '@emotion/react'
import { theme } from '../theme'
import { useEffect, useState } from 'react'
import produce from 'immer'
import _ from 'lodash'

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  }),
  chip: css({
    color: 'white !important',
    borderRadius: '16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
  })
}

const checkin = [
  { label: '報到成功', color: 'green', display: true },
  { label: '未報到', color: '#78909c', display: true },
]

export default function ({
  eventDisplay = false, bookingCusCheck = false, checkinMode = false,
  bookingHistoryDisplay = false
}) {
  const [statusArray, setStatusArray] = useState([
    { label: '不可預約', color: '#414141', display: true },
    { label: '待審核', color: '#69b8dd', display: true },
    { label: '事件', color: '#95BC95', display: false },
    { label: '未來預訂 (待確認)', color: '#ff9800', display: false },
    { label: '預約成功 (不指定)', color: '#e56969', display: true },
    { label: '預約成功 (指定)', color: '#005fff', display: true },
    { label: '已完成預約', color: '#9a9a9a', display: false },
  ])
  document.querySelectorAll('.MuiChip-root').forEach(el => {
    el.classList.remove('MuiChip-root')
  })

  useEffect(() => {
    if (eventDisplay) {
      setStatusArray(
        produce(draft => {
          draft[2].display = true
        })
      )
    }
    if (bookingCusCheck) {
      setStatusArray(
        produce(draft => {
          draft[3].display = true
        })
      )
    }
    if (bookingHistoryDisplay) {
      setStatusArray(
        produce(draft => {
          draft[6].display = true
        })
      )
    }
  }, [eventDisplay, bookingCusCheck, bookingHistoryDisplay])
  
  return (
    <div css={styles.root}>
      {(checkinMode ? checkin : statusArray).map(({ label, color, display }) => display ? (
        <Chip
          label={label}
          key={label + color}
          size="small"
          css={css([styles.chip, css({ backgroundColor: color + '!important' })])}
        />
      ) : null)}
    </div>
  )
}
