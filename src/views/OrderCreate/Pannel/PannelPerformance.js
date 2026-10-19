import billContext from 'context/keyInContext'
import React, { Fragment, useContext } from 'react'
import styles from 'views/OrderCreate/styles/PannelService'
import idx from 'idx'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatMoney, formatNumber } from 'ui/format'

function PannelPerformance() {
    const { bill } = useContext(billContext)

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
    return (
        <Fragment>
        <Card className="ui-root w-full self-start">
            <CardHeader>
                <CardTitle>金額彙總</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-2 max-sm:grid-cols-1">
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
            左側讓出側欄（lg 以上 240px）；手機讓出底部導覽列（56px）；列印時不顯示 */}
        <div className="ui-root fixed inset-x-0 bottom-14 z-[1050] border-0 border-t border-solid border-border bg-background px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] print:hidden lg:bottom-0 lg:left-60">
            <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-8">
                <div className="flex items-baseline gap-2">
                    <span className="text-label text-text-secondary">業績合計</span>
                    <span className="text-heading tabular-nums text-text">{formatMoney(performanceTotal)}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-label text-text-secondary">現金應收</span>
                    <span className="text-heading font-semibold tabular-nums text-text">{formatMoney(cashDue)}</span>
                </div>
            </div>
        </div>
        </Fragment>
    )
}

export default React.memo(PannelPerformance)
