/** @jsxImportSource @emotion/react */
import { Button } from 'ui/button-compat'
import billContext from 'context/keyInContext'
import React from 'react'

import styles from './styles/OtherPayment'

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
