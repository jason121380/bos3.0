import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import { Fragment, useEffect, useContext, useState } from 'react'
import { useHistory } from 'react-router'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import _ from 'lodash'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import giveBonus from 'helper/giveBonus'
import { ChevronUp } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber, formatMoney } from 'ui/format'

export default function Footer({ enable }) {
  const { bill, orderId, setBill, bonusSetting, isLineBinded, bonusRewardWithLINE } = useContext(billContext)
  const history = useHistory()
  const { createOrder } = useFetchCreateOrder()
  const { destroyQueueById } = useFetchDestroyQueueById()
  // 手機版：金額彙總明細收在底部固定列，點展開鈕往上展開（純畫面開合，比照打帳單）
  const [summaryOpen, setSummaryOpen] = useState(false)

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
  // 逐條對照上方 vaild 與按鈕的 disabled={vaild || !enable}：
  //   vaild 為 true 時代表「日期、顧客（customerId／不留客資／手機）、服務人員、至少一項消費」四者至少缺一
  //   （總金額為 0 但有消費資料的例外分支只會讓 vaild 為 false，不會產生停用），以下四條與 vaild 的子條件逐字相同；
  //   !enable 為各欄位資料尚在載入（index.js 的 enable）
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
    : !enable ? '資料載入中，請稍候' : ''

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
      </div>
    </>
  )
  return (
    <Fragment>
    {/* 金額彙總卡（放在 Pannel 下方右欄，比照打帳單 PannelPerformance）：「重試」在合計下方 */}
    <Card className="ui-root w-full self-start">
      {/* 手機版（< 640px）不顯示彙總明細與合計，改由底部固定列展開；卡片只留「重試」 */}
      <CardHeader className="max-sm:hidden">
        <CardTitle>金額彙總</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-2 max-sm:hidden">
        {details}
      </div>
      <div className="mt-3 flex flex-col gap-4 border-0 border-t border-solid border-border px-5 py-4 max-sm:mt-0 max-sm:border-t-0">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-sm:hidden">
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
        <div className="flex flex-col items-end gap-1.5 max-sm:w-full">
          <span title={retryDisabledReason || undefined} className="inline-flex">
            {/* 停用時改成深字灰底（比照打帳單「結帳」，原本淡藍底白字對比不足） */}
            <Button
              variant="primary"
              size="lg"
              className="px-6 disabled:bg-surface-active disabled:text-text-secondary disabled:opacity-100"
              onClick={handleReCheckoutOrder}
              disabled={vaild || !enable}
              data-testid="checkout"
            >
              重試
            </Button>
          </span>
          {retryDisabledReason && (
            <p role="status" className="m-0 text-caption text-warning max-sm:text-right">
              {retryDisabledReason}
            </p>
          )}
        </div>
      </div>
    </Card>
    {/* 底部固定列（比照打帳單）：長帳單捲動時，業績合計與現金應收隨時看得到。
        左側讓出側欄（lg 以上 240px）；手機讓出底部導覽列（56px＋iPhone 安全區）；列印時不顯示。
        手機版（< 640px）不顯示上方彙總明細，改由左側展開鈕往上展開完整明細 */}
    <div className="ui-root fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[1050] border-0 border-t border-solid border-border bg-background px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] print:hidden lg:bottom-0 lg:left-[var(--sidebar-w,264px)]">
      {summaryOpen && (
        <div id="queue-order-summary-details" className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto border-0 border-b border-solid border-border pb-2 sm:hidden">
          <p className="m-0 pb-1 pt-1 text-heading font-bold text-text">金額彙總</p>
          {details}
        </div>
      )}
      <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-3 whitespace-nowrap sm:gap-8">
        <button
          type="button"
          aria-label="金額彙總明細"
          aria-expanded={summaryOpen}
          aria-controls="queue-order-summary-details"
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
