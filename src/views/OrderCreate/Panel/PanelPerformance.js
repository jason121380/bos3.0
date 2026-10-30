import billContext from 'context/keyInContext'
import React, { Fragment, useContext } from 'react'
import idx from 'idx'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { SummaryDetails, SummaryTotals, StickySummaryBar } from 'views/OrderShared/BillSummary'
import billPaymentSummary from 'helper/billPaymentSummary'

function PanelPerformance() {
    const { bill } = useContext(billContext)

    const customerTicketRecords = useFetchTicketRecords({
        ids: bill.useTicketOrders.map(d => d.customerTicketId),
    })

    // 包含第三方卡券的金額總計
    const serviceTotalPrice = bill.serviceOrders
        .map(d => d.price)
        .reduce((total, item) => (total = total + item), 0)

    const merchantSellTotalPrice = bill.productOrders.reduce(
        (total, item) => (total = total + item.price * item.count),
        0
    )
    const couponSellPrice = bill.ticketOrders.reduce(
        (total, item) => (total = total + item.price * item.count),
        0
    )
    const merberShipCardTotalPrice = bill.membershipOrders.reduce(
        (total, item) => (total = total + item.price),
        0
    )
    const couponUsageTotalPrice = idx(customerTicketRecords, _ =>
        _.data.ticketRecords.data.reduce((total, item) => (total = total + item.price), 0)
    ) ?? 0

    // 業績合計、現金應收：運算式與舊版相同，只是算一次，下方彙總卡與底部固定列共用同一個值。
    // 原本另加「賣卡券先入業績」（intoPerformanceWhileBuying）的金額：打帳單沒有任何地方把它設為 true
    // （新列、清除、從清單選擇都帶 false），這一項永遠是 0，已移除
    const performanceTotal = Math.round(
        serviceTotalPrice +
        merchantSellTotalPrice +
        couponUsageTotalPrice +
        merberShipCardTotalPrice
    )
    // 現金應收：與明細彈窗、收據共用 billPaymentSummary（同一公式）
    const { cashDue } = billPaymentSummary(bill)

    // 金額彙總：各數值的運算式與舊版相同；畫面（千分位、排版、底部固定列）與其他三頁共用 OrderShared/BillSummary
    const details = (
        <SummaryDetails
            spending={[
                { label: '服務消費', value: serviceTotalPrice },
                { label: '店販消費', value: merchantSellTotalPrice },
                { label: '預收卡販賣', value: couponSellPrice },
                { label: '使用預收卡', value: Math.round(couponUsageTotalPrice) },
                { label: '會員卡販賣', value: merberShipCardTotalPrice },
            ]}
            payments={[
                { label: '扣入金', value: bill.walletPay },
                { label: '其他付款方式', value: bill.amountByOtherPay },
                { label: '紅利點數折抵', value: bill.bonusDecount },
            ]}
        />
    )
    return (
        <Fragment>
        <Card className="ui-root w-full self-start max-sm:hidden">
            <CardHeader>
                <CardTitle>金額彙總</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-2 max-sm:grid-cols-1">
                {details}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 border-0 border-t border-solid border-border px-5 py-4">
                <SummaryTotals performanceTotal={performanceTotal} cashDue={cashDue} />
            </div>
        </Card>
        {/* 底部固定列：手機版（< 640px）不顯示上方彙總卡，改由固定列左側展開鈕往上展開完整明細 */}
        <StickySummaryBar
            detailsId="order-summary-details"
            details={details}
            performanceTotal={performanceTotal}
            cashDue={cashDue}
        />
        </Fragment>
    )
}

export default React.memo(PanelPerformance)
