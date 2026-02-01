/** @jsxImportSource @emotion/react */
import { Button, Card, CardHeader, CardContent, Grid, Typography } from '@mui/material'
import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import { useCallback, useContext, useEffect, useRef, useState, forwardRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import styles from './styles/Footer'
import _ from 'lodash'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import giveBonus from 'helper/giveBonus'

function Footer({ width, setIsFooterFold, isFooterFixed }, footerRef) {
  const { createOrder } = useFetchCreateOrder()
  const stayInCheckOrderDetailMemory = JSON.parse(localStorage.getItem('stayInCheckOrderDetail'))
  const footerSwitchMemory = JSON.parse(localStorage.getItem('footerSwitchMemory'))

  const {
    bill,
    setOrderDetailPaymentShouldPay,
    setCashPayment,
    handleDisplayOrderDetail,
    checkoutBtn,
    setCheckoutBtn,
    stayInCreateOrder,
    isClick,
    setIsClick,
    addKeydown,
    setCheckoutBtnClick,
    checkoutBtnClick,
    setReset,
    openOrderDetail,
    setBill,
    bonusSetting,
    isLineBinded,
    bonusRewardWithLINE,
    disablePendingOrder
  } = useContext(billContext)
  const history = useHistory()
  const { open, toggle, setOpen } = useToggle()
  const useCreateOrder = useRef(createOrder)
  const [fold, setFold] = useState(footerSwitchMemory !== null ? footerSwitchMemory : false)
  const valid = !(
    bill.date &&
    bill.designerId &&
    (bill.customerId !== undefined ||
      bill.withoutCustomerData ||
      bill.customerCellphone.length > 0) &&
    (bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)
  )

  const handleBtnDisabled = type => {
    if (type) {
      setCheckoutBtn(true);
      setCheckoutBtnClick(true)
      setIsClick(true);
      setOpen(true)
    } else {
      setCheckoutBtn(false);
      setIsClick(false);
      setCheckoutBtnClick(false)
      setOpen(true)
    }
  }

  const disabledCreateOrder = open || valid

  // 打帳單
  const usehandleCreateOrder = useCallback(() => {
    handleBtnDisabled(true)
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkService.verify) {
      openSnackbar({
        message: checkService.message,
        variant: "error",
      });
      handleBtnDisabled(false)
      return
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      handleBtnDisabled(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      handleBtnDisabled(false)
      return;
    } else {
      useCreateOrder
        .current(tmp)
        .then(() => {
          if (stayInCreateOrder) {
            openSnackbar({
              message: '帳單新增成功',
              variant: 'success',
            })
            setReset('reset')
            setTimeout(() => {
              setCheckoutBtn(false);
              setCheckoutBtnClick(false)
              setIsClick(false);
              setReset('')
              clearTimeout()
              setOpen(false)
            }, 500);
          } else {
            history.push('/management/orders')
          }
        })
        .catch(err => {
          setCheckoutBtn(false)
          setCheckoutBtnClick(false)
          setIsClick(false)
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history, stayInCreateOrder])

  // 掛單
  const usehandleCreateDraftOrder = useCallback(() => {
    setIsClick(true)
    setCheckoutBtn(true)
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
      handleBtnDisabled(false)
      return
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      handleBtnDisabled(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      handleBtnDisabled(false)
      return;
    } else {
      useCreateOrder
        .current({ ...tmp, isPending: true })
        .then(() => {
          openSnackbar({
            message: '掛單新增成功',
            variant: 'success',
          })
          setIsClick(false)
          setCheckoutBtn(false)
          if (stayInCreateOrder) {
            window.location.reload()
          } else {
            history.push('/management/draft-orders')
          }
        })
        .catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setIsClick(false)
          setCheckoutBtn(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history])

  // 掛單彈窗
  const handleOrderPendingConfirm = () => {
    openSnackbar({
      message: `確認要掛單嗎，掛單只會紀錄此筆訂單的紀錄，不會正式成立訂單唷`,
      variant: 'error',
      disableHide: true,
      resign: true,
      orderPending: true,
      usehandleCreateDraftOrder: usehandleCreateDraftOrder,
    })
  }

  useEffect(() => {
    // 快捷鍵
    const handleCreateOrderShortCut = event => {
      event.code === 'F9' && !disabledCreateOrder && usehandleCreateOrder()
      event.code === 'Insert' && !disabledCreateOrder && usehandleCreateOrder()
      if (event.code === 'F8') {
        handleDisplayOrderDetail()
        document.removeEventListener('keydown', handleCreateOrderShortCut)
      }
    }
    if (openOrderDetail) return
    if (!valid && !isClick && !checkoutBtn) {
      document.addEventListener('keydown', handleCreateOrderShortCut, false)
      return () => {
        document.removeEventListener('keydown', handleCreateOrderShortCut)
      }
    }
  }, [disabledCreateOrder, usehandleCreateOrder, addKeydown, openOrderDetail])

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
  useEffect(() => {
    setOrderDetailPaymentShouldPay(
      serviceTotalPriceWithoutThirdPartyCoupon +
      productTotalPriceWithoutThirdPartyCoupon +
      couponSellPrice +
      merberShipCardTotalPriceWithoutThirdPartyCoupon
    )
    setCashPayment(
      serviceTotalPriceWithoutThirdPartyCoupon +
      productTotalPriceWithoutThirdPartyCoupon +
      couponSellPrice +
      merberShipCardTotalPriceWithoutThirdPartyCoupon -
      bill.walletPay -
      bill.amountByOtherPay -
      bill.bonusDecount
    )
  }, [bill]);
  const handleFooterFold = () => {
    if (fold) {
      localStorage.removeItem('footerSwitchMemory')
      setFold(!fold)
      setIsFooterFold(!fold)
    } else {
      localStorage.setItem('footerSwitchMemory', true)
      setFold(!fold)
      setIsFooterFold(!fold)
    }
  }
  // 移除座位開單相關邏輯

  // 移除座位開單相關功能函式

  useEffect(() => {
    if (
      serviceTotalPriceWithoutThirdPartyCoupon +
      productTotalPriceWithoutThirdPartyCoupon +
      couponSellPrice +
      merberShipCardTotalPriceWithoutThirdPartyCoupon -
      bill.walletPay -
      bill.amountByOtherPay -
      bill.bonusDecount < 0
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

  const Header = () => (
    <div onClick={handleFooterFold} css={styles.switchDiv}>
      {fold ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      <Typography css={styles.heading}>{fold ? '顯示業績明細' : '隱藏業績明細'}</Typography>
    </div>
  )

  return (
    <Card
      ref={footerRef}
      css={isFooterFixed ? styles.card : styles.cardNoFixed}
      style={{
        width: width >= 1440 ? `${width - 256}px` : width >= 1280 ? `${width - 258}px` : `${width - 57}px`
      }}
    >
      <div style={{ textAlign: 'center', padding: '16px' }}>
        {!disablePendingOrder && (
          <Button
            size="large"
            variant="contained"
            color="primary"
            css={styles.pendingBtn}
            onClick={handleOrderPendingConfirm}
            disabled={valid || isClick || checkoutBtn}
          >
            掛單
          </Button>
        )}

        <Button
          size="large"
          variant="contained"
          color="error"
          onClick={() =>
            stayInCheckOrderDetailMemory ? handleDisplayOrderDetail() : usehandleCreateOrder()
          }
          disabled={valid || checkoutBtn || isClick}
          data-testid="checkout"
          css={styles.checkoutBtn}
        >
          結帳
        </Button>

        <Button
          size="large"
          variant="contained"
          color="primary"
          css={styles.detailBtn2}
          disabled={valid || checkoutBtn || isClick}
          onClick={() => handleDisplayOrderDetail()}
        >
          明細
        </Button>
      </div>
    </Card>
  )
}

export default forwardRef(Footer)