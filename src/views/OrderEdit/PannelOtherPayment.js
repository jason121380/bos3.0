/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'

import OtherPayment from './OtherPayment'

const styles = {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelOtherPayment() {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        style={{ width: '100%' }}
      >
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
