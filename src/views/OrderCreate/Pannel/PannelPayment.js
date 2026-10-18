/** @jsxImportSource @emotion/react */
import { Card, CardContent } from '@mui/material'
import React, { useContext } from 'react'
import Payment from 'views/OrderCreate/Payment'
import styles from 'views/OrderCreate/styles/PannelPayment'
import TeachingModeContext from 'context/teachingModeContext'
import billContext from 'context/keyInContext'

export default function PannelPayment({ expanded }) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const { bill, customerWallet } = useContext(billContext)
  return (
    <Card>
      <CardContent>
        <p className="m-0" css={styles.heading} style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          其他付款方式
          <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 'normal' }}>
            {!!bill.customerId && customerWallet !== undefined ? `入金可用餘額: ${customerWallet}` : ''}
          </span>
        </p>
        {teachingMode && (
          <p className="m-0" css={styles.paymentTeachTitle}>
            扣入金 第三方支付在這邊輸入**
          </p>
        )}
        <div css={styles.fieldOutter}>
          <Payment expanded={expanded} />
        </div>
      </CardContent>
    </Card>
  )
}
