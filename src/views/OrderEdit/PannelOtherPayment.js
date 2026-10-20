import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion-compat'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'

import OtherPayment from './OtherPayment'


export default function PannelOtherPayment() {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        style={{ width: '100%' }}
      >
        <p className="m-0 !text-[15px] font-normal">其他付款方式(線上版)</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <OtherPayment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
