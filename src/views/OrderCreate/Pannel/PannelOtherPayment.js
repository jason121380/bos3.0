import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import OtherPayment from 'views/OrderCreate/OtherPayment'

const styles = {
  details: 'overflow-x-auto',
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
}

export default function PannelOtherPayment({ expanded, onPanelClick }) {
  return (
    <Accordion key="panelOtherPayment" expanded={expanded}>
      <AccordionSummary onClick={onPanelClick}>
        <p className={`m-0 ${styles.heading}`}>其他付款方式(線上版)</p>
      </AccordionSummary>
      <AccordionDetails className={styles.details}>
        <div className={styles.fieldOutter}>
          <OtherPayment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
