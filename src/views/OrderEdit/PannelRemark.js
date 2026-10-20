/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import React from 'react'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Remark from './Remark'

const styles = {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '16px !important',
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
        <p className="m-0" css={styles.heading}>備註及來源</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          <Remark />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
