import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import React from 'react'
import billContext from 'context/keyInContext'

import Remark from './Remark'


export default function PannelRemark() {
  const { bill } = React.useContext(billContext)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (bill.remark !== '' || bill.source !== null) {
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
        style={{ width: '100%' }}
      >
        <p className="m-0 !text-[16px] font-bold text-text">備註及來源</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <Remark />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
