/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
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
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-testid="panelPayment"
        onClick={handleAccordionClick}
      >
        <Typography css={styles.heading}>備註及來源</Typography>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          <Remark />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
