/** @jsxImportSource @emotion/react */
import { Fragment, useContext, useEffect, useState, useCallback, useRef } from 'react'
import billContext from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import { useHistory, useLocation } from 'react-router'
import useToggle from 'hooks/useToggle'
import { openSnackbar } from 'elements/snackbars'
import { falseFunc } from 'boolbase'
import useFetchMerchantOrderDetailPrintLayout from 'hooks/useFetchGetMerchantPrintFormatSettings'
import idx from 'idx'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import ShortcutDialog from '../../components/ShortcutDialog'

import { History, ReceiptText } from 'lucide-react'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import OrderDetailModal from './OrderDetailModal'
import _ from 'lodash'

function Header({ forceUpdate, ...rest }) {
  const location = useLocation()
  const history = useHistory();
  const { createOrder } = useFetchCreateOrder();
  const { setOpen } = useToggle()
  const {
    bill,
    openOrderDetail,
    setOpenOrderDetail,
    setCheckOrderDetailSwitch,
    handleDisplayOrderDetail,
    checkoutBtn,
    setCheckoutBtn,
    setStayInCreateOrder,
    stayInCreateOrder,
    isClick,
    setIsClick,
    lastOrderStatusData,
    setCheckoutBtnClick,
    checkoutBtnClick,
    setReset,
    setBill,
    serialNumberUsing,
    shortBtnDisable,
    comboActive,
    disablePendingOrder,
    handleShortcutChange
  } = useContext(billContext)
  const useCreateOrder = useRef(createOrder)
  const stayInCreateOrderInMemory = JSON.parse(
    localStorage.getItem("stayInCreateOrder")
  );
  const stayInCheckOrderDetailMemory = JSON.parse(
    localStorage.getItem("stayInCheckOrderDetail")
  );
  const [checkOrderDetail, setCheckOrderDetail] = useState(
    stayInCheckOrderDetailMemory !== null ? stayInCheckOrderDetailMemory : false
  );
  const merchantOrderDetailPrintLayoutData = useFetchMerchantOrderDetailPrintLayout();
  const userOrderableList = useFetchUsersOrderableList();
  const getHelperForPrint = idx(userOrderableList, (_) => _.data.getUserOrderableList);
  const [orderDetailPrintLayout, setOrderDetailPrintLayout] = useState("A4");
  const [lastOrderStatus, setLastOrderStatus] = useState()
  const [openModal, setOpenModal] = useState(false)
  const [route, setRoute] = useState()
  const [shortcutModal, setShortcutModal] = useState(false)

  useEffect(() => {
    if (!merchantOrderDetailPrintLayoutData.loading) {
      const merchantOrderDetailPrintLayout = idx(
        merchantOrderDetailPrintLayoutData,
        (_) => _.data.getMerchantPrintFormatSettings
      );
      setOrderDetailPrintLayout(merchantOrderDetailPrintLayout);
    }
  }, [merchantOrderDetailPrintLayoutData.loading]);

  useEffect(() => {
    if (!lastOrderStatusData.loading) {
      // 拿取上一張單的指定不指定狀態 並帶入當前的訂單
      const status = idx(lastOrderStatusData, _ => _.data.getLatestOrderStatus)
      setLastOrderStatus(status)
    }
  }, [lastOrderStatusData.loading])

  useEffect(() => {
    // 移除座位開單相關邏輯
  }, [location.pathname])

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
      setOpen(false)
    }
  }

  // 打帳單mutation
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
          openSnackbar({
            message: "帳單新增成功",
            variant: "success",
          });
          setCheckoutBtn(false);
          setIsClick(false);
          if (stayInCreateOrderInMemory) {
            openSnackbar({
              message: "帳單新增成功",
              variant: "success",
            });
            setReset('reset')
            setTimeout(() => {
              setCheckoutBtn(false);
              setCheckoutBtnClick(false)
              setIsClick(false);
              setReset('')
              clearTimeout()
            }, 500);
          } else {
            openSnackbar({
              message: "帳單新增成功",
              variant: "success",
            });
            setTimeout(() => {
              history.push("/management/orders");
            }, 250);
          }
        })
        .catch((err) => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          handleBtnDisabled(false)
        })
        .finally(() => {
          setOpen(false)
        });
    }
  }, [bill, history, stayInCreateOrderInMemory]);

  // 掛單mutation
  const usehandleCreateDraftOrder = useCallback(() => {
    setIsClick(true);
    setCheckoutBtn(true);
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
            message: "掛單新增成功",
            variant: "success",
          });
          setIsClick(false);
          setCheckoutBtn(false);
          history.push("/management/draft-orders");
        })
        .catch((err) => {
          setIsClick(false);
          setCheckoutBtn(false);
          openSnackbar({
            message: err.message,
            variant: "error",
          });
        })
        .finally(() => {
          setOpen(false)
        });
    }
  }, [bill, history]);

  // 連續打單結帳
  const handleStayInCreateOrderBtn = () => {
    if (!stayInCreateOrder) {
      setStayInCreateOrder(true);
      localStorage.setItem("stayInCreateOrder", true);
    } else {
      localStorage.removeItem("stayInCreateOrder");
      setStayInCreateOrder(false);
    }
  }

  // 結帳前確認明細
  const handleCheckoutOrderDetail = () => {
    if (
      stayInCheckOrderDetailMemory !== null
        ? stayInCheckOrderDetailMemory
        : checkOrderDetail
    ) {
      localStorage.removeItem("stayInCheckOrderDetail");
      setCheckOrderDetail(!checkOrderDetail);
      setCheckOrderDetailSwitch(!checkOrderDetail);
    } else {
      localStorage.setItem("stayInCheckOrderDetail", true);
      setCheckOrderDetail(!checkOrderDetail);
      setCheckOrderDetailSwitch(!checkOrderDetail);
    }
  };

  // 掛單跳彈窗
  const handleOrderPendingConfirm = () => {
    openSnackbar({
      message: `確認要掛單嗎，掛單只會紀錄此筆訂單的紀錄，不會正式成立訂單唷`,
      variant: "error",
      disableHide: true,
      resign: true,
      orderPending: true,
      usehandleCreateDraftOrder: usehandleCreateDraftOrder,
    })
  }

  // 移除座位開單相關功能函式

  const shortCutClose = () => {
    setShortcutModal(false)
  }

  const actionDisabled = valid || checkoutBtn || isClick || checkoutBtnClick
  // 頁首（STYLE.md §4）：左側標題與輔助資訊，右側結帳設定與動作；「結帳」為本頁唯一的主要按鈕
  return (
    <Fragment>
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
      <div {...rest} className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-title !font-bold text-text">打帳單</h1>
          <Button size="sm" variant="secondary" onClick={() => setOpenModal(true)}>
            <ReceiptText strokeWidth={1.75} />
            帳單速查
          </Button>
          {lastOrderStatus !== undefined && lastOrderStatus.orderNo !== 0 && (
            <span className="flex items-center gap-1 text-label tabular-nums text-text-secondary">
              <History className="h-4 w-4" strokeWidth={1.75} />
              上一筆訂單 #{lastOrderStatus.orderNo}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-body text-text">
            <Checkbox checked={checkOrderDetail} onChange={handleCheckoutOrderDetail} />
            結帳前確認明細
          </label>
          {!disablePendingOrder && (
            <label className="flex cursor-pointer items-center gap-2 text-body text-text">
              <Checkbox checked={stayInCreateOrder} onChange={handleStayInCreateOrderBtn} />
              連續打單結帳
            </label>
          )}
          <div className="flex items-center gap-2">
            {!disablePendingOrder && (
              <Button
                variant="secondary"
                onClick={handleOrderPendingConfirm}
                disabled={valid || isClick || checkoutBtn || checkoutBtnClick}
              >
                掛單
              </Button>
            )}
            <Button variant="secondary" onClick={() => handleDisplayOrderDetail()} disabled={actionDisabled}>
              明細
            </Button>
            <Button
              variant="primary"
              className="px-6"
              onClick={() => checkOrderDetail ? handleDisplayOrderDetail() : usehandleCreateOrder()}
              disabled={actionDisabled}
            >
              結帳
            </Button>
          </div>
        </div>
      </div>
      {openOrderDetail && (
        <OrderDetailModal
          openOrderDetail={openOrderDetail}
          onClose={() => setOpenOrderDetail(falseFunc)}
          orderDetailPrintLayout={orderDetailPrintLayout}
          getHelperForPrint={getHelperForPrint}
        />
      )}
      <ShortcutDialog open={shortcutModal} handleOnClose={shortCutClose} handleShortcutChange={handleShortcutChange} />
    </Fragment>
  );
}

export default Header;
