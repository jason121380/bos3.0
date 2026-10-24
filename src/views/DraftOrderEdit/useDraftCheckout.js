import React, { useCallback, useState, useEffect } from 'react'
import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { useHistory, useLocation } from 'react-router'
import { handleTidyBill, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import giveBonus from 'helper/giveBonus'
import billPaymentSummary from 'helper/billPaymentSummary'
import { getMissingForDraftOrder } from './draftOrderRequirements'
import { ordersListPath } from './ordersListPath'

// 掛單詳細的「儲存／結帳」與金額彙總（2026/10/21 自 Footer.js 原樣搬出，Footer 只留畫面與列印範本）：
// 送出前檢查、重新結帳密碼、F9 快捷鍵、各項金額與紅利給點、按鈕停用原因。
// passwordData（重新結帳密碼設定查詢）由 Footer 先建立再傳入，查詢送出的先後順序與搬出前相同。
export default function useDraftCheckout({ passwordData }) {
  const history = useHistory()
  const { open, toggle, setOpen } = useToggle()
  const [printOrderDetail, setPrintOrderDetail] = useState([])
  const [isClick, setIsClick] = useState(false)
  const {
    stayInCreateOrder, bill, orderSetting, orderId, order, handleBillChange,
    bonusActive, customerBonus, closureDelayed, bonusSetting, setBill,
    isLineBinded, bonusRewardWithLINE
  } = React.useContext(billContext)
  const [reCheckoutPwd, setReCheckoutPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disableRecheckoutOrders, setDisableRecheckoutOrders] = useState(false)
  const [isRecheckoutOrders, setIsRecheckoutOrders] = useState(false)
  useEffect(() => {
    if (order) {
      const filterOrder = order
      setPrintOrderDetail(filterOrder)
    }
  }, [order])

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

  const location = useLocation()
  const handleReCheckoutOrder = () => {
    setIsClick(true)
    setIsRecheckoutOrders(true)
    const tmp = handleTidyBill(bill)
    // 不檢查服務：bill.serviceOrders 寫入前一律 filter(d => d.serviceId)，checkServicesOrders 不會不通過
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      return;
    } else {
      fetchReCheckoutOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: { ...tmp, isPending: false },
        password: reCheckoutPwd,
      })
        .then(() => {
          toggle()
          openSnackbar({
            message: `掛單結帳成功`,
            variant: 'success',
          })
          // 結帳已成功；導頁失敗不能再被下面的 catch 當成結帳失敗
          try {
            history.push(ordersListPath(location.search))
          } catch (navError) {
            history.push('/management/orders')
          }
          setIsClick(false)
          setOpenDialog(false)
          setIsRecheckoutOrders(false)
          setReCheckoutPwd('')
        }).catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setIsClick(false)
          setIsRecheckoutOrders(false)
        })
    }
  }

  const usehandleSaveDraftOrder = useCallback(() => {
    setIsClick(true)
    setIsRecheckoutOrders(true)
    setOpen(true)
    const tmp = handleTidyBill(bill)
    // 不檢查服務：理由同 handleReCheckoutOrder
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      setOpen(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      setOpen(false)
      return;
    } else {
      fetchReCheckoutOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: { ...tmp, isPending: true },
        password: '',
      })
        .then(() => {
          openSnackbar({
            message: '掛單儲存成功',
            variant: 'success',
          })
          setIsClick(false)
          setIsRecheckoutOrders(false)
          history.push('/management/draft-orders')
        })
        .catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setIsClick(false)
          setIsRecheckoutOrders(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history, setOpen])

  const customerTicketRecords = useFetchTicketRecords({
    ids: bill.useTicketOrders.map(d => d.customerTicketId),
  })

  const vaild = !(
    bill.date &&
    (bill.customerId || bill.withoutCustomerData || bill.customerCellphone) &&
    bill.designerId &&
    (bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)
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

  const serviceTotalPriceArray = idx(bill, _ =>
    _.serviceOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price : 0
    )
  )
  const productTotalPriceArray = idx(bill, _ =>
    _.productOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price * d.count
        : 0
    )
  )
  const membershipTotalPriceArray = idx(bill, _ =>
    _.membershipOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price : 0
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
  const membershipTotalPriceWithoutThirdPartyCoupon = membershipTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )

  const serviceTotalPrice =
    bill.serviceOrders.length > 0 ? bill.serviceOrders.reduce((a, b) => a + b.price, 0) : 0

  const merchantSellTotalPrice =
    bill.productOrders.length > 1
      ? bill.productOrders.reduce((a, b) => (a += b.count * b.price), 0)
      : bill.productOrders.length === 1
        ? bill.productOrders[0].count * bill.productOrders[0].price
        : 0

  const couponSellPrice =
    bill.ticketOrders.length > 1
      ? bill.ticketOrders.reduce((a, b) => (a += b.count * b.price), 0)
      : bill.ticketOrders.length === 1
        ? bill.ticketOrders[0].count * bill.ticketOrders[0].price
        : 0

  const membershipTotalPrice =
    bill.membershipOrders.length > 0 ? bill.membershipOrders.reduce((a, b) => a + b.price, 0) : 0

  const couponUsageTotalPrice = idx(customerTicketRecords, _ =>
    _.data.ticketRecords.data.length > 1
      ? _.data.ticketRecords.data.reduce((r, b) => r + b.price, 0)
      : _.data.ticketRecords.data.length === 1
        ? _.data.ticketRecords.data[0].price
        : 0
  ) ?? 0

  // 只在店家設了重新結帳密碼（disableRecheckoutOrders）時由 Footer 與 F9 呼叫
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
      membershipTotalPriceWithoutThirdPartyCoupon -
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
    couponSellPrice, membershipTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
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
          membershipTotalPriceWithoutThirdPartyCoupon -
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
    couponSellPrice, membershipTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount, bill.customerId, bonusRewardWithLINE,
    // 給點設定可能比帳單晚回來，回來後也要重新計算
    isLineBinded, setBill, bonusSetting
  ])

  // 金額彙總：各列明細的運算式與舊版相同，只加千分位與新版樣式。
  // 業績合計、現金應收只顯示在金額彙總（彙總卡與底部固定列共用），不送後端。
  // 四頁預覽以打帳單為準（Jason 2026/10/22）：
  // - 業績合計維持本頁原式（含第三方卡券、使用預收卡，不含預收卡販賣）
  // - 現金應收與打帳單、帳單詳細、明細、收據共用 billPaymentSummary
  //   （未選商品的店販列價格是 0，與舊式把該列算進去的結果相同）
  // 上方「付款超過應付時歸零」與紅利給點的 effect 用的是各自的運算式，不受影響
  const performanceTotal = Math.round(
    serviceTotalPrice +
    merchantSellTotalPrice +
    couponUsageTotalPrice +
    membershipTotalPrice
  )
  const { cashDue } = billPaymentSummary(bill)
  // 按鈕停用時說明原因（只顯示，不參與停用判斷）：缺什麼與上面的 vaild 同一組條件（見 draftOrderRequirements.js），否則是處理中
  const missing = getMissingForDraftOrder(bill)
  const disabledReason = missing.length > 0 ? `尚缺：${missing.join('、')}` : open || isClick || isRecheckoutOrders ? '處理中，請稍候' : ''

  return {
    open,
    isClick,
    isRecheckoutOrders,
    vaild,
    disableRecheckoutOrders,
    openDialog,
    reCheckoutPwd,
    setReCheckoutPwd,
    handleReCheckoutOrder,
    usehandleSaveDraftOrder,
    handleOpenReCheckout,
    handleCloseDialog,
    serviceTotalPrice,
    merchantSellTotalPrice,
    couponSellPrice,
    couponUsageTotalPrice,
    membershipTotalPrice,
    serviceTotalPriceWithoutThirdPartyCoupon,
    productTotalPriceWithoutThirdPartyCoupon,
    membershipTotalPriceWithoutThirdPartyCoupon,
    performanceTotal,
    cashDue,
    disabledReason,
  }
}
