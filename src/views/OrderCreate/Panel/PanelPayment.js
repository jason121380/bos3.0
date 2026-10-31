import { Card, CardContent } from 'ui/card'
import React, { useContext } from 'react'
import Payment from 'views/OrderCreate/Payment'
import billContext from 'context/keyInContext'

const styles = {
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
}

export default function PanelPayment() {
  const { bill, customerWallet } = useContext(billContext)
  return (
    <Card>
      <CardContent>
        <p className={`m-0 ${styles.heading}`} style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          其他付款方式
          <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 'normal' }}>
            {!!bill.customerId && customerWallet !== undefined ? `入金可用餘額: ${customerWallet}` : ''}
          </span>
        </p>
        <div className={styles.fieldOutter}>
          <Payment />
        </div>
      </CardContent>
    </Card>
  )
}
