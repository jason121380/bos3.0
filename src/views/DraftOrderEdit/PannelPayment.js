import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import React from 'react'
import billContext from 'context/keyInContext'

import Payment from './Payment'

export default function PannelCouponUse() {
  const { bill } = React.useContext(billContext)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (bill.payType.length === 1 || bill.amountByOtherPay > 0 || bill.walletPay > 0) {
      setExpanded(true)
    }
  }, [bill.payType])
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        data-testid="panelPayment"
        onClick={handleAccordionClick}
      >
        <p className="m-0 !text-[16px] font-bold text-[rgb(var(--text))]">其他付款方式</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <Payment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
