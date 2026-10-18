/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import { useContext, useEffect, useState } from 'react'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Payment from './Payment'

const styles = {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelCouponUse() {
  const { bill } = useContext(billContext)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (bill.payType.length === 1 || bill.amountByOtherPay > 0 || bill.walletPay > 0) {
      setExpanded(true)
    }
  }, [bill.payType])
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-testid="panelPayment"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
      >
        <p className="m-0" css={styles.heading}>其他付款方式</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          <Payment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
