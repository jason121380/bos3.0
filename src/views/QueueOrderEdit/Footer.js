/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import { useEffect, useContext } from 'react'
import { useHistory } from 'react-router'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import _ from 'lodash'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import giveBonus from 'helper/giveBonus'

const styles = {
  card: css({
    marginTop: theme.spacing(3),
  }),
  cardContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  price: css({
    padding: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(3),
  }),
  action: css({
    padding: theme.spacing(1),
  }),
  saveButton: css({
    marginRight: theme.spacing(1),
  }),
  font: css({
    fontWeight: 'bold',
    color: 'rgb(var(--accent))',
    padding: theme.spacing(1),
  }),
}

export default function Footer({ enable }) {
  const { bill, orderId, setBill, bonusSetting, isLineBinded, bonusRewardWithLINE } = useContext(billContext)
  const history = useHistory()
  const { createOrder } = useFetchCreateOrder()
  const { destroyQueueById } = useFetchDestroyQueueById()

  const handleReCheckoutOrder = () => {
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)
    if (!checkService.verify) {
      openSnackbar({
        message: checkService.message,
        variant: "error",
      });
      return
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      return;
    } else {
      createOrder(tmp)
        .then(res => {
          if (res.data.createOrder2) {
            destroyQueueById({ queueId: orderId }).then(res => {
              if (res.data.destroyQueueById) {
                history.push(tmp.isPending ? '/management/draft-orders' : '/management/orders')
              }
            })
          }
        })
        .catch((error) => {
          openSnackbar({
            message: `重結失敗: ${error}`,
            variant: 'error',
          })
          window.location.reload()
        })
    }
  }
  const customerTicketRecords = useFetchTicketRecords({
    ids: bill.useTicketOrders.map(d => d.customerTicketId),
  })
  const serviceTotalPriceArray = idx(bill, _ =>
    _.serviceOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price : 0
    )
  )
  const productTotalPriceArray = idx(bill, _ =>
    _.productOrders.map(d =>
      (d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined) &&
        d.productId !== ''
        ? d.price * d.count
        : 0
    )
  )
  // 沒第三方卡券會員卡price array
  const memberShipCardWithIntoPerformPriceArray = idx(bill, _ =>
    _.membershipOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price
        : 0
    )
  )
  const serviceTotalPriceWithoutThirdPartyCoupon = serviceTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )
  const productTotalPriceWithoutThirdPartyCoupon = productTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )
  // 沒有第三方卡券會員卡的價格合計
  const merberShipCardTotalPriceWithoutThirdPartyCoupon = memberShipCardWithIntoPerformPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )
  const serviceTotalPrice =
    bill.serviceOrders.length > 0 ? bill.serviceOrders.reduce((a, b) => a + b.price, 0) : 0

  const merchantSellTotalPrice =
    bill.productOrders.length > 1
      ? bill.productOrders.reduce(
        (a, b) => (a += b.count * (b.price === undefined ? 0 : b.price)),
        0
      )
      : bill.productOrders.length === 1
        ? bill.productOrders[0].count *
        (bill.productOrders[0].price === undefined ? 0 : bill.productOrders[0].price)
        : 0

  const couponSellPrice =
    bill.ticketOrders.length > 1
      ? bill.ticketOrders.reduce((a, b) => (a += b.count * b.price), 0)
      : bill.ticketOrders.length === 1
        ? bill.ticketOrders[0].count * bill.ticketOrders[0].price
        : 0

  const couponUsageTotalPrice = idx(customerTicketRecords, _ =>
    _.data.ticketRecords.data.length > 1
      ? _.data.ticketRecords.data.reduce((r, b) => r + b.price, 0)
      : _.data.ticketRecords.data.length === 1
        ? _.data.ticketRecords.data[0].price
        : 0
  ) ?? 0
  const merberShipCardTotalPrice = bill.membershipOrders.reduce(
    (total, item) => (total = total + item.price),
    0
  )

  const vaild = !(
    (bill.date && // 有訂單日期
      (bill.customerId || bill.withoutCustomerData || bill.customerCellphone) && // 有顧客id或是不留客資
      bill.designerId && // 有設計師id
      (bill.serviceOrders.length > 0 ||
        bill.productOrders.length > 0 ||
        bill.ticketOrders.length > 0 ||
        bill.useTicketOrders.length > 0 ||
        bill.membershipOrders.length > 0)) || // 訂單消費欄位長度大於0
    (serviceTotalPrice + // 如果訂單總金額=0 但有消費資料也可以重新結帳
      merchantSellTotalPrice +
      couponSellPrice +
      merberShipCardTotalPrice ===
      0 &&
      (bill.serviceOrders.length > 0 ||
        bill.productOrders.length > 0 ||
        bill.ticketOrders.length > 0 ||
        bill.useTicketOrders.length > 0 ||
        bill.membershipOrders.length > 0))
  )

  useEffect(() => {
    if (
      serviceTotalPriceWithoutThirdPartyCoupon +
      productTotalPriceWithoutThirdPartyCoupon +
      couponSellPrice +
      merberShipCardTotalPriceWithoutThirdPartyCoupon -
      bill.walletPay -
      bill.amountByOtherPay -
      bill.bonusDecount <
      0
    ) {
      setBill(
        produce(draft => {
          draft.amountByOtherPay = 0
          draft.walletPay = 0
          draft.bonusDecount = 0
        })
      )
    }
  }, [
    serviceTotalPriceWithoutThirdPartyCoupon, productTotalPriceWithoutThirdPartyCoupon,
    couponSellPrice, merberShipCardTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount
  ])
  
  useEffect(() => {
    if (bonusSetting.isUsing) {
      let bonusDeposit = 0; // 預設為 0
    
      if (!bonusRewardWithLINE || (bonusRewardWithLINE && isLineBinded)) {
        const total =
          serviceTotalPriceWithoutThirdPartyCoupon +
          productTotalPriceWithoutThirdPartyCoupon +
          couponSellPrice +
          merberShipCardTotalPriceWithoutThirdPartyCoupon -
          bill.walletPay -
          bill.amountByOtherPay -
          bill.bonusDecount;
    
        bonusDeposit = giveBonus[bonusSetting.rule.mode](total, bonusSetting.rule.price, bonusSetting.rule.bonus);
      }
    
      setBill(
        produce(draft => {
          draft.bonusDeposit = bonusDeposit;
        })
      );
    }
  }, [
    serviceTotalPriceWithoutThirdPartyCoupon, productTotalPriceWithoutThirdPartyCoupon,
    couponSellPrice, merberShipCardTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount, bill.customerId, bonusRewardWithLINE,
    isLineBinded
  ])

  return (
    <Card css={styles.card}>
      <CardContent css={styles.cardContent}>
        <Grid container spacing={3}>
          <Grid container item md={9} xs={12}>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>服務消費 {serviceTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>店販消費 {merchantSellTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>使用預收卡 {Math.round(couponUsageTotalPrice)}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.font}>
              <span>
                業績合計{' '}
                {Math.round(
                  serviceTotalPrice +
                  merchantSellTotalPrice +
                  couponUsageTotalPrice +
                  merberShipCardTotalPriceWithoutThirdPartyCoupon
                )}
              </span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>預收卡販賣 {couponSellPrice}</span>
            </Grid>
            <Grid item xs={3} css={styles.price}>
              <span>會員卡販賣 {merberShipCardTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>扣入金 {bill.walletPay}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.font}>
              <span>
                現金應收{' '}
                {serviceTotalPriceWithoutThirdPartyCoupon +
                  productTotalPriceWithoutThirdPartyCoupon +
                  couponSellPrice +
                  merberShipCardTotalPriceWithoutThirdPartyCoupon -
                  bill.walletPay -
                  bill.amountByOtherPay}
              </span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>其他付款方式 {bill.amountByOtherPay}</span>
            </Grid>
          </Grid>

          <Grid container item md={3} xs={12} css={styles.actions} justifyContent="flex-start">
            <Grid item md={6} css={styles.action}>
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={handleReCheckoutOrder}
                disabled={vaild || !enable}
                data-testid="checkout"
                style={{ whiteSpace: 'nowrap' }}
              >
                重試
              </Button>
            </Grid>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  )
}
