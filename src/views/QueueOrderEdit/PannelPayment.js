/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { formatMoney } from 'ui/format'
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
    <Accordion expanded={expanded}>
      <AccordionSummary
        data-testid="panelPayment"
        onClick={handleAccordionClick}
        // 收合時顯示已填的扣入金／其他付款金額（只讀帳單資料，不參與計算或送出）
        summaryMeta={!expanded && [
          bill.walletPay > 0 ? `扣入金 ${formatMoney(bill.walletPay)}` : '',
          bill.amountByOtherPay > 0 ? `${bill.payType[0] || '其他付款'} ${formatMoney(bill.amountByOtherPay)}` : '',
        ].filter(Boolean).join(' · ')}
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
