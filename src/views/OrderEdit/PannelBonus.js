/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import { useContext, useEffect, useState } from 'react'
import Bonus from './Bonus'
import styles from 'views/OrderCreate/styles/PannelPayment'
import billContext from 'context/keyInContext'
import { useFetchGetCustomerBonusRecordLazy } from 'hooks/useFetchGetCustomerBonusRecord'
import _ from 'lodash'

export default function PannelBonus({ bonusActive }) {
  const { bill, order, bonusConversion } = useContext(billContext)
  const [getCustomerBonusRecord, customerBonusRecordData] = useFetchGetCustomerBonusRecordLazy()
  const [customerBonus, setCustomerBonus] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }

  useEffect(() => {
    if (bill.customerId && bonusActive) {
      getCustomerBonusRecord({
        variables: {
          customerId: bill.customerId
        }
      })
    }
  }, [bill.customerId])

  useEffect(() => {
    if (!customerBonusRecordData.loading && customerBonusRecordData.data) {
      const total = customerBonusRecordData.data.customerBonusRecord.reduce((a, b) => a + b.bonus, 0)
      setCustomerBonus(total)
    }
  }, [customerBonusRecordData.loading])

  useEffect(() => {
    if (!order.loading && order.data) {
      const isExpanded = 
        order.data.order.bonusDecount > 0 ||
        order.data.order.bonusDeposit > 0 ||
        order.data.order.bonusUsed > 0

      setExpanded(isExpanded)
    }
  }, [order.loading, order.data])

  return (
    <Accordion key="panelRemark" defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleAccordionClick}
        data-testid="panelRemark"
        style={{ width: '100%' }}
      >
        <p className="m-0" css={styles.heading}>紅利點數
          <span style={{ marginLeft: '10px', fontSize: 10 }}>
            {bill.customerId ? `剩餘點數: ${customerBonus}` : ''}
          </span>
          {bonusConversion.isBonusConversion && (
            <span style={{ marginLeft: '10px', fontSize: '10px' }}>
              {`換算比率: ${bonusConversion.bonusConversionRate}`}
            </span>
          )}
        </p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          <Bonus expanded={expanded} customerBonus={customerBonus}/>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
