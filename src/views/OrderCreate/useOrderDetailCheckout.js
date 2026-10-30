import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import billContext from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import { useHistory } from 'react-router'
import { handleTidyBill, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'

// 打帳單「消費明細」彈窗的送出（2026/10/21 自 OrderDetailModal.js 原樣搬出）：結帳／結帳並列印／掛單、F9／F8 快捷鍵、
// 把 #printMain／#printThermal 的內容寫進列印視窗（printDiv）、返回。列印範本本身仍在 OrderDetailModal.js，
// 以這裡建立的 printMainRef／printThermalRef 掛上。
export default function useOrderDetailCheckout({ onClose, orderDetailPrintLayout }) {
  const { bill, stayInCreateOrder, setCheckoutBtnClick, setReset, closureDelayed } = useContext(billContext)
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
  // 已送出帳單（結帳／結帳並列印／掛單）、還沒失敗：F9／F8 不再送。原本按 F9／F8 一律先移除鍵盤監聽，
  // 被逐列檢查擋下（缺店販商品、會員卡缺欄位等）或送出失敗時監聽不會掛回，之後再按 F9／F8 都沒反應
  const sentRef = useRef(false)

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
      // 上面直接停用的 DOM 也要恢復：被逐列檢查擋下時停用與恢復在同一次更新，React 看到 disabled 前後都是 false，
      // 不會改回 DOM，按鈕原本會一直停用到返回重開明細
      if (checkOrderRef.current) checkOrderRef.current.disabled = false
      if (checkOrderPrintRef.current) checkOrderPrintRef.current.disabled = false
      setCheckoutBtn(false)
      setIsClick(false)
      setCheckoutBtnClick(false)
      setOpen(open)
    }
  }

  const usehandleCreateOrder = useCallback(
    isPrint => {
      handleBtnDisabled(true)
      const tmp = handleTidyBill(bill)
      const checkProduct = checkProductOrders(tmp.productOrders)
      const checkMember = checkMembershipOrders(tmp.membershipOrders)

      if (!checkProduct.verify) {
        openSnackbar({
          message: checkProduct.message,
          variant: 'error',
        })
        handleBtnDisabled(false)
        return
      } else if (!checkMember.verify) {
        openSnackbar({
          message: checkMember.message,
          variant: 'error',
        })
        handleBtnDisabled(false)
        return
      } else {
        sentRef.current = true
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
                setCheckoutBtn(false)
                setCheckoutBtnClick(false)
                setIsClick(false)
                setReset('')
                clearTimeout()
              }, 500)
            } else {
              history.push('/management/orders')
            }
          })
          .catch(err => {
            sentRef.current = false
            setCheckoutBtn(false)
            setCheckoutBtnClick(false)
            // 與「結帳並列印」失敗相同，恢復按鈕讓使用者可再按
            setIsClick(false)
          })
          .finally(() => {
            setOpen(false)
          })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（closeModal、handleBtnDisabled、stayInCreateOrder）；只在 [bill, history, setCheckoutBtnClick, setOpen, setReset] 變動時呼叫，補上會每次 render 重跑
    [bill, history, setCheckoutBtnClick, setOpen, setReset]
  )

  const usehandleCreateOrderAndPrint = useCallback(() => {
    // 明細還在載入（列印範本尚未掛上）：不送出。回傳 'null dom' 讓 F8 快捷鍵知道沒有送出、保留鍵盤監聽
    // （原本回傳 undefined，F8 一律移除監聽，之後 F8／F9 都失效）
    if (!printMainRef.current || !printThermalRef.current) return 'null dom'
    handleBtnDisabled(true)
    const tmp = handleTidyBill(bill)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: 'error',
      })
      handleBtnDisabled(false)
      return
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: 'error',
      })
      handleBtnDisabled(false)
      return
    } else {
      sentRef.current = true
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
              setCheckoutBtn(false)
              setCheckoutBtnClick(false)
              setIsClick(false)
              setReset('')
              clearTimeout()
            }, 500)
          } else {
            printDiv()
            history.push('/management/orders')
          }
        })
        .catch(err => {
          sentRef.current = false
          setCheckoutBtnClick(false)
          setCheckoutBtn(false)
          setIsClick(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（closeModal、handleBtnDisabled、printDiv、stayInCreateOrder）；只在 [bill, history, setCheckoutBtnClick, setOpen, setReset] 變動時呼叫，補上會每次 render 重跑
  }, [bill, history, setCheckoutBtnClick, setOpen, setReset])

  const usehandleCreateDraftOrder = useCallback(() => {
    handleBtnDisabled(true)
    const tmp = handleTidyBill(bill)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: 'error',
      })
      handleBtnDisabled(false)
      return
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: 'error',
      })
      handleBtnDisabled(false)
      return
    } else {
      sentRef.current = true
      useCreateOrder
        .current({ ...tmp, isPending: true })
        .then(() => {
          openSnackbar({
            message: '掛單新增成功',
            variant: 'success',
          })
          if (stayInCreateOrder) {
            // 連續打單：原本整頁 reload，改為與「結帳」成功相同的清空方式（關明細、reset 帳單、0.5 秒後恢復按鈕），
            // 不必重新下載整頁與重抓所有設定（2026/10/28）
            sentRef.current = false
            setReset('reset')
            closeModal()
            setTimeout(() => {
              setCheckoutBtn(false)
              setCheckoutBtnClick(false)
              setIsClick(false)
              setReset('')
            }, 500)
          } else {
            history.push('/management/draft-orders')
          }
        })
        .catch(err => {
          sentRef.current = false
          setIsClick(false)
          setCheckoutBtnClick(false)
          setCheckoutBtn(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（closeModal、handleBtnDisabled、stayInCreateOrder）；只在 [bill, history, setCheckoutBtnClick, setOpen, setReset] 變動時呼叫，補上會每次 render 重跑
  }, [bill, history, setCheckoutBtnClick, setOpen, setReset])

  useEffect(() => {
    // 監聽一直掛著（彈窗關閉時由 cleanup 移除），以 sentRef 防重複送出：被檢查擋下或送出失敗後可再按
    const handleCreateOrderShortCut = event => {
      if (event.code !== 'F9' && event.code !== 'F8') return
      if (sentRef.current) return
      if (event.code === 'F9') usehandleCreateOrder()
      // 明細還在載入時回傳 'null dom'、不送出（sentRef 不變），載入完成後可再按
      else usehandleCreateOrderAndPrint()
    }
    document.addEventListener('keydown', handleCreateOrderShortCut, false)
    return () => {
      document.removeEventListener('keydown', handleCreateOrderShortCut)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（usehandleCreateOrderAndPrint）；只在 [usehandleCreateOrder] 變動時呼叫，補上會每次 render 重跑
  }, [usehandleCreateOrder])

  function printDiv() {
    var printMain = printMainRef.current
    var printThermal = printThermalRef.current

    var newWin = window.open('', 'Print-Window')
    if (orderDetailPrintLayout === 'A4') {
      newWin.document.write('<html><body onload="window.print()" style="margin: 0mm 5mm;">' + printMain.innerHTML + '</body></html>')
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
      newWin.document.write('<html><style>@page {margin: 1mm;}</style><body onload="window.print()">' + printThermal.innerHTML + '</body></html>')
    }

    if (closureDelayed) {
      setTimeout(function () {
        newWin.print()
      }, 100)
      setTimeout(() => {
        newWin.close()
      }, 10000)
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
