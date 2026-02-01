/** @jsxImportSource @emotion/react */
import { Grid, Typography, Button, FormControlLabel, Checkbox, TextField, Card } from '@mui/material'
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
import PageTitle from 'components/PageTitle'
import produce from 'immer'
import ShortcutDialog from '../../components/ShortcutDialog'

import styles from './styles/Header'
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
    // 座位開單
    const seatNum = location.search.replace('?order=', '')
    setRoute(seatNum)
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

  // handle座位開單
  const handleSeatOrderPendingConfirm = useCallback(() => {
    setCheckoutBtn(true);
    setIsClick(true);
    setOpen(true)
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)
    if (route) {
      tmp.seatNumber = parseInt(route);
      tmp.isPending = true;
    }
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
            message: "座位開單新增成功",
            variant: "success",
          });
          setCheckoutBtn(false);
          setIsClick(false);
          history.push("/seat-order-manage");
        })
        .catch((err) => {
          openSnackbar({
            message: err.message,
            variant: "error",
          });
          setCheckoutBtn(false);
          setIsClick(false);
        })
        .finally(() => {
          setOpen(false)
        });
    }
  }, [bill, history]);

  const shortCutClose = () => {
    setShortcutModal(false)
  }

  return (
    <Fragment>
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
      <Card {...rest} css={styles.root}>
        <div css={styles.titleGroup}>
          <PageTitle title='打帳單' />
          <Button
            onClick={() => setOpenModal(true)}
            variant='contained'
            css={styles.searchBtn}
          >
            帳單速查
          </Button>
          {lastOrderStatus !== undefined && lastOrderStatus.orderNo !== 0 && (
            <Typography style={{ marginLeft: 12, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              上一筆訂單:#{lastOrderStatus.orderNo}
            </Typography>
          )}
        </div>

        <div css={styles.actionGroup}>

          <FormControlLabel
            css={styles.checkboxLabel}
            control={<Checkbox size="small" color="primary" />}
            label="結帳前確認明細"
            checked={checkOrderDetail}
            onChange={handleCheckoutOrderDetail}
          />

          {!disablePendingOrder && !route && (
            <FormControlLabel
              css={styles.checkboxLabel}
              control={<Checkbox size="small" color="primary" />}
              label="連續打單結帳"
              checked={stayInCreateOrder}
              onChange={handleStayInCreateOrderBtn}
            />
          )}

          <div css={styles.btnDiv}>
            {!disablePendingOrder && (
              <Button
                variant="contained"
                css={styles.actionBtn}
                onClick={route ? handleSeatOrderPendingConfirm : handleOrderPendingConfirm}
                disabled={valid || isClick || checkoutBtn || checkoutBtnClick}
              >
                {route ? '座位掛單' : '掛單'}
              </Button>
            )}

            <Button
              variant="contained"
              css={styles.actionBtn}
              onClick={() => handleDisplayOrderDetail()}
              disabled={valid || checkoutBtn || isClick || checkoutBtnClick}
            >
              明細
            </Button>

            <Button
              variant="contained"
              css={styles.checkoutBtn}
              onClick={() => checkOrderDetail ? handleDisplayOrderDetail() : usehandleCreateOrder()}
              disabled={valid || checkoutBtn || isClick || checkoutBtnClick}
            >
              結帳
            </Button>
          </div>
        </div>
      </Card>
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
