import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { formatMoney } from 'ui/format'
import { useContext, useEffect, useState } from 'react'
import billContext from 'context/keyInContext'

import Payment from './Payment'

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
        <p className="m-0 text-[16px] font-bold text-text">其他付款方式</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <Payment />
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
