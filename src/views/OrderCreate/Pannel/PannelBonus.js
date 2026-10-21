import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { useContext, useEffect, useState } from 'react'
import Bonus from 'views/OrderCreate/Bonus'
import { formatMoney } from 'ui/format'
import billContext from 'context/keyInContext'
import { useFetchGetCustomerBonusRecordLazy } from 'hooks/useFetchGetCustomerBonusRecord'
import cloneDeep from 'lodash/cloneDeep'

const styles = {
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  details: 'overflow-x-auto',
  fieldOutter: 'flex justify-start items-start flex-col',
}

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
    const newBill = cloneDeep({
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
    const newBill = cloneDeep({
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
        style={{ width: '100%' }}
        onClick={onPanelClick}
        summaryMeta={!expanded && bill.bonusDecount > 0 ? `折抵 ${formatMoney(bill.bonusDecount)}` : ''}
        data-testid="panelRemark"
      >
        <p className={`m-0 ${styles.heading}`}>紅利點數
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
      <AccordionDetails className={styles.details}>
        <div className={styles.fieldOutter}>
          <Bonus expanded={expanded} customerBonus={customerBonus}/>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
