/** @jsxImportSource @emotion/react */
import billContext from 'context/keyInContext'
import React, { useContext } from 'react'
import styles from 'views/OrderCreate/styles/PannelService'
import idx from 'idx'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'

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

    // 金額彙總：各數值的運算式與舊版相同，只加千分位與新版樣式
    const Row = ({ label, value }) => (
        <div className="flex items-center justify-between py-1.5 text-body">
            <span className="text-text-secondary">{label}</span>
            <span className="tabular-nums text-text">{formatNumber(value)}</span>
        </div>
    )
    return (
        <Card className="ui-root h-full">
            <CardHeader>
                <CardTitle>金額彙總</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-x-6 px-5 pt-2">
                <div className="flex flex-col">
                    <Row label="服務消費" value={serviceTotalPrice} />
                    <Row label="店販消費" value={merchantSellTotalPrice} />
                    <Row label="預收卡販賣" value={couponSellPrice} />
                    <Row label="使用預收卡" value={Math.round(couponUsageTotalPrice)} />
                    <Row label="會員卡販賣" value={merberShipCardTotalPrice} />
                </div>
                <div className="flex flex-col">
                    <Row label="扣入金" value={bill.walletPay} />
                    <Row label="其他付款方式" value={bill.amountByOtherPay} />
                    <Row label="紅利點數折抵" value={bill.bonusDecount} />
                </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 border-0 border-t border-solid border-border px-5 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-label text-text-secondary">業績合計</span>
                    <span className="text-heading tabular-nums text-text">
                        {formatNumber(Math.round(
                            serviceTotalPrice +
                            merchantSellTotalPrice +
                            couponUsageTotalPrice +
                            ticketOrdersWithIntoPerformPrice +
                            merberShipCardTotalPrice
                        ))}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-label text-text-secondary">現金應收</span>
                    <span className="text-display tabular-nums text-text">
                        <span className="mr-1 text-body text-text-secondary">NT$</span>
                        {formatNumber(serviceTotalPriceWithoutThirdPartyCoupon +
                            productTotalPriceWithoutThirdPartyCoupon +
                            merberShipCardTotalPriceWithoutThirdPartyCoupon +
                            couponSellPrice -
                            bill.walletPay -
                            bill.amountByOtherPay -
                            bill.bonusDecount)}
                    </span>
                </div>
            </div>
        </Card>
    )
}

export default React.memo(PannelPerformance)
