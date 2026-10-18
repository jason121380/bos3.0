/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import { useContext, useEffect, useState } from 'react'
import Bonus from 'views/OrderCreate/Bonus'
import styles from 'views/OrderCreate/styles/PannelPayment'
import billContext from 'context/keyInContext'
import { useFetchGetCustomerBonusRecordLazy } from 'hooks/useFetchGetCustomerBonusRecord'
import _ from 'lodash'

export default function PannelBonus({ expanded, onPanelClick, bonusActive }) {
  const { bill, setBill, customerBonus, setCustomerBonus, bonusConversion, bonusSetting  } = useContext(billContext)
  const [getCustomerBonusRecord, customerBonusRecordData] = useFetchGetCustomerBonusRecordLazy()

  useEffect(() => {
    if (bill.customerId && bonusActive) {
      getCustomerBonusRecord({
        variables: {
          customerId: bill.customerId
        }
      })
    }
    const newBill = _.cloneDeep({
      ...bill,
      bonusDeposit: bonusSetting.isUsing ? bill.bonusDeposit : 0,
      bonusUsed: 0,
      bonusDecount: 0
    })
    setBill(newBill)
  }, [bill.customerId])

  useEffect(() => {
    if (!customerBonusRecordData.loading && customerBonusRecordData.data) {
      const total = customerBonusRecordData.data.customerBonusRecord.reduce((a, b) => a + b.bonus, 0)
      setCustomerBonus(total)
    }
    const newBill = _.cloneDeep({
      ...bill, 
    bonusDeposit: bonusSetting.isUsing ? bill.bonusDeposit : 0,
    bonusUsed: 0,
    bonusDecount: 0
  })
    setBill(newBill)
  }, [customerBonusRecordData.loading])

  return (
    <Accordion key="panelRemark" expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        style={{ width: '100%' }}
        onClick={onPanelClick}
        data-testid="panelRemark"
      >
        <p className="m-0" css={styles.heading}>紅利點數
          <span style={{ marginLeft: '10px', fontSize: '10px' }}>
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
