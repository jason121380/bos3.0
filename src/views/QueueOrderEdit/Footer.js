import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import { Fragment, useEffect, useContext, useState } from 'react'
import { useHistory } from 'react-router'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import giveBonus from 'helper/giveBonus'
import { Button } from 'ui/button'
import { SummaryDetails, EditSummaryCard, BillActions, StickySummaryBar } from 'views/OrderShared/BillSummary'

export default function Footer({ enable }) {
  const { bill, orderId, setBill, bonusSetting, isLineBinded, bonusRewardWithLINE } = useContext(billContext)
  const history = useHistory()
  const { createOrder } = useFetchCreateOrder()
  const { destroyQueueById } = useFetchDestroyQueueById()
  // 帳單已成立：之後不論刪除佇列成功與否，「重試」都不能再按，避免重複成立帳單
  const [created, setCreated] = useState(false)
  // 成立帳單送出中：回應前「重試」停用，防止連點重複成立帳單；回應後（成功或失敗）恢復，再依原規則判斷可否按
  const [submitting, setSubmitting] = useState(false)

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
      setSubmitting(true)
      createOrder(tmp)
        .then(res => {
          if (res.data.createOrder2) {
            setCreated(true)
            const listPath = tmp.isPending ? '/management/draft-orders' : '/management/orders'
            // 帳單已成立但佇列紀錄刪不掉（回傳 false 或 API 錯誤）：說明帳單已成立、不要再重試，並回帳單列表
            // （原本沒有任何提示、留在本頁且「重試」可再按，再按就重複成立帳單；coverage wave 1，2026/10/22）
            const queueNotRemoved = () => {
              openSnackbar({
                message: `帳單已成立（${res.data.createOrder2}），但未能從訂單佇列移除。請勿再重試這筆，請到「訂單佇列」將它刪除`,
                variant: 'error',
              })
              history.push(listPath)
            }
            destroyQueueById({ queueId: orderId }).then(res => {
              if (res.data.destroyQueueById) {
                history.push(listPath)
              } else {
                queueNotRemoved()
              }
            }, queueNotRemoved)
          }
          // 放在 setCreated 之後：帳單已成立時不會有「送出結束、尚未標記已成立」的空檔讓按鈕短暫可按
          setSubmitting(false)
        })
        .catch((error) => {
          setSubmitting(false)
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
    bill.amountByOtherPay, bill.bonusDecount, setBill
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
    isLineBinded, setBill
  ])

  // 業績合計、現金應收：運算式與舊版逐字相同，只是算一次，下方彙總卡與底部固定列共用同一個值（比照打帳單 PannelPerformance）
  const performanceTotal = Math.round(
    serviceTotalPrice +
    merchantSellTotalPrice +
    couponUsageTotalPrice +
    merberShipCardTotalPriceWithoutThirdPartyCoupon
  )
  const cashDue = serviceTotalPriceWithoutThirdPartyCoupon +
    productTotalPriceWithoutThirdPartyCoupon +
    couponSellPrice +
    merberShipCardTotalPriceWithoutThirdPartyCoupon -
    bill.walletPay -
    bill.amountByOtherPay

  // 「重試」停用時說明原因（STYLE §6「按鈕停用要說明原因」）：只用於顯示，不參與任何啟用／停用判斷。
  // 逐條對照上方 vaild 與按鈕的 disabled={vaild || !enable || created || submitting}：
  //   vaild 為 true 時代表「日期、顧客（customerId／不留客資／手機）、服務人員、至少一項消費」四者至少缺一
  //   （總金額為 0 但有消費資料的例外分支只會讓 vaild 為 false，不會產生停用），以下四條與 vaild 的子條件逐字相同；
  //   !enable 為各欄位資料尚在載入（index.js 的 enable）；submitting 為成立帳單送出中
  const missingForRetry = []
  if (vaild) {
    if (!bill.date) missingForRetry.push('帳單日期')
    if (!(bill.customerId || bill.withoutCustomerData || bill.customerCellphone)) missingForRetry.push('顧客（或勾選「不留客資」）')
    if (!bill.designerId) missingForRetry.push('服務人員')
    if (!(bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)) missingForRetry.push('至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）')
  }
  const retryDisabledReason = missingForRetry.length > 0
    ? `尚缺：${missingForRetry.join('、')}`
    : !enable ? '資料載入中，請稍候' : submitting ? '處理中，請稍候' : ''

  // 消費明細／付款與折抵：彙總卡與手機底部展開共用同一份畫面（排版在 OrderShared/BillSummary，數值運算式在本檔）
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
      ]}
    />
  )
  return (
    <Fragment>
      {/* 金額彙總卡（放在 Pannel 下方右欄，比照打帳單 PannelPerformance）：「重試」在合計下方；
          手機版（< 640px）不顯示彙總明細與合計，改由底部固定列展開；卡片只留「重試」 */}
      <EditSummaryCard
        details={details}
        performanceTotal={performanceTotal}
        cashDue={cashDue}
        actions={
          <BillActions reason={retryDisabledReason}>
            <span title={retryDisabledReason || undefined} className="inline-flex">
              {/* 停用時改成深字灰底（比照打帳單「結帳」，原本淡藍底白字對比不足） */}
              <Button
                variant="primary"
                size="lg"
                className="px-6 disabled:bg-surface-active disabled:text-text-secondary disabled:opacity-100"
                onClick={handleReCheckoutOrder}
                disabled={vaild || !enable || created || submitting}
                data-testid="checkout"
              >
                重試
              </Button>
            </span>
          </BillActions>
        }
      />
      <StickySummaryBar
        detailsId="queue-order-summary-details"
        details={details}
        performanceTotal={performanceTotal}
        cashDue={cashDue}
      />
    </Fragment>
  )
}
