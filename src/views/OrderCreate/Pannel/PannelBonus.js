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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [bill.customerId, setBill] 變動時執行；bill、bonusActive、bonusSetting.isUsing、getCustomerBonusRecord 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [bill.customerId, setBill])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [customerBonusRecordData.loading, setBill, setCustomerBonus] 變動時執行；bill、bonusSetting.isUsing、customerBonusRecordData.data 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [customerBonusRecordData.loading, setBill, setCustomerBonus])

  return (
    <Accordion key="panelRemark" expanded={expanded}>
      <AccordionSummary
        style={{ width: '100%' }}
        onClick={onPanelClick}
        summaryMeta={!expanded && bill.bonusDecount > 0 ? `折抵 ${formatMoney(bill.bonusDecount)}` : ''}
        data-testid="panelRemark"
      >
        <p className={`m-0 ${styles.heading}`}>紅利點數
          <span className="ml-2.5 text-caption">
            {bill.customerId ? `剩餘點數: ${customerBonus}` : ''}
          </span>
          {bonusConversion.isBonusConversion && (
            <span className="ml-2.5 text-caption">
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
