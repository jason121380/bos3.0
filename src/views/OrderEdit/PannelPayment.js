import { Card, CardContent } from 'ui/card'
import React from 'react'
import billContext from 'context/keyInContext'

import Payment from './Payment'


export default function PannelCouponUse() {
  const { bill } = React.useContext(billContext)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (bill.payType.length === 1 || bill.amountByOtherPay > 0 || bill.walletPay > 0) {
      setExpanded(true)
    }
  }, [bill.payType])
  // 付款／備註改為與打帳單相同的常駐卡片（不可收合）：原本的展開 state、自動展開 effect 與 handler 依規則保留不刪，
  // expanded 仍標在卡片的 data-state（與原 Accordion 根節點相同）；收合時內容本來就保持掛載，改常駐不影響查詢與副作用
  // eslint-disable-next-line no-unused-vars
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Card data-state={expanded ? 'open' : 'closed'}>
      <CardContent>
        <p data-testid="panelPayment" className="m-0 mb-3 flex items-center !text-[16px] font-bold text-text">其他付款方式</p>
        <div className="flex flex-col items-start justify-start">
          <Payment />
        </div>
      </CardContent>
    </Card>
  )
}
