/** @jsxImportSource @emotion/react */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from '@mui/material'
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
import { formatNumber } from 'ui/format'

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

  // 金額彙總：各數值的運算式與舊版相同，只加千分位與新版樣式
  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 py-1.5 text-body">
      <span className="whitespace-nowrap text-text-secondary">{label}</span>
      <span className="tabular-nums text-text">{formatNumber(value)}</span>
    </div>
  )
  return (
    <Card className="ui-root mt-6">
      <CardHeader>
        <CardTitle>金額彙總</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-x-6 px-5 pt-2 md:grid-cols-4">
        <Row label="服務消費" value={serviceTotalPrice} />
        <Row label="店販消費" value={merchantSellTotalPrice} />
        <Row label="使用預收卡" value={Math.round(couponUsageTotalPrice)} />
        <Row label="預收卡販賣" value={couponSellPrice} />
        <Row label="會員卡販賣" value={merberShipCardTotalPrice} />
        <Row label="扣入金" value={bill.walletPay} />
        <Row label="其他付款方式" value={bill.amountByOtherPay} />
        <Row label="紅利點數折抵" value={bill.bonusDecount} />
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6 border-0 border-t border-solid border-border px-5 py-4">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-label text-text-secondary">業績合計</span>
            <span className="text-heading tabular-nums text-text">
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
                bill.amountByOtherPay -
                bill.bonusDecount)}
            </span>
          </div>
        </div>
        {orderStatus && (
          <div className="orderButtonGroup flex flex-wrap items-center gap-2">
            {orderStatus === '預約成功' && status !== 'checkout' && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSaveOrder}
                disabled={open || updateVaild}
              >
                儲存
              </Button>
            )}
            {!disablePendingOrder && bill.isReserved && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleReCheckoutOrder(true)}
                disabled={open || vaild || !enable}
              >掛單</Button>
            )}
            {renderActionText() && status !== 'edit' && (
              <Button
                variant="primary"
                size="lg"
                className="px-6"
                onClick={() => disableRecheckoutOrders ? handleOpenReCheckout() : handleReCheckoutOrder()}
                disabled={open || vaild || !enable}
                data-testid="checkout"
              >
                {renderActionText()}
              </Button>
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
  )
}
