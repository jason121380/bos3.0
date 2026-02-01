/** @jsxImportSource @emotion/react */
import { Card, CardContent, Typography, Grid } from '@mui/material'
import billContext from 'context/keyInContext'
import React, { useContext } from 'react'
import styles from 'views/OrderCreate/styles/PannelService'
import idx from 'idx'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import { css } from '@emotion/react'

const detailStyles = {
    price: css({
        padding: '8px 12px',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& > span:first-of-type': {
            fontWeight: 'bold',
        },
    }),
    font: css({
        fontWeight: 'bold',
        color: '#4581df',
        padding: '8px 12px',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    highlighted: css({
        fontWeight: 'bold',
        color: '#4581df',
        padding: '8px 12px',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f7ff',
        borderRadius: '6px',
    }),
}

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

    return (
        <Card style={{ height: '100%' }}>
            <CardContent>
                <Grid container spacing={1}>
                    {/* 左側 */}
                    <Grid item xs={6} css={detailStyles.price}>
                        <span>服務消費</span>
                        <span>{serviceTotalPrice}</span>
                    </Grid>
                    {/* 右側 */}
                    <Grid item xs={6} css={detailStyles.price}>
                        <span>扣入金</span>
                        <span>{bill.walletPay}</span>
                    </Grid>

                    <Grid item xs={6} css={detailStyles.price}>
                        <span>店販消費</span>
                        <span>{merchantSellTotalPrice}</span>
                    </Grid>
                    <Grid item xs={6} css={detailStyles.price}>
                        <span>其他付款方式</span>
                        <span>{bill.amountByOtherPay}</span>
                    </Grid>

                    <Grid item xs={6} css={detailStyles.price}>
                        <span>預收卡販賣</span>
                        <span>{couponSellPrice}</span>
                    </Grid>
                    <Grid item xs={6} css={detailStyles.price}>
                        <span>紅利點數折抵</span>
                        <span>{bill.bonusDecount}</span>
                    </Grid>

                    <Grid item xs={6} css={detailStyles.price}>
                        <span>使用預收卡</span>
                        <span>{Math.round(couponUsageTotalPrice)}</span>
                    </Grid>
                    <Grid item xs={6}>
                        {/* 空白 */}
                    </Grid>

                    <Grid item xs={6} css={detailStyles.price}>
                        <span>會員卡販賣</span>
                        <span>{merberShipCardTotalPrice}</span>
                    </Grid>
                    <Grid item xs={6}>
                        {/* 空白 */}
                    </Grid>

                    {/* 下方標示底色區塊 */}
                    <Grid item xs={6} css={detailStyles.highlighted}>
                        <span>業績合計</span>
                        <span>
                            {Math.round(
                                serviceTotalPrice +
                                merchantSellTotalPrice +
                                couponUsageTotalPrice +
                                ticketOrdersWithIntoPerformPrice +
                                merberShipCardTotalPrice
                            )}
                        </span>
                    </Grid>
                    <Grid item xs={6} css={detailStyles.highlighted}>
                        <span>現金應收</span>
                        <span>
                            {serviceTotalPriceWithoutThirdPartyCoupon +
                                productTotalPriceWithoutThirdPartyCoupon +
                                merberShipCardTotalPriceWithoutThirdPartyCoupon +
                                couponSellPrice -
                                bill.walletPay -
                                bill.amountByOtherPay -
                                bill.bonusDecount}
                        </span>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default React.memo(PannelPerformance)
