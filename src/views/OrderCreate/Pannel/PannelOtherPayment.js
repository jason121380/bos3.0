/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import OtherPayment from 'views/OrderCreate/OtherPayment'
import styles from 'views/OrderCreate/styles/PannelOtherPayment'

export default function PannelOtherPayment({ expanded, onPanelClick }) {
  return (
    <Accordion key="panelOtherPayment" expanded={expanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={onPanelClick}>
        <p className="m-0" css={styles.heading}>其他付款方式(線上版)</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          <OtherPayment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
