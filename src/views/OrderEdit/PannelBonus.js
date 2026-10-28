import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { formatMoney } from 'ui/format'
import { useContext, useEffect, useState } from 'react'
import Bonus from './Bonus'
import billContext from 'context/keyInContext'
import { useFetchGetCustomerBonusRecordLazy } from 'hooks/useFetchGetCustomerBonusRecord'

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
    if (!order.loading && order.data?.order) {
      const isExpanded = 
        order.data.order.bonusDecount > 0 ||
        order.data.order.bonusDeposit > 0 ||
        order.data.order.bonusUsed > 0

      setExpanded(isExpanded)
    }
  }, [order.loading, order.data])

  return (
    <Accordion key="panelRemark" expanded={expanded}>
      <AccordionSummary
        onClick={handleAccordionClick}
        data-testid="panelRemark"
        style={{ width: '100%' }}
        summaryMeta={!expanded && bill.bonusDecount > 0 ? `折抵 ${formatMoney(bill.bonusDecount)}` : ''}
      >
        <p className="m-0 flex items-center !text-[16px] font-bold text-text">紅利點數
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
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <Bonus expanded={expanded} customerBonus={customerBonus}/>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
