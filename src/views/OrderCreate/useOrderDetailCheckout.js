import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import billContext from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import { useHistory } from 'react-router'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'

// 打帳單「消費明細」彈窗的送出（2026/10/21 自 OrderDetailModal.js 原樣搬出）：結帳／結帳並列印／掛單、F9／F8 快捷鍵、
// 把 #printMain／#printThermal 的內容寫進列印視窗（printDiv）、返回。列印範本本身仍在 OrderDetailModal.js，
// 以這裡建立的 printMainRef／printThermalRef 掛上。
export default function useOrderDetailCheckout({ onClose, orderDetailPrintLayout }) {
  const {
    bill,
    stayInCreateOrder,
    addKeydown,
    setAddKeyDown,
    setCheckoutBtnClick,
    setReset,
    closureDelayed,
  } = useContext(billContext)
  const { createOrder } = useFetchCreateOrder()
  const { open, toggle, setOpen } = useToggle()
  const useCreateOrder = useRef(createOrder)
  const history = useHistory()

  const [isClick, setIsClick] = useState(false)
  const [orderNumber, setOrderNumber] = useState(0)
  const [checkoutBtn, setCheckoutBtn] = useState(false)
  const [orderNoInPrint, setOrderNoInPrint] = useState('')
  const checkOrderRef = useRef(null)
  const checkOrderPrintRef = useRef(null)
  const printMainRef = useRef()
  const printThermalRef = useRef()

  const valid = !(
    bill.date &&
    bill.designerId &&
    (bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)
  )

  const handleBtnDisabled = type => {
    if (type) {
      if (checkOrderRef.current) checkOrderRef.current.disabled = true
      if (checkOrderPrintRef.current) checkOrderPrintRef.current.disabled = true
      setCheckoutBtn(true)
      setCheckoutBtnClick(true)
      setIsClick(true)
      setOpen(true)
    } else {
      setCheckoutBtn(false);
      setIsClick(false);
      setCheckoutBtnClick(false)
      setOpen(open)
    }
  }

  const usehandleCreateOrder = useCallback(isPrint => {
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
      return;
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
        .then(res => {
          setOrderNumber(res.data.createOrder2)
          setCheckoutBtn(false)
          openSnackbar({
            message: '帳單新增成功',
            variant: 'success',
          })
          if (stayInCreateOrder) {
            setReset('reset')
            closeModal()
            setTimeout(() => {
              setCheckoutBtn(false);
              setCheckoutBtnClick(false)
              setIsClick(false);
              setReset('')
              clearTimeout()
            }, 500);
          } else {
            history.push('/management/orders')
          }
        })
        .catch(err => {
          setCheckoutBtn(false)
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setCheckoutBtnClick(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history, setCheckoutBtnClick, setOpen, setReset])

  const usehandleCreateOrderAndPrint = useCallback(() => {
    if (!printMainRef.current || !printThermalRef.current) return
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
      return;
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
        .then(res => {
          setOrderNumber(res.data.createOrder2)
          setCheckoutBtn(false)
          setIsClick(false)
          openSnackbar({
            message: '帳單新增成功',
            variant: 'success',
          })
          setOrderNoInPrint(res.data.createOrder2)
          if (stayInCreateOrder) {
            printDiv()
            setTimeout(() => {
              closeModal()
              setReset('reset')
              setCheckoutBtn(false);
              setCheckoutBtnClick(false)
              setIsClick(false);
              setReset('')
              clearTimeout()
            }, 500);
          } else {
            printDiv()
            history.push('/management/orders')
          }
        })
        .catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setCheckoutBtnClick(false)
          setCheckoutBtn(false)
          setIsClick(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history, setCheckoutBtnClick, setOpen, setReset])

  const usehandleCreateDraftOrder = useCallback(() => {
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
      return;
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
          setCheckoutBtnClick(false)
          setCheckoutBtn(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history, setCheckoutBtnClick, setOpen])

  useEffect(() => {
    const handleCreateOrderShortCut = event => {
      if (event.code === 'F9') {
        document.removeEventListener('keydown', handleCreateOrderShortCut)
        usehandleCreateOrder()
      }
      if (event.code === 'F8') {
        const returnString = usehandleCreateOrderAndPrint()
        returnString !== 'null dom' && document.removeEventListener('keydown', handleCreateOrderShortCut)
      }
    }
    document.addEventListener('keydown', handleCreateOrderShortCut, false)
    return () => {
      document.removeEventListener('keydown', handleCreateOrderShortCut)
    }
  }, [usehandleCreateOrder])

  function printDiv() {
    var printMain = printMainRef.current
    var printThermal = printThermalRef.current

    var newWin = window.open('', 'Print-Window')
    if (orderDetailPrintLayout === 'A4') {
      newWin.document.write(
        '<html><body onload="window.print()" style="margin: 0mm 5mm;">' +
        printMain.innerHTML +
        '</body></html>'
      )
    } else if (orderDetailPrintLayout === '感熱紙(80mm)') {
      newWin.document.write(
        '<html><style>@page {margin: 1mm; width:78mm;}</style><body onload="window.print()" style="width:78mm">' +
        printThermal.innerHTML +
        '</body></html>'
      )
    } else if (orderDetailPrintLayout === '感熱紙(57mm)') {
      newWin.document.write(
        '<html><style>@page {margin: 1mm; width:56mm;}</style><body onload="window.print()" style="width:56mm">' +
        printThermal.innerHTML +
        '</body></html>'
      )
    } else {
      newWin.document.write(
        '<html><style>@page {margin: 1mm;}</style><body onload="window.print()">' +
        printThermal.innerHTML +
        '</body></html>'
      )
    }

    if (closureDelayed) {
      setTimeout(function () {
        newWin.print()
      }, 100)
      setTimeout(() => {
        newWin.close()
      }, 10000);
    } else {
      newWin.document.close()
      setTimeout(function () {
        newWin.close()
      }, 1000)
    }
  }
  // 移除座號相關邏輯

  const handleOrderPendingConfirm = () => {
    openSnackbar({
      message: `確認要掛單嗎，掛單只會紀錄此筆帳單的紀錄，不會正式成立帳單唷`,
      variant: 'error',
      disableHide: true,
      resign: true,
      orderPending: true,
      usehandleCreateDraftOrder: usehandleCreateDraftOrder,
    })
  }
  // 移除座位掛單相關功能
  const closeModal = () => {
    onClose()
    setAddKeyDown(addKeydown + 1)
  }

  return {
    isClick,
    orderNumber,
    checkoutBtn,
    orderNoInPrint,
    checkOrderRef,
    checkOrderPrintRef,
    printMainRef,
    printThermalRef,
    valid,
    usehandleCreateOrder,
    usehandleCreateOrderAndPrint,
    handleOrderPendingConfirm,
    closeModal,
  }
}
