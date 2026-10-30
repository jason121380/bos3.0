import { Card, CardContent } from 'ui/card'
import React, { useContext } from 'react'
import Payment from 'views/OrderCreate/Payment'
import TeachingModeContext from 'context/teachingModeContext'
import billContext from 'context/keyInContext'

const styles = {
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
  paymentTeachTitle: 'text-[0.8125rem] ml-[34px] font-bold',
}

export default function PanelPayment() {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
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
        {teachingMode && (
          <p className={`m-0 ${styles.paymentTeachTitle}`}>
            扣入金 第三方支付在這邊輸入**
          </p>
        )}
        <div className={styles.fieldOutter}>
          <Payment />
        </div>
      </CardContent>
    </Card>
  )
}
