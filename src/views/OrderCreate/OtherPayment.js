import { Button } from 'ui/button-compat'
import billContext from 'context/keyInContext'
import React from 'react'

const styles = {
  payment: 'flex items-center justify-start mb-[24px]',
  linePay: 'text-white hover:bg-[#00c300] hover:text-white hover:opacity-80',
}

export default function Payment() {
  const { bill, handleBillChange } = React.useContext(billContext)
  return (
    <div className={styles.payment}>
      <Button
        className={styles.linePay}
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
