import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import giveBonus from 'helper/giveBonus'
import { Button } from 'ui/button'
import { SummaryDetails, EditSummaryCard, BillActions, StickySummaryBar } from 'views/OrderShared/BillSummary'
import ReCheckoutPasswordDialog from 'views/OrderShared/ReCheckoutPasswordDialog'
import { getMissingForCheckout, getMissingForSave, getDisabledReason } from './orderRequirements'

export default function Footer({ enable }) {
  const {
    bill, orderSetting, orderStatus, setBill, bonusSetting,
    isLineBinded, bonusRewardWithLINE, disablePendingOrder
  } = React.useContext(billContext)
  const [reCheckoutPwd, setReCheckoutPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disableRecheckoutOrders, setDisableRecheckoutOrders] = useState(false)
  const passwordData = useFetchMerchantPassword()

  useEffect(() => {
    if (!passwordData.loading) {
      const disableRecheckoutOrders = idx(
        passwordData,
        _ => _.data.merchantPassword.reCheckoutOrder.isUsing
      )
      setDisableRecheckoutOrders(disableRecheckoutOrders)
    }
  }, [passwordData.loading])

  const { fetchReCheckoutOrder } = useFetchReCheckoutOrder()

  const { updateOrder } = useFetchUpdateOrder()
  const history = useHistory()

  const { open, setOpen } = useToggle()

  const location = useLocation()
  const status = getQueryString({ key: 'status', location })

  const handleReCheckoutOrder = (isPending = false) => {
    setOpen(true)
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)
    if (!checkService.verify) {
      openSnackbar({
        message: checkService.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else {
      tmp.isPending = isPending
      fetchReCheckoutOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: tmp,
        password: reCheckoutPwd,
      })
        .then(() => {
          openSnackbar({
            message: isPending ? '掛單成功' : `帳單${renderActionText()}成功`,
            variant: 'success',
          })
          setOpenDialog(false)
          setReCheckoutPwd('')
          if (isPending) {
            history.push('/management/draft-orders')
          } else if (location.search === '?status=checkout') {
            history.push('/management/orders')
          } else {
            history.push(
              `/management/${location.search.length > 0
                ? `orders?startDate=${location.search.split('=')[1].substring(0, 13)}&endDate=${location.search.split('=')[2]
                }`
                : 'orders'
              }`
            )
          }
        })
        .catch((error) => {
          setOpen(false)
          openSnackbar({
            message: error.message,
            variant: 'error',
          })
          setReCheckoutPwd('')
        })
    }
  }
  const customerTicketRecords = useFetchTicketRecords({
    ids: bill.useTicketOrders.map(d => d.customerTicketId),
  })

  const updateVaild = !(
    bill.date &&
    bill.customerId &&
    bill.designerId &&
    !orderSetting.isCloseAccount
  )

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
      !orderSetting.isCloseAccount && // 訂單未結算
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

  const disabledEditOrder = open || vaild

  useEffect(() => {
    const handleEditOrderShortCut = event => {
      if (event.code === 'F9') {
        disableRecheckoutOrders ? handleOpenReCheckout() : handleReCheckoutOrder()
      }
    }
    document.addEventListener('keydown', handleEditOrderShortCut, false)
    return () => {
      document.removeEventListener('keydown', handleEditOrderShortCut)
    }
  }, [disabledEditOrder, handleReCheckoutOrder, disableRecheckoutOrders])

  const renderActionText = () => {
    switch (orderStatus) {
      case '預約成功':
        return '結帳'
      case '待付款':
        return '重新結帳'
      case '已完成':
        return '重新結帳'
      default:
        return ''
    }
  }
  const handleSaveOrder = () => {
    // 送出中停用按鈕；失敗時恢復（原本用 toggle() 切換，閉包讀到送出前的 open，失敗後按鈕永遠停用）
    setOpen(true)
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)
    if (!checkService.verify) {
      openSnackbar({
        message: checkService.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setOpen(false)
      return;
    } else {
      updateOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: tmp,
      })
        .then(() => {
          openSnackbar({
            message: '帳單儲存成功',
            variant: 'success',
          })
          history.push('/management/weborders')
        })
        .catch(() => setOpen(false))
    }
  }

  // 只在店家開啟重新結帳密碼（disableRecheckoutOrders）時呼叫（主要按鈕與 F9 都先判斷）
  const handleOpenReCheckout = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

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
    /* if (bonusSetting.isUsing) {
      const total = serviceTotalPriceWithoutThirdPartyCoupon +
        productTotalPriceWithoutThirdPartyCoupon +
        couponSellPrice +
        merberShipCardTotalPriceWithoutThirdPartyCoupon -
        bill.walletPay -
        bill.amountByOtherPay -
        bill.bonusDecount

      const bonus = giveBonus[bonusSetting.rule.mode](total, bonusSetting.rule.price, bonusSetting.rule.bonus)
      setBill(
        produce(draft => {
          draft.bonusDeposit = bonus
        })
      )
    } */
  }, [
    serviceTotalPriceWithoutThirdPartyCoupon, productTotalPriceWithoutThirdPartyCoupon,
    couponSellPrice, merberShipCardTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount, bill.customerId, bonusRewardWithLINE,
    isLineBinded, setBill,
    // 給點規則比帳單晚到時（規則只在查詢回來時設定一次），到了也要依規則重算
    bonusSetting,
  ])

  // 業績合計、現金應收：只顯示在金額彙總（彙總卡與底部固定列共用），不送後端（後端依品項明細自己算業績）。
  // 四頁預覽以打帳單（PannelPerformance）為準（Jason 2026/10/22）：
  // - 業績合計：會員卡用第三方卡券時照樣計入售價全額（原本排除，與打帳單、掛單詳細不一致）
  // - 現金應收：寫法與打帳單 billPaymentSummary 不同（另排除「未選商品」的店販列），但未選商品的列價格一律是 0，結果相同，維持原式
  // 上方「付款超過應付時歸零」與紅利給點的 effect 用的是各自的運算式，不受影響
  const performanceTotal = Math.round(
    serviceTotalPrice +
    merchantSellTotalPrice +
    couponUsageTotalPrice +
    merberShipCardTotalPrice
  )
  const cashDue = serviceTotalPriceWithoutThirdPartyCoupon +
    productTotalPriceWithoutThirdPartyCoupon +
    couponSellPrice +
    merberShipCardTotalPriceWithoutThirdPartyCoupon -
    bill.walletPay -
    bill.amountByOtherPay -
    bill.bonusDecount

  // 按鈕停用時說明原因（只用於顯示）：開關就是下方按鈕的 disabled 條件本身，見 orderRequirements.js
  const checkoutDisabledReason = getDisabledReason({
    busy: open,
    invalid: vaild,
    isCloseAccount: orderSetting.isCloseAccount,
    missing: getMissingForCheckout(bill),
    loading: !enable,
  })
  const saveDisabledReason = getDisabledReason({
    busy: open,
    invalid: updateVaild,
    isCloseAccount: orderSetting.isCloseAccount,
    missing: getMissingForSave(bill),
  })
  // 狀態列：有顯示「掛單／結帳」時說明它們的原因，只有「儲存」時說明儲存的原因（顯示條件與下方按鈕相同）
  const disabledReason =
    (!disablePendingOrder && bill.isReserved) || (renderActionText() && status !== 'edit')
      ? checkoutDisabledReason
      : orderStatus === '預約成功' && status !== 'checkout'
        ? saveDisabledReason
        : ''

  // 金額彙總：各列數值與打帳單相同（業績合計、現金應收見上方）；排版與千分位在 OrderShared/BillSummary（四頁共用）
  // 消費明細／付款與折抵：彙總卡與手機底部展開共用同一份畫面（比照打帳單）
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
    <React.Fragment>
      {/* 金額彙總卡（放在 Pannel 下方右欄，比照打帳單 PannelPerformance）：桌機顯示明細、合計，按鈕列在合計下方；
          手機（< 640px）只留操作按鈕，明細與合計收進底部固定列 */}
      <EditSummaryCard
        details={details}
        performanceTotal={performanceTotal}
        cashDue={cashDue}
        actions={orderStatus && (
          <BillActions reason={disabledReason}>
            <div className="orderButtonGroup flex flex-wrap items-center justify-end gap-2">
              {orderStatus === '預約成功' && status !== 'checkout' && (
                <span title={saveDisabledReason || undefined} className="inline-flex">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleSaveOrder}
                    disabled={open || updateVaild}
                  >
                    儲存
                  </Button>
                </span>
              )}
              {!disablePendingOrder && bill.isReserved && (
                <span title={checkoutDisabledReason || undefined} className="inline-flex">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleReCheckoutOrder(true)}
                    disabled={open || vaild || !enable}
                  >掛單</Button>
                </span>
              )}
              {renderActionText() && status !== 'edit' && (
                <span title={checkoutDisabledReason || undefined} className="inline-flex">
                  {/* 停用時改成深字灰底（比照打帳單；原本淡藍底白字對比不足） */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-6 disabled:bg-surface-active disabled:text-text-secondary disabled:opacity-100"
                    onClick={() => disableRecheckoutOrders ? handleOpenReCheckout() : handleReCheckoutOrder()}
                    disabled={open || vaild || !enable}
                    data-testid="checkout"
                  >
                    {renderActionText()}
                  </Button>
                </span>
              )}
            </div>
          </BillActions>
        )}
      >
        <ReCheckoutPasswordDialog
          open={openDialog}
          onClose={handleCloseDialog}
          title="重新結帳"
          reCheckoutPwd={reCheckoutPwd}
          setReCheckoutPwd={setReCheckoutPwd}
          confirmDisabled={open}
          onConfirm={() => handleReCheckoutOrder()}
        />
      </EditSummaryCard>
      {/* 底部固定列：長帳單捲動時，業績合計與現金應收隨時看得到（比照打帳單） */}
      <StickySummaryBar
        detailsId="order-summary-details"
        details={details}
        performanceTotal={performanceTotal}
        cashDue={cashDue}
      />
    </React.Fragment>
  )
}
