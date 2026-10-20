import billContext from 'context/keyInContext'
import React, { Fragment, useContext, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import idx from 'idx'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatMoney, formatNumber } from 'ui/format'

function PannelPerformance() {
    const { bill } = useContext(billContext)
    // 手機版：金額彙總明細收在底部固定列，點展開鈕往上展開（Jason 2026/10/20）
    const [summaryOpen, setSummaryOpen] = useState(false)

    const customerTicketRecords = useFetchTicketRecords({
        ids: bill.useTicketOrders.map(d => d.customerTicketId),
    })

    // 沒選第三方卡券的服務的price array
    const serviceTotalPriceArray = idx(bill, _ =>
        _.serviceOrders.map(d => (typeof d.thirdPartyCouponMerchantId !== 'string' ? d.price : 0))
    )
    // 沒選第三方卡券的商品的price array
    const productTotalPriceArray = idx(bill, _ =>
        _.productOrders.map(d =>
            typeof d.thirdPartyCouponMerchantId !== 'string' ? d.price * d.count : 0
        )
    )
    // 賣卡券先入業績的price array
    const ticketOrdersWithIntoPerformPriceArray = idx(bill, _ =>
        _.ticketOrders.map(d => (d.intoPerformanceWhileBuying ? d.price * d.count : 0))
    )
    // 沒第三方卡券會員卡price array
    const memberShipCardWithIntoPerformPriceArray = idx(bill, _ =>
        _.membershipOrders.map(d => (typeof d.thirdPartyCouponMerchantId !== 'string' ? d.price : 0))
    )

    // 沒有第三方卡券服務的價格合計
    const serviceTotalPriceWithoutThirdPartyCoupon = serviceTotalPriceArray.reduce(
        (total, item) => (total = total + item),
        0
    )
    // 沒有第三方卡券商品的價格合計
    const productTotalPriceWithoutThirdPartyCoupon = productTotalPriceArray.reduce(
        (total, item) => (total = total + item),
        0
    )
    // 賣卡先入業績的價格合計
    const ticketOrdersWithIntoPerformPrice = ticketOrdersWithIntoPerformPriceArray.reduce(
        (total, item) => (total = total + item),
        0
    )
    // 沒有第三方卡券會員卡的價格合計
    const merberShipCardTotalPriceWithoutThirdPartyCoupon = memberShipCardWithIntoPerformPriceArray.reduce(
        (total, item) => (total = total + item),
        0
    )

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

    // 業績合計、現金應收：運算式與舊版相同，只是算一次，下方彙總卡與底部固定列共用同一個值
    const performanceTotal = Math.round(
        serviceTotalPrice +
        merchantSellTotalPrice +
        couponUsageTotalPrice +
        ticketOrdersWithIntoPerformPrice +
        merberShipCardTotalPrice
    )
    const cashDue =
        serviceTotalPriceWithoutThirdPartyCoupon +
        productTotalPriceWithoutThirdPartyCoupon +
        merberShipCardTotalPriceWithoutThirdPartyCoupon +
        couponSellPrice -
        bill.walletPay -
        bill.amountByOtherPay -
        bill.bonusDecount

    // 金額彙總：各數值的運算式與舊版相同，只加千分位與新版樣式
    const Row = ({ label, value }) => (
        <div className="flex items-center justify-between gap-3 py-1.5 text-body">
            <span className="whitespace-nowrap text-text-secondary">{label}</span>
            <span className="whitespace-nowrap tabular-nums text-text">{formatMoney(value)}</span>
        </div>
    )
    // 消費明細／付款與折抵：彙總卡與手機底部展開共用同一份畫面
    const details = (
        <>
            <div className="flex flex-col">
                <p className="m-0 pb-1 text-label font-medium text-text-tertiary">消費明細</p>
                <Row label="服務消費" value={serviceTotalPrice} />
                <Row label="店販消費" value={merchantSellTotalPrice} />
                <Row label="預收卡販賣" value={couponSellPrice} />
                <Row label="使用預收卡" value={Math.round(couponUsageTotalPrice)} />
                <Row label="會員卡販賣" value={merberShipCardTotalPrice} />
            </div>
            <div className="flex flex-col">
                <p className="m-0 pb-1 text-label font-medium text-text-tertiary">付款與折抵</p>
                <Row label="扣入金" value={bill.walletPay} />
                <Row label="其他付款方式" value={bill.amountByOtherPay} />
                <Row label="紅利點數折抵" value={bill.bonusDecount} />
            </div>
        </>
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
                <div className="flex flex-col gap-1">
                    <span className="text-label text-text-secondary">業績合計</span>
                    <span className="text-heading tabular-nums text-text">
                        <span className="mr-1 text-body text-text-secondary">NT$</span>
                        {formatNumber(performanceTotal)}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-label text-text-secondary">現金應收</span>
                    <span className="text-display tabular-nums text-text">
                        <span className="mr-1 text-body text-text-secondary">NT$</span>
                        {formatNumber(cashDue)}
                    </span>
                </div>
            </div>
        </Card>
        {/* 底部固定列：長帳單捲動時，業績合計與現金應收隨時看得到。
            左側讓出側欄（lg 以上依 layouts/Dashboard 提供的 --sidebar-w：展開 264px、收合 0）；手機讓出底部導覽列（56px＋iPhone 安全區——PWA 全螢幕時導覽列會加高，只讓 56px 會被蓋住）；列印時不顯示。
            手機版（< 640px）不顯示上方彙總卡，改由左側展開鈕往上展開完整明細 */}
        <div className="ui-root fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[1050] border-0 border-t border-solid border-border bg-background px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] print:hidden lg:bottom-0 lg:left-[var(--sidebar-w,264px)]">
            {summaryOpen && (
                <div id="order-summary-details" className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto border-0 border-b border-solid border-border pb-2 sm:hidden">
                    <p className="m-0 pb-1 pt-1 text-heading font-bold text-text">金額彙總</p>
                    {details}
                </div>
            )}
            <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-3 whitespace-nowrap sm:gap-8">
                <button
                    type="button"
                    aria-label="金額彙總明細"
                    aria-expanded={summaryOpen}
                    aria-controls="order-summary-details"
                    onClick={() => setSummaryOpen(!summaryOpen)}
                    className="mr-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover sm:hidden"
                >
                    <ChevronUp className={summaryOpen ? 'h-5 w-5 rotate-180 transition-transform' : 'h-5 w-5 transition-transform'} strokeWidth={1.75} />
                </button>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-label text-text-secondary max-sm:text-caption">業績合計</span>
                    <span className="text-heading tabular-nums text-text">{formatMoney(performanceTotal)}</span>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-label text-text-secondary max-sm:text-caption">現金應收</span>
                    <span className="text-heading font-semibold tabular-nums text-text">{formatMoney(cashDue)}</span>
                </div>
            </div>
        </div>
        </Fragment>
    )
}

export default React.memo(PannelPerformance)
