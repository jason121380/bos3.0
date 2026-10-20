import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from 'ui/modal-compat'
import { TextField } from 'ui/text-field'
import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import { cloneDeep } from 'lodash'
import giveBonus from 'helper/giveBonus'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber, formatMoney } from 'ui/format'
import { ChevronUp } from 'lucide-react'
import { getMissingForCheckout, getMissingForSave, getDisabledReason } from './orderRequirements'

export default function Footer({ enable }) {
  const {
    bill, orderSetting, orderStatus, setBill, bonusSetting,
    isLineBinded, bonusRewardWithLINE, disablePendingOrder
  } = React.useContext(billContext)
  const inputRef = useRef(null)
  const [reCheckoutPwd, setReCheckoutPwd] = useState('')
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [openDialog, setOpenDialog] = useState(false)
  const [disableRecheckoutOrders, setDisableRecheckoutOrders] = useState(false)
  // 手機版：金額彙總明細收在底部固定列，點展開鈕往上展開（純畫面開合，比照打帳單）
  const [summaryOpen, setSummaryOpen] = useState(false)
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

  const { open, toggle, setOpen } = useToggle()

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
    toggle()
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
          toggle()
          openSnackbar({
            message: '帳單儲存成功',
            variant: 'success',
          })
          history.push('/management/weborders')
        })
        .catch(() => toggle())
    }
  }

  const handleOpenReCheckout = () => {
    if (disableRecheckoutOrders) {
      setOpenDialog(true)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handlePasswordChange = e => {
    const value = e.target.value
    const { start, end } = selection;
    const clonePassword = cloneDeep(reCheckoutPwd)
    const delta = value.length - reCheckoutPwd.length
    let combineValue = ''
    
    if (delta > 0) {
      combineValue = clonePassword.slice(0, start) + value.slice(start, start + delta) + clonePassword.slice(end, clonePassword.length)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = start + delta;
          inputRef.current.selectionEnd = start + delta;
        }
      }, 0);
    } else {
      if (end - start === Math.abs(delta)) {
        combineValue = clonePassword.slice(0, start) + clonePassword.slice(end, clonePassword.length)
      } else if (start === end) {
        combineValue = clonePassword.slice(0, start - 1) + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start - 1;
            inputRef.current.selectionEnd = start - 1;
          }
        }, 0);
      } else {
        const sliceValue = value.slice(start, start + 1)
        combineValue = clonePassword.slice(0, start) + sliceValue + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start + 1;
            inputRef.current.selectionEnd = start + 1;
          }
        }, 0);
      }
    }
    setReCheckoutPwd(combineValue)
  }

  const handleSelect = (event) => {
    setSelection({
      start: event.target.selectionStart,
      end: event.target.selectionEnd,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Delete') {
      event.preventDefault();
    }
    if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text");
    const { start, end } = selection;

    const newActualValue =
      reCheckoutPwd.slice(0, start) + pasteData + reCheckoutPwd.slice(end);

    setReCheckoutPwd(newActualValue);

    // 更新光标位置
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          start + pasteData.length;
      }
    }, 0);
  };

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
    isLineBinded
  ])

  // 業績合計、現金應收：運算式與舊版相同，只是算一次，下方彙總卡與底部固定列共用同一個值
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

  // 金額彙總：各數值的運算式與舊版相同，只加千分位與新版樣式
  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 py-1.5 text-body">
      <span className="whitespace-nowrap text-text-secondary">{label}</span>
      <span className="whitespace-nowrap tabular-nums text-text">{formatMoney(value)}</span>
    </div>
  )
  // 消費明細／付款與折抵：彙總卡與手機底部展開共用同一份畫面（比照打帳單）
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
    <React.Fragment>
    {/* 金額彙總卡：桌機顯示明細與合計；手機（< 640px）只留操作按鈕，明細與合計收進底部固定列（比照打帳單） */}
    <Card className="ui-root mt-6">
      <CardHeader className="max-sm:hidden">
        <CardTitle>金額彙總</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-2 max-sm:hidden">
        {details}
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6 border-0 border-t border-solid border-border px-5 py-4 max-sm:mt-0 max-sm:border-t-0">
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 max-sm:hidden">
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
        {orderStatus && (
          <div className="flex flex-col items-end gap-1.5 max-sm:w-full">
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
            {disabledReason && (
              <p role="status" className="m-0 text-caption text-warning max-sm:text-right">
                {disabledReason}
              </p>
            )}
          </div>
        )}
      </div>
      {/* 密碼欄位有游標位置與貼上處理，保留 MUI Dialog / TextField；只把按鈕換成新元件 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">重新結帳</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              label="密碼"
              inputRef={inputRef}
              value={new Array(reCheckoutPwd.length).fill('*').join('')}
              onChange={handlePasswordChange}
              onSelect={handleSelect}
              onCopy={e => e.preventDefault()}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              type='text'
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions className="ui-root">
          <Button variant="ghost" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button variant="primary" disabled={open} onClick={() => handleReCheckoutOrder()} autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
    {/* 讓出底部固定合計列的高度，最後一張卡不會被蓋住 */}
    <div aria-hidden="true" className="h-12" />
    {/* 底部固定列：長帳單捲動時，業績合計與現金應收隨時看得到（比照打帳單）。
        左側讓出側欄（lg 以上 240px）；手機讓出底部導覽列（56px＋iPhone 安全區）；列印時不顯示。
        手機版（< 640px）不顯示上方明細與合計，改由左側展開鈕往上展開完整明細 */}
    <div className="ui-root fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[1050] border-0 border-t border-solid border-border bg-background px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] print:hidden lg:bottom-0 lg:left-60">
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
    </React.Fragment>
  )
}
