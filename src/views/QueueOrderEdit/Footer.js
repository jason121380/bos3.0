/** @jsxImportSource @emotion/react */
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
import giveBonus from 'helper/giveBonus'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber, formatMoney } from 'ui/format'

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

  // 金額彙總：各數值的運算式與舊版相同，只加千分位與新版樣式
  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 py-1.5 text-body">
      <span className="whitespace-nowrap text-text-secondary">{label}</span>
      <span className="whitespace-nowrap tabular-nums text-text">{formatMoney(value)}</span>
    </div>
  )
  return (
    <Card className="ui-root mt-6">
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
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6 border-0 border-t border-solid border-border px-5 py-4">
        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-label text-text-secondary">業績合計</span>
            <span className="text-heading tabular-nums text-text">
              <span className="mr-1 text-body text-text-secondary">NT$</span>
              {formatNumber(Math.round(
                serviceTotalPrice +
                merchantSellTotalPrice +
                couponUsageTotalPrice +
                merberShipCardTotalPriceWithoutThirdPartyCoupon
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-label text-text-secondary">現金應收</span>
            <span className="text-display tabular-nums text-text">
              <span className="mr-1 text-body text-text-secondary">NT$</span>
              {formatNumber(serviceTotalPriceWithoutThirdPartyCoupon +
                productTotalPriceWithoutThirdPartyCoupon +
                couponSellPrice +
                merberShipCardTotalPriceWithoutThirdPartyCoupon -
                bill.walletPay -
                bill.amountByOtherPay)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            className="px-6"
            onClick={handleReCheckoutOrder}
            disabled={vaild || !enable}
            data-testid="checkout"
          >
            重試
          </Button>
        </div>
      </div>
    </Card>
  )
}
