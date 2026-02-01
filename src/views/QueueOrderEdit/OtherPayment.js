/** @jsxImportSource @emotion/react */
import { Button } from '@mui/material'
import billContext from 'context/keyInContext'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  payment: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginRight: '12px',
    justifyContent: 'flex-start',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  linePay: css({
    color: 'white',
    '&:hover': {
      backgroundColor: '#00c300',
      color: 'white',
      opacity: 0.8,
    },
  }),
}

export default function Payment() {
  const { bill, handleBillChange } = React.useContext(billContext)
  return (
    <div css={styles.payment}>
      <Button
        css={styles.linePay}
        style={{
          backgroundColor: bill.linePay ? '#00c300' : 'rgba(0, 0, 0, 0.26)',
        }}
        onClick={() =>
          handleBillChange({
            key: 'linePay',
            value: !bill.linePay,
          })
        }
      >
        LINE Pay
      </Button>
    </div>
  )
}
