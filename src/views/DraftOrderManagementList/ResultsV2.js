import { maskCustomerForExport } from 'helper/exportCustomerMask'
// 原生 hr 保留舊 class 與 inline style，讓複製到無 app CSS 的新視窗之 HTML 逐字相同
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState, Fragment } from 'react'
import { useApolloClient } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useLocation } from 'react-router'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import {
  confirmDraftStillPending,
  evictCheckedOutDraft,
  isUncertainCheckoutError,
  rememberCheckedOutDraft,
} from 'views/DraftOrderEdit/draftCheckoutGuard'
import designerNameType from 'helper/designerNameType'
import cloneDeep from 'lodash/cloneDeep'
import DraftOrderTable from './DraftOrderTable'
import DraftOrderPasswordDialog from './DraftOrderPasswordDialog'
import { weekDisplay } from './draftOrderListHelpers'

// 列表卡片（DraftOrderTable／DraftOrderRow）、密碼彈窗、純函式與固定欄樣式（draftOrderListHelpers）已拆到同資料夾；
// state、effect、handler 與列印範本（#printMain／#printThermal）仍在此檔，內容不變

function Results({
  className,
  orders,
  refetch2,
  totalCount,
  pageSetting,
  isCustomerDataMarked,
  membershipDisplay,
  bonusDisplay,
  qrcodeUrl,
  imgUrl,
  detailInfo,
  disabled,
  passwordEnabled,
  orderDetailPrintLayout,
  nameDisplayOnInvoice,
  bonusActive,
  closureDelayed,
  ...rest
}) {
  const history = useHistory()
  const location = useLocation()
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name
  const [selectedOrders, setSelectedOrders] = useState([])
  // 勾選狀態查詢用 Set（每列查兩次，避免 indexOf 逐筆掃描）；只換查詢方式，selectedOrders 的結構與 handler 不變
  const selectedOrderSet = useMemo(() => new Set(selectedOrders), [selectedOrders])
  const [excelData, setExcelData] = useState([])
  const [allExtend, setAllExtend] = useState(false)
  const [orderExtendArr, setOrderExtendArr] = useState([])
  const [printOrderDetail, setPrintOrderDetail] = useState([])
  const [orderDetailPaymentShouldPay, setOrderDetailPaymentShouldPay] = useState(0)
  const [couponSellPrice, setCouponSellPrice] = useState(0)
  const [cashPayment, setCashPayment] = useState(0)
  const [password, setPassword] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editBarOnClick, setEditBarOnClick] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [dialogType, setDialogType] = useState('delete')
  const [orderIndex, setOrderIndex] = useState(0)
  const { fetchReCheckoutOrder } = useFetchReCheckoutOrder()
  const { deleteOrders } = useFetchDeleteOrder()
  const client = useApolloClient()

  const settleListCheckout = (draftOrder, result) => {
    const closedId = result && result.data && result.data.reCheckoutOrder && result.data.reCheckoutOrder.id
    const draftId = draftOrder.id
    rememberCheckedOutDraft(draftId, closedId || '', '/management/orders')
    evictCheckedOutDraft(client.cache, draftId)
    if (closedId && closedId !== draftId) {
      history.replace(`/order/${closedId}`)
      return
    }
    history.push('/management/orders')
  }

  const failListCheckout = (draftOrder, err) => {
    if (!isUncertainCheckoutError(err)) {
      setPassword('')
      openSnackbar({ message: err.message, variant: 'error' })
      setIsClick(false)
      return
    }
    confirmDraftStillPending(client, draftOrder.id, draftOrder.date).then(status => {
      if (status === 'closed') {
        rememberCheckedOutDraft(draftOrder.id, '', '/management/orders')
        evictCheckedOutDraft(client.cache, draftOrder.id)
        setPassword('')
        setIsClick(false)
        openSnackbar({
          message: '這張掛單已結帳，請到帳單列表確認，不要重複結帳',
          variant: 'warning',
        })
        history.push('/management/orders')
        return
      }
      if (status === 'unknown') {
        setPassword('')
        openSnackbar({
          message: '無法確認結帳是否成功。請先到帳單列表查看，不要重複結帳。',
          variant: 'error',
        })
        return
      }
      setPassword('')
      openSnackbar({ message: err.message, variant: 'error' })
      setIsClick(false)
    })
  }

  useEffect(() => {
    if (allExtend) {
      const newSelectedOrders = orders.map(order => order.id)
      setOrderExtendArr(newSelectedOrders)
    } else {
      setOrderExtendArr([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在切換「全部展開」時套用；列表沒有分頁，重新查詢時本元件會重新掛載並重設為收合，orders 不會在展開期間換成新帳單
  }, [allExtend])
  useEffect(() => {
    const excelData = []
    orders.forEach(order => {
      excelData.push({
        帳單編號: `#${order.no}`,
        時間: `${format(new Date(order.date), 'yyyy/MM/dd')}/${weekDisplay(format(new Date(order.date), 'eeee'))}`,
        客戶: isCustomerDataMarked
          ? maskCustomerForExport(order.customer.name, order.customer.cellphone)
          : `${order.customer.name} ${order.customer.cellphone}`,
        // 設計師沒有編號（空字串或 null）時只有姓名，不帶「/null」（Jason 2026/10/22）
        設計師: `${order.designer.name}${order.designer.designerNo ? `/${order.designer.designerNo}` : ''}`,
        '指定/不指定': order.isDesignate ? 'Y' : 'N',
        營業現金應收: Math.round(order.businessCash),
        服務消費: Math.round(order.serviceFakeTotal),
        店販消費: Math.round(order.productFakeTotal),
        '會員卡販賣': Math.round(order.membershipFakeTotal),
        '卡券使用(入業績)': Math.round(order.useTicketTotal),
        '卡券販賣(入業績)': Math.round(order.ticketSellIntoPerformance),
        業績收入: Math.round(order.performanceIncome),
        '卡券販賣(不入業績)': Math.round(order.ticketSellNotIntoPerformance),
        '卡券使用(-)': Math.round(order.usedTicketForDecount),
        '第三方卡券(-)': Math.round(order.thirdPartTicketForDecount),
        '其他付款方式(-)': Math.round(order.otherPayWayForDecount),
        '入金使用(-)': order.walletUsedForDecount,
        '點數折抵金額(-)': order.bonusDecountForReport,
        備註: order.remark,
        帳單來源: order.source,
      })
    })
    if (!membershipDisplay) {
      excelData.forEach(d => {
        delete d['會員卡販賣']
      })
    }
    if (!bonusDisplay) {
      excelData.forEach(d => {
        delete d['點數折抵金額(-)']
      })
    }
    setExcelData(excelData)
    // 遮罩設定比帳單晚到時要重算，否則匯出檔用到未遮罩的姓名電話（B2 疑似 bug #11）
  }, [orders, membershipDisplay, bonusDisplay, isCustomerDataMarked])
  useEffect(() => {
    if (printOrderDetail.length > 0) {
      printDiv()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（printDiv）；只在 [printOrderDetail] 變動時呼叫，補上會每次 render 重跑
  }, [printOrderDetail])
  const printDiv = () => {
    var printMain = document.getElementById('printMain')
    var printThermal = document.getElementById('printThermal')

    var newWin = window.open('', 'Print-Window')
    const newWinBody = newWin.document.querySelector('body')
    if (newWinBody) {
      newWinBody.innerHTML = ''
    }

    if (orderDetailPrintLayout === 'A4') {
      newWin.document.write('<html><body onload="window.print()" style="margin: 0mm 5mm;">' + printMain.innerHTML + '</body></html>')
    } else if (orderDetailPrintLayout === '感熱紙(80mm)') {
      newWin.document.write(
        '<html style="width: 78mm;"><style>@page {margin: 1mm; width:78mm;}</style><body onload="window.print()">' +
          printThermal.innerHTML +
          '</body></html>'
      )
    } else if (orderDetailPrintLayout === '感熱紙(57mm)') {
      newWin.document.write(
        '<html style="width: 56mm;"><style>@page {margin: 1mm; width:56mm;}</style><body onload="window.print()">' +
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
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? orders.map(order => order.id) : []
    setSelectedOrders(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedOrders],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }
  const handleOrderExtend = id => {
    const newSelect = [...orderExtendArr],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setOrderExtendArr(newSelect)
  }
  const handleCancel = () => {
    setOpenDialog(true)
    setDialogType('delete')
  }
  const handleCheckout = index => {
    setOpenDialog(true)
    setOrderIndex(index)
    setDialogType('checkout')
  }
  const handleConfirmCancel = () => {
    setEditBarOnClick(true)
    openSnackbar({
      message: '帳單刪除中',
      variant: 'warning',
    })
    deleteOrders({ orderIds: selectedOrders, password: password })
      .then(() => {
        setOpenDialog(false)
        setPassword('')
        setSelectedOrders([])
        refetch2()
        openSnackbar({
          message: '刪除掛單成功',
          variant: 'success',
        })
      })
      .catch(err => {
        // setOpenDialog(false)
        setEditBarOnClick(false)
        setSelectedOrders([])
        setPassword('')
      })
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
  const handlePrintOrderDetail = orderId => {
    const filterOrder = orders.filter(d => d.id === orderId)
    const servicePriceWithoutThirdPartyCoupon = filterOrder[0].serviceOrders
      .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price : 0))
      .reduce((accu, curVal) => (accu += curVal), 0)
    const productPriceWithoutThirdPartyCoupon = filterOrder[0].productOrders
      .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price * d.count : 0))
      .reduce((accu, curVal) => (accu += curVal), 0)
    // 合計含會員卡（不含第三方卡券付的），與帳單列表一致（Jason 2026/10/22）
    const membershipWithoutThirdPartyCoupon = filterOrder[0].membershipOrders
      .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price : 0))
      .reduce((accu, curVal) => (accu += curVal), 0)
    const couponSellPrice = filterOrder[0].staticDetail
      .filter(d => d.serviceType === '卡券販賣(不入業績)')
      .map(d => d.price * d.count)
      .reduce((accu, curVal) => (accu += curVal), 0)
    setOrderDetailPaymentShouldPay(
      servicePriceWithoutThirdPartyCoupon + productPriceWithoutThirdPartyCoupon + membershipWithoutThirdPartyCoupon + couponSellPrice
    )
    setCashPayment(
      servicePriceWithoutThirdPartyCoupon +
        productPriceWithoutThirdPartyCoupon +
        membershipWithoutThirdPartyCoupon +
        couponSellPrice -
        Math.abs(filterOrder[0].walletUsedForDecount) -
        Math.abs(filterOrder[0].otherPayWayForDecount) -
        Math.abs(filterOrder[0].bonusDecountForReport)
    )
    setCouponSellPrice(couponSellPrice)
    setPrintOrderDetail(filterOrder)
  }
  const handleCheckoutOrder = Order => {
    setIsClick(true)
    const orderForInput = {
      date: Order.date,
      amountByOtherPay: Order.amountByOtherPay,
      customerCellphone: '',
      customerId: Order.customer.id,
      isDesignate: Order.isDesignate,
      payType: Order.payType2 === null ? [] : Order.payType2,
      isPending: false,
      serviceOrders: Order.serviceOrders.map(data => {
        return {
          serviceId: data.service.id,
          price: data.price,
          serviceOrderHelpers: data.helperList.map(d => {
            return {
              // 查詢的服務助理欄位是 helperDeductionType（送出的欄位名仍是 helperDeductiontype），Jason 2026/10/22
              helperDeductiontype: d.helperDeductionType,
              helperId: d.helper.id,
              isDesignate: d.isDesignate,
              type: d.type,
            }
          }),
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
        }
      }),
      productOrders: Order.productOrders.map(data => {
        return {
          productId: data.product.id,
          price: data.price,
          count: data.count,
          sellerId: data.seller.id,
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
        }
      }),
      useTicketOrders: Order.useTicketOrders.map(data => {
        return {
          customerTicketId: data.id,
          useTicketOrderHelpers: data.helperList.map(d => {
            return {
              helperDeductiontype: d.helperDeductiontype,
              helperId: d.helper.id,
              isDesignate: d.isDesignate,
              type: d.type,
            }
          }),
        }
      }),
      designerId: Order.designer.id,
      ticketOrders: Order.ticketOrders.map(data => {
        return {
          serviceId: data.service.id,
          availableCount: data.availableCount,
          price: data.price,
          count: data.count,
          remark: data.remark,
          intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
        }
      }),
      membershipOrders: Order.membershipOrders.map(data => {
        return {
          sellerId: data.seller.id,
          membershipUUID: data.membership.uuid,
          purchaseDate: data.purchaseDate,
          expiryDate: data.expiryDate,
          price: data.price,
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
          remark: data.remark,
        }
      }),
      walletPay: Order.walletPay,
      bonusDecount: Order.bonusDecount,
      bonusDeposit: Order.bonusDeposit,
      bonusUsed: Order.bonusUsed,
      remark: Order.remark,
      source: Order.source,
      serialNumber: Order.serialNumber,
    }
    fetchReCheckoutOrder({
      updateOrderId: Order.id,
      orderInput: orderForInput,
    })
      .then(result => {
        openSnackbar({
          message: '結帳成功',
          variant: 'success',
        })
        // setOpenDialog(false)
        setPassword('')
        // setCheckoutBtn(false)
        settleListCheckout(Order, result)
      })
      .catch(err => {
        // setOpenDialog(false)
        failListCheckout(Order, err)
      })
      .finally(() => {
        // useToggleRef.current()
      })
  }
  const handleComfirmCheckoutOrder = () => {
    setIsClick(true)
    const Order = cloneDeep(orders[orderIndex])
    const orderForInput = {
      date: Order.date,
      amountByOtherPay: Order.amountByOtherPay,
      customerCellphone: '',
      customerId: Order.customer.id,
      isDesignate: Order.isDesignate,
      payType: Order.payType2 === null ? [] : Order.payType2,
      isPending: false,
      serviceOrders: Order.serviceOrders.map(data => {
        return {
          serviceId: data.service.id,
          price: data.price,
          serviceOrderHelpers: data.helperList.map(d => {
            return {
              // 查詢的服務助理欄位是 helperDeductionType（送出的欄位名仍是 helperDeductiontype），Jason 2026/10/22
              helperDeductiontype: d.helperDeductionType,
              helperId: d.helper.id,
              isDesignate: d.isDesignate,
              type: d.type,
            }
          }),
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
        }
      }),
      productOrders: Order.productOrders.map(data => {
        return {
          productId: data.product.id,
          price: data.price,
          count: data.count,
          sellerId: data.seller.id,
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
        }
      }),
      useTicketOrders: Order.useTicketOrders.map(data => {
        return {
          customerTicketId: data.id,
          useTicketOrderHelpers: data.helperList.map(d => {
            return {
              helperDeductiontype: d.helperDeductiontype,
              helperId: d.helper.id,
              isDesignate: d.isDesignate,
              type: d.type,
            }
          }),
        }
      }),
      designerId: Order.designer.id,
      ticketOrders: Order.ticketOrders.map(data => {
        return {
          serviceId: data.service.id,
          availableCount: data.availableCount,
          price: data.price,
          count: data.count,
          remark: data.remark,
          intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
        }
      }),
      membershipOrders: Order.membershipOrders.map(data => {
        return {
          sellerId: data.seller.id,
          membershipUUID: data.membership.uuid,
          purchaseDate: data.purchaseDate,
          expiryDate: data.expiryDate,
          price: data.price,
          thirdPartyCouponMerchantId: data.thirdPartyPayId,
          remark: data.remark,
        }
      }),
      walletPay: Order.walletPay,
      bonusDecount: Order.bonusDecount,
      bonusDeposit: Order.bonusDeposit,
      bonusUsed: Order.bonusUsed,
      remark: Order.remark,
      source: Order.source,
      serialNumber: Order.serialNumber,
    }
    fetchReCheckoutOrder({
      updateOrderId: Order.id,
      orderInput: orderForInput,
      password: password,
    })
      .then(result => {
        openSnackbar({
          message: '結帳成功',
          variant: 'success',
        })
        // setOpenDialog(false)
        setPassword('')
        // setCheckoutBtn(false)
        settleListCheckout(Order, result)
      })
      .catch(err => {
        // setOpenDialog(false)
        failListCheckout(Order, err)
      })
      .finally(() => {
        // useToggleRef.current()
      })
  }

  // Jason 2026/10/24：掛單收據不印點數餘額。增點／扣點／折抵仍印。已結帳收據（帳單列表）仍印點數餘額。
  const renderPrintDetail = isPrintMain => {
    if (printOrderDetail.length !== 0 && printOrderDetail[0].customer.name !== '不留客資') {
      const { bonusDeposit, bonusUsed, bonusDecountForReport } = printOrderDetail[0]
      const bonus = bonusDeposit !== 0 || bonusUsed !== 0 || bonusDecountForReport !== 0
      if (bonusActive || bonus) {
        return isPrintMain ? (
          <>
            <div>增點：{bonusDeposit}</div>
            <div>扣點：{bonusUsed}</div>
            <div>折抵：{Math.abs(bonusDecountForReport)}</div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>增點：{bonusDeposit}</div>
              <div>扣點：{bonusUsed}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>折抵：{Math.abs(bonusDecountForReport)}</div>
            </div>
          </>
        )
      }
    }
  }

  return (
    <div {...rest} className={className}>
      <DraftOrderTable
        allExtend={allExtend}
        setAllExtend={setAllExtend}
        excelData={excelData}
        totalCount={totalCount}
        selectedOrders={selectedOrders}
        selectedOrderSet={selectedOrderSet}
        orders={orders}
        handleSelectAll={handleSelectAll}
        handleSelectOne={handleSelectOne}
        orderExtendArr={orderExtendArr}
        handleOrderExtend={handleOrderExtend}
        disabled={disabled}
        handlePrintOrderDetail={handlePrintOrderDetail}
        location={location}
        isClick={isClick}
        passwordEnabled={passwordEnabled}
        handleCheckout={handleCheckout}
        handleCheckoutOrder={handleCheckoutOrder}
        membershipDisplay={membershipDisplay}
        bonusDisplay={bonusDisplay}
      />
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={passwordEnabled.delete ? handleCancel : handleConfirmCancel}
      />

      <DraftOrderPasswordDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        dialogType={dialogType}
        password={password}
        setPassword={setPassword}
        handleConfirmCancel={handleConfirmCancel}
        handleComfirmCheckoutOrder={handleComfirmCheckoutOrder}
        editBarOnClick={editBarOnClick}
        isClick={isClick}
      />
      <div style={{ display: 'none' }} id="printMain">
        {(!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
        (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
        (!detailInfo.message.isDisplay || !detailInfo.message.message) ? (
          ''
        ) : (
          <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
            <div style={{ width: 50, height: 50, flexShrink: 0 }}>
              {detailInfo.logo.isDisplay && detailInfo.logo.imageUrl ? <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ''}
            </div>
            <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
              {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ? <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ''}
            </div>
            <div
              style={{
                flexGrow: 1,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <textarea
                disabled
                style={{
                  height: 50,
                  resize: 'none',
                  overflow: 'hidden',
                  border: 'none',
                  fontSize: 7,
                  fontFamily: 'auto',
                  flexGrow: 1,
                  whiteSpace: 'nowrap',
                }}
                onChange={() => {}}
                value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
              />
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px' }}>{merchantName}</div>
          <div style={{ color: '#009999' }}>結帳單</div>
        </div>
        <div>
          日期：
          {printOrderDetail.length !== 0 && format(new Date(printOrderDetail[0].date), 'yyyy/MM/dd HH:mm')}
        </div>
        <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail[0].no}</div>
        <div>設計師:{printOrderDetail.length !== 0 && designerNameType(printOrderDetail[0].designer, nameDisplayOnInvoice)}</div>
        <div>
          顧客:
          {printOrderDetail.length !== 0 && printOrderDetail[0].customer.name}
        </div>
        <div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '項目消費') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                        <div>{d.itemName}</div>
                        {d.helperList.length > 0 &&
                          d.helperList.map((d, index) => (
                            <div style={{ fontSize: '8px' }} key={`helperList-${index}`}>
                              助理:{d.helperNo || d.helperName}
                            </div>
                          ))}
                      </div>
                      <div>{d.price}x1</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '店販銷售') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div>{d.itemName}</div>
                      <div>{d.price}</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '會員卡銷售') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div>{d.itemName}</div>
                      <div>{d.price}</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '卡券販賣(不入業績)') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div>{d.itemName}</div>
                      <div>{d.price}</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '卡券販賣(入業績)') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div>{d.itemName}</div>
                      <div>{d.price}</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '卡券使用') {
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}>
                      <div>{d.itemName}</div>
                      <div>{d.price}</div>
                    </div>
                  )
                }
                return undefined
              })}
          </div>
          <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
          <div>合計：{orderDetailPaymentShouldPay}</div>
          <div>結帳：</div>
          <div style={{ display: 'flex', margin: '0 15px', justifyContent: 'space-between' }}>
            <div>
              扣入金：
              {printOrderDetail.length !== 0 && Math.abs(printOrderDetail[0].walletUsedForDecount)}
            </div>
            {/* <div>入金餘額：{0}</div> */}
            {renderPrintDetail(true)}
            <div>卡券金額：{couponSellPrice}</div>
            <div style={{ color: '#EE0000' }}>付現金額：{cashPayment}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'none' }} id="printThermal">
        <div>
          {(!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
          (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
          (!detailInfo.message.isDisplay || !detailInfo.message.message) ? (
            ''
          ) : (
            <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
              <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                {detailInfo.logo.isDisplay && detailInfo.logo.imageUrl ? <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ''}
              </div>
              <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
                {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ? <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ''}
              </div>
              <div
                style={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <textarea
                  disabled
                  style={{
                    height: 50,
                    resize: 'none',
                    overflow: 'hidden',
                    border: 'none',
                    fontSize: 7,
                    fontFamily: 'auto',
                    flexGrow: 1,
                    whiteSpace: 'nowrap',
                  }}
                  onChange={() => {}}
                  value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                />
              </div>
            </div>
          )}
          <div>
            <span>{merchantName}</span>
            <span style={{ marginLeft: '20px' }}>結帳單</span>
          </div>
          <div>
            日期：
            {printOrderDetail.length !== 0 && format(new Date(printOrderDetail[0].date), 'yyyy/MM/dd HH:mm')}
          </div>
          <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail[0].no}</div>
          <div>設計師:{printOrderDetail.length !== 0 && designerNameType(printOrderDetail[0].designer, nameDisplayOnInvoice)}</div>
          <div>顧客:{printOrderDetail.length !== 0 && printOrderDetail[0].customer.name}</div>
          <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>名稱</div>
            <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
              <div>單價</div>
              <div>數量</div>
              <div>小計</div>
            </div>
          </div>
          {printOrderDetail.length !== 0 &&
            printOrderDetail[0].staticDetail.map((d, index) => {
              if (d.serviceType === '項目消費') {
                return (
                  <Fragment key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {d.itemName}
                      <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                        <div>{d.price}</div>
                        <div>1</div>
                        <div>{d.price}</div>
                      </div>
                    </div>
                    {d.helperList.map((d, index) => {
                      return (
                        <span key={index} style={{ fontSize: '6px', marginRight: '10px' }}>
                          助理:{d.helperNo || d.helperName}
                        </span>
                      )
                    })}
                  </Fragment>
                )
              }
              return undefined
            })}
          {printOrderDetail.length !== 0 &&
            printOrderDetail[0].staticDetail.map((d, index) => {
              if (d.serviceType === '店販銷售') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              }
              return undefined
            })}
          {printOrderDetail.length !== 0 &&
            printOrderDetail[0].staticDetail.map((d, index) => {
              if (d.serviceType === '會員卡銷售') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              }
              return undefined
            })}
          {printOrderDetail.length !== 0 &&
            printOrderDetail[0].staticDetail.map((d, index) => {
              if (d.serviceType === '卡券販賣(不入業績)') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {`${d.itemName}`}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              }
              return undefined
            })}
          {printOrderDetail.length !== 0 &&
            printOrderDetail[0].staticDetail.map((d, index) => {
              if (d.serviceType === '卡券使用') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>1</div>
                      <div>{d.price}</div>
                    </div>
                  </div>
                )
              }
              return undefined
            })}
          <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
          <div>合計：{orderDetailPaymentShouldPay}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              扣入金：
              {printOrderDetail.length !== 0 && Math.abs(printOrderDetail[0].walletUsedForDecount)}
            </div>
            {/* <div>入金餘額：{walletPayBalanceForDetail}</div> */}
          </div>
          {renderPrintDetail(false)}
          <div>卡券金額：{couponSellPrice}</div>
          <div>付現金額：{cashPayment}</div>
          <div>謝謝惠顧,歡迎下次光臨!</div>
        </div>
      </div>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default React.memo(Results)
