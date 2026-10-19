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
import { Card } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import OrderDetailModal from './OrderDetailModal'
import { getMissingForOrder } from './orderRequirements'
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
  // 按鈕停用時說明原因，不讓使用者猜：缺什麼（與上面的 valid 同一組條件，見 orderRequirements.js）或處理中
  const missing = getMissingForOrder(bill)
  const disabledReason = missing.length > 0 ? `尚缺：${missing.join('、')}` : actionDisabled ? '處理中，請稍候' : ''
  // 頁首（STYLE.md §4）：左側標題與輔助資訊，右側結帳設定與動作；「結帳」為本頁唯一的主要按鈕
  return (
    <Fragment>
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
      <div {...rest} className="ui-root noprint flex flex-col gap-4 pb-6">
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

        {/* 操作列：選項在左、按鈕在右，兩者分開排列，不再擠在同一串 */}
        <Card className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
          </div>
          <div className="flex flex-col items-end gap-1.5 max-sm:w-full">
            <div className="flex items-center gap-3">
              {!disablePendingOrder && (
                <span title={disabledReason || undefined} className="inline-flex">
                  <Button
                    variant="secondary"
                    onClick={handleOrderPendingConfirm}
                    disabled={valid || isClick || checkoutBtn || checkoutBtnClick}
                  >
                    掛單
                  </Button>
                </span>
              )}
              <span title={disabledReason || undefined} className="inline-flex">
                <Button variant="secondary" onClick={() => handleDisplayOrderDetail()} disabled={actionDisabled}>
                  明細
                </Button>
              </span>
              <span title={disabledReason || undefined} className="inline-flex">
                {/* 停用時改成深字灰底（原本是淡藍底白字，對比不足） */}
                <Button
                  variant="primary"
                  className="px-8 disabled:bg-surface-active disabled:text-text-secondary disabled:opacity-100"
                  onClick={() => checkOrderDetail ? handleDisplayOrderDetail() : usehandleCreateOrder()}
                  disabled={actionDisabled}
                >
                  結帳
                </Button>
              </span>
            </div>
            {disabledReason && (
              <p role="status" className="m-0 text-caption text-warning max-sm:text-right">
                {disabledReason}
              </p>
            )}
          </div>
        </Card>
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
