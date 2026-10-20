import { Button } from 'ui/button'
import billContext from 'context/keyInContext'
import React from 'react'


export default function Payment() {
  const { bill, handleBillChange } = React.useContext(billContext)
  return (
    <div className="mb-6 flex items-center justify-start">
      <Button
        variant="primary"
        className="text-white hover:opacity-80"
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
