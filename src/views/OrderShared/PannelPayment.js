import { Card, CardContent } from 'ui/card'
import React from 'react'
import billContext from 'context/keyInContext'

// 帳單詳細／掛單詳細／重新開單的「其他付款方式」卡片（三頁原本各一份、逐字相同，2026/10/21 合併）。
// 卡片內的 Payment 各頁不同，由各頁 Pannel 以 prop 傳入元件本身（仍在本卡片內建立元素，re-render 時機與原本相同）
export default function PannelPayment({ Payment }) {
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
