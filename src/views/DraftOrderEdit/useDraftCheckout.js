import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client'
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
import { ordersListPath, ordersListPathForOrderDate } from './ordersListPath'
import {
  confirmDraftStillPending,
  confirmDraftStillPendingOnDates,
  evictCheckedOutDraft,
  isUncertainCheckoutError,
  rememberCheckedOutDraft,
} from './draftCheckoutGuard'

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
  // checking：進頁先確認還是不是掛單；blocked：逾時後查不到狀態，禁止再結帳；closed：已結帳
  const [draftGate, setDraftGate] = useState('checking')
  const client = useApolloClient()
  const mountedRef = useRef(true)
  const leaveDraftRef = useRef(false)
  useEffect(() => () => {
    mountedRef.current = false
  }, [])
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
  const orderDate = order && order.date

  const leaveCheckedOutDraft = (draftId, closedId, listPath) => {
    leaveDraftRef.current = true
    rememberCheckedOutDraft(draftId, closedId, listPath)
    evictCheckedOutDraft(client.cache, draftId)
    if (mountedRef.current) setDraftGate('closed')
  }

  const goToClosedBill = (draftId, closedId, listPath) => {
    const target = closedId && closedId !== draftId ? `/order/${closedId}` : (listPath || '/management/orders')
    try {
      history.replace(target)
    } catch (navError) {
      history.replace('/management/orders')
    }
  }

  // 進頁就查這張掛單是否還在當天掛單清單。不在（且清單完整）就離開，避免已結帳的網址還能再結一次。
  useEffect(() => {
    if (!orderId) return undefined
    if (!orderDate) {
      if (order && typeof order === 'object') {
        setDraftGate(gate => (gate === 'checking' ? 'open' : gate))
      }
      return undefined
    }
    let cancelled = false
    confirmDraftStillPending(client, orderId, orderDate).then(status => {
      if (cancelled || leaveDraftRef.current || !mountedRef.current) return
      if (status === 'closed') {
        const listPath = ordersListPathForOrderDate(orderDate)
        leaveCheckedOutDraft(orderId, '', listPath)
        openSnackbar({ message: '這張掛單已結帳，不能再次結帳', variant: 'warning' })
        goToClosedBill(orderId, '', listPath)
        return
      }
      setDraftGate(gate => (gate === 'checking' ? 'open' : gate))
    })
    return () => {
      cancelled = true
    }
  }, [orderId, orderDate])

  const handleReCheckoutOrder = () => {
    if (isRecheckoutOrders || draftGate === 'checking' || draftGate === 'blocked' || draftGate === 'closed') return
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
      const draftId = orderSetting.orderId
      fetchReCheckoutOrder({
        updateOrderId: draftId,
        orderInput: { ...tmp, isPending: false },
        password: reCheckoutPwd,
      })
        .then(result => {
          const closedId = result && result.data && result.data.reCheckoutOrder && result.data.reCheckoutOrder.id
          const listPath = ordersListPath(location.search)
          // 先記住再導頁：導頁若因 chunk 失敗白屏，重新整理或再開原掛單網址也不會再結一次
          leaveCheckedOutDraft(draftId, closedId || '', listPath)
          toggle()
          openSnackbar({
            message: `掛單結帳成功`,
            variant: 'success',
          })
          // 後端若回了另一張帳單 id（正式站結帳會換 UUID），直接打開那張帳單詳細；否則回原日期的帳單列表
          goToClosedBill(draftId, closedId, listPath)
          if (!mountedRef.current) return
          setIsClick(false)
          setOpenDialog(false)
          setIsRecheckoutOrders(false)
          setReCheckoutPwd('')
        }).catch(err => {
          if (!isUncertainCheckoutError(err)) {
            openSnackbar({
              message: err.message,
              variant: 'error',
            })
            setIsClick(false)
            setIsRecheckoutOrders(false)
            return
          }
          const date = bill.date || orderDate
          // 編輯過的帳單日期與當初存下的掛單日期可能不同；只查一邊會把仍掛著的草稿誤判成已結帳
          confirmDraftStillPendingOnDates(client, draftId, [orderDate, bill.date]).then(status => {
            if (!mountedRef.current || leaveDraftRef.current) return
            if (status === 'closed') {
              const listPath = date ? ordersListPathForOrderDate(date) : ordersListPath(location.search)
              leaveCheckedOutDraft(draftId, '', listPath)
              openSnackbar({
                message: '這張掛單已結帳，請到帳單列表確認，不要重複結帳',
                variant: 'warning',
              })
              setOpenDialog(false)
              setIsClick(false)
              setIsRecheckoutOrders(false)
              goToClosedBill(draftId, '', listPath)
              return
            }
            if (status === 'unknown') {
              setDraftGate('blocked')
              setOpenDialog(false)
              setIsClick(false)
              setIsRecheckoutOrders(false)
              openSnackbar({
                message: '無法確認結帳是否成功。請先到帳單列表查看，不要重複結帳。',
                variant: 'error',
              })
              return
            }
            openSnackbar({
              message: '網路連線異常，這張掛單尚未結帳，請再確認一次',
              variant: 'error',
            })
            setIsClick(false)
            setIsRecheckoutOrders(false)
          })
        })
    }
  }

  const usehandleSaveDraftOrder = useCallback(() => {
    if (draftGate === 'checking' || draftGate === 'blocked' || draftGate === 'closed') return
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
  }, [bill, history, setOpen, draftGate])

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
        if (draftGate === 'checking' || draftGate === 'blocked' || draftGate === 'closed') return
        disableRecheckoutOrders ? handleOpenReCheckout() : handleReCheckoutOrder()
      }
    }
    document.addEventListener('keydown', handleEditOrderShortCut, false)
    return () => {
      document.removeEventListener('keydown', handleEditOrderShortCut)
    }
  }, [disabledEditOrder, handleReCheckoutOrder, disableRecheckoutOrders, draftGate])

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
  const checkoutLocked = draftGate === 'checking' || draftGate === 'blocked' || draftGate === 'closed'
  const disabledReason = missing.length > 0
    ? `尚缺：${missing.join('、')}`
    : draftGate === 'blocked'
      ? '無法確認是否已結帳，請到帳單列表確認'
      : draftGate === 'closed'
        ? '這張掛單已結帳'
        : open || isClick || isRecheckoutOrders || draftGate === 'checking'
          ? '處理中，請稍候'
          : ''

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
    checkoutLocked,
  }
}
