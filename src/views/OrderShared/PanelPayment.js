import { Card, CardContent } from 'ui/card'
import React from 'react'
import billContext from 'context/keyInContext'

// 帳單詳細／掛單詳細／重新開單的「其他付款方式」卡片（三頁原本各一份、逐字相同，2026/10/21 合併）。
// 卡片內的 Payment 各頁不同，由各頁 Panel 以 prop 傳入元件本身（仍在本卡片內建立元素，re-render 時機與原本相同）
export default function PanelPayment({ Payment }) {
  const { bill } = React.useContext(billContext)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (bill.payType.length === 1 || bill.amountByOtherPay > 0 || bill.walletPay > 0) {
      setExpanded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [bill.payType] 變動時執行；bill.amountByOtherPay、bill.walletPay 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [bill.payType])
  // 付款／備註改為與打帳單相同的常駐卡片（不可收合）：原本的展開 state 與自動展開 effect 保留，
  // expanded 仍標在卡片的 data-state（與原 Accordion 根節點相同）；收合時內容本來就保持掛載，改常駐不影響查詢與副作用。
  // 沒有地方呼叫的收合 handler（handleAccordionClick）2026/10/22 經 Jason 同意刪除
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
