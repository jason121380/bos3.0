import { maskCustomerForExport } from 'helper/exportCustomerMask'
// 原生 hr 保留舊 class 與 inline style，讓複製到無 app CSS 的新視窗之 HTML 逐字相同
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState, Fragment } from 'react'
import { useLocation } from 'react-router'
import designerNameType from 'helper/designerNameType'
import truncateDecimal from 'helper/truncateDecimal'
import { useFetchOrderForPrint } from 'hooks/useFetchOrder'
import OrderListTable from './OrderListTable'
import DeleteOrderDialog from './DeleteOrderDialog'
import { weekDisplay } from './orderListHelpers'

// 列表卡片（OrderListTable／OrderListRow）、刪除彈窗、純函式與固定欄樣式（orderListHelpers）已拆到同資料夾；
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
  disableDeleteOrders,
  orderDetailPrintLayout,
  nameDisplayOnInvoice,
  orderStaticDetailLoading,
  setPageSetting,
  bonusActive,
  closureDelayed,
  serialNumberUsing,
  ...rest
}) {
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
  const [getOrderLazy, orderDataLazy] = useFetchOrderForPrint()
  const [printOrderId, setPrintOrderId] = useState('')
  // const [clickedOrderCustomerId, setClickedOrderCustomerId] = useState(null)


  const [editBarOnClick, setEditBarOnClick] = useState(false)

  const location = useLocation()
  const [isClick, setIcClick] = useState(false)
  const [isPrint, setIsPrint] = useState(false)
  const [raffleDisplay, setRaffleDisplay] = useState(false)
  const noCloseOrder = orders.filter(d => {
    if (!d.isCloseAccount && d.status === '已完成') {
      return d.id
    }
    return false
  }).map(d => d.id)

  const { deleteOrders } = useFetchDeleteOrder()
  const handleSelectAll = () => {
    if (selectedOrders.length === noCloseOrder.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(noCloseOrder)
    }
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }
  const handleOrderExtend = id => {
    const newSelect = [...orderExtendArr], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setOrderExtendArr(newSelect)
  }

  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const handleCancel = () => {
    if (disableDeleteOrders) {
      setOpenDialog(true)
    }
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

  const [openDialog, setOpenDialog] = useState(false)
  const handleConfirmCancel = () => {
    setEditBarOnClick(true)
    setIcClick(true)
    openSnackbar({
      message: '帳單刪除中',
      variant: 'warning',
    })
    deleteOrders({ orderIds: selectedOrders, password: deleteOrderPwd })
      .then(() => {
        setOpenDialog(false)
        setDeleteOrderPwd('')
        setSelectedOrders([])
        refetch2()
        openSnackbar({
          message: '刪除帳單成功',
          variant: 'success',
        })
      })
      .catch(err => {
        // setOpenDialog(false)
        setSelectedOrders([])
        setDeleteOrderPwd('')
        setEditBarOnClick(false)
        setIcClick(false)
      })
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setIcClick(false)
  }


  useEffect(() => {
    const excelData = []
    orders.forEach(order => {
      const currentOrder = {
        帳單編號: `#${order.orderNo}${serialNumberUsing && order.serialNumber ? ` (${order.serialNumber})` : ''}`,
        時間: `${format(new Date(order.date), 'yyyy/MM/dd')}/${weekDisplay(
          format(new Date(order.date), 'eeee')
        )}`,
        客戶: isCustomerDataMarked
          ? maskCustomerForExport(order.customerName, order.customerCellphone)
          : `${order.customerName} ${order.customerCellphone}`,
        設計師: `${order.designerName}${order.designerNo ? `/${order.designerNo}` : ''}`,
        指定: order.isDesignate ? 'Y' : 'N',
        活動券: order.raffleCount,
        營業現金應收: Math.round(order.businessCash),
        服務消費: Math.round(order.service),
        店販消費: Math.round(order.product),
        '會員卡販賣': Math.round(order.membership),
        '卡券使用(入業績)': truncateDecimal(order.usedTicket),
        '卡券販賣(入業績)': Math.round(order.ticketSellIntoPerformance),
        業績收入: Math.round(order.performanceIncome),
        '卡券販賣(不入業績)': Math.round(order.ticketSellNotIntoPerformance),
        '卡券使用(-)': Math.round(order.usedTicketForDecount),
        '第三方卡券(-)': Math.round(order.thirdPartTicketForDecount),
        '其他付款方式(-)': Math.round(order.otherPayWayForDecount),
        '入金使用(-)': order.walletUsedForDecount,
        '點數折抵金額(-)': order.bonusDecountForReport,
        備註: order.remark,
        帳單來源: order.source
      }
      !membershipDisplay && delete currentOrder['會員卡販賣']
      !bonusDisplay && delete currentOrder['點數折抵金額(-)']
      !raffleDisplay && delete currentOrder['活動券']
      excelData.push(currentOrder)
    })

    setExcelData(excelData)
    // 遮罩設定、活動券欄是否顯示比帳單晚到時要重算：否則匯出檔用到未遮罩的姓名電話、或「活動券」欄落後一批（B2 疑似 bug #1、#10）
  }, [orders, membershipDisplay, bonusDisplay, serialNumberUsing, isCustomerDataMarked, raffleDisplay])

  function printDiv() {
    var printMain = document.getElementById('printMain')
    var printThermal = document.getElementById('printThermal')

    var newWin = window.open('', 'Print-Window')
    const newWinBody = newWin.document.querySelector('body')
    if (newWinBody) {
      newWinBody.innerHTML = ''
    }

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
      newWin.print()
      setTimeout(() => {
        newWin.close()
      }, 1000);
    }
  }


  useEffect(() => {
    if (printOrderDetail.length !== 0) {
      printDiv()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（printDiv）；只在 [printOrderDetail] 變動時呼叫，補上會每次 render 重跑
  }, [printOrderDetail])

  useEffect(() => {
    if (!orderDataLazy.loading && orderDataLazy.data) {
      const order = idx(orderDataLazy, _ => _.data.order)

      const servicePriceWithoutThirdPartyCoupon = order.serviceOrders
        .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price : 0))
        .reduce((accu, curVal) => (accu += curVal), 0)

      const productPriceWithoutThirdPartyCoupon = order.productOrders
        .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price * d.count : 0))
        .reduce((accu, curVal) => (accu += curVal), 0)

      const membershipWithoutThirdPartyCoupon = order.membershipOrders
        .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price : 0))
        .reduce((accu, curVal) => (accu += curVal), 0)

      const couponSellPrice = order.staticDetail
        .filter(d => d.serviceType === '卡券販賣(不入業績)')
        .map(d => d.price * d.count)
        .reduce((accu, curVal) => (accu += curVal), 0)


      setOrderDetailPaymentShouldPay(
        servicePriceWithoutThirdPartyCoupon +
        productPriceWithoutThirdPartyCoupon +
        membershipWithoutThirdPartyCoupon +
        couponSellPrice
      )

      setCashPayment(
        servicePriceWithoutThirdPartyCoupon +
        productPriceWithoutThirdPartyCoupon +
        membershipWithoutThirdPartyCoupon +
        couponSellPrice -
        Math.abs(order.walletUsedForDecount) -
        Math.abs(order.otherPayWayForDecount)
      )
      setCouponSellPrice(couponSellPrice)
      setPrintOrderDetail({ ...order })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [orderDataLazy.loading])

  useEffect(() => {
    setPageSetting({ ...pageSetting, pageOffset: 0 })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [setPageSetting] 變動時執行；pageSetting 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [setPageSetting])

  useEffect(() => {
    if (orders.length === 0) return
    const display = orders.some(({ raffleCount }) => raffleCount > 0)
    setRaffleDisplay(display)
  }, [orders])

  const renderPrintDetail = isPrintMain => {
    if (printOrderDetail.length !== 0 && printOrderDetail.customer.name !== '不留客資') {
      const { bonusDeposit, bonusUsed, bonusDecountForReport, customerLeftBonus } = printOrderDetail
      const bonus = bonusDeposit !== 0 || bonusUsed !== 0 || bonusDecountForReport !== 0
      if (bonusActive || bonus) {
        return (
          isPrintMain ?
            <>
              <div>增點：{bonusDeposit}</div>
              <div>扣點：{bonusUsed}</div>
              <div>折抵：{Math.abs(bonusDecountForReport)}</div>
              <div>點數餘額：{customerLeftBonus}</div>
            </> :
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>增點：{bonusDeposit}</div>
                <div>扣點：{bonusUsed}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>折抵：{Math.abs(bonusDecountForReport)}</div>
                <div>點數餘額：{customerLeftBonus}</div>
              </div>
            </>
        )
      }
    }
  }

  const isExtended = id => orderExtendArr.find(d => d === id) !== undefined
  return (
    <div {...rest} className={className}>
      <OrderListTable
        allExtend={allExtend}
        setAllExtend={setAllExtend}
        excelData={excelData}
        totalCount={totalCount}
        selectedOrders={selectedOrders}
        noCloseOrder={noCloseOrder}
        handleSelectAll={handleSelectAll}
        orders={orders}
        raffleDisplay={raffleDisplay}
        membershipDisplay={membershipDisplay}
        bonusDisplay={bonusDisplay}
        selectedOrderSet={selectedOrderSet}
        handleSelectOne={handleSelectOne}
        isExtended={isExtended}
        orderStaticDetailLoading={orderStaticDetailLoading}
        handleOrderExtend={handleOrderExtend}
        getOrderLazy={getOrderLazy}
        setPrintOrderId={setPrintOrderId}
        setIsPrint={setIsPrint}
        disabled={disabled}
        orderDataLazy={orderDataLazy}
        printOrderId={printOrderId}
        location={location}
        serialNumberUsing={serialNumberUsing}
      />
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={disableDeleteOrders ? handleCancel : handleConfirmCancel}
      />

      <DeleteOrderDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        deleteOrderPwd={deleteOrderPwd}
        setDeleteOrderPwd={setDeleteOrderPwd}
        isClick={isClick}
        handleConfirmCancel={handleConfirmCancel}
      />
      <div style={{ display: 'none' }} id="printMain">
        {
          (!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
            (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
            (!detailInfo.message.isDisplay || !detailInfo.message.message) ? '' :
            <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
              <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                {(detailInfo.logo.isDisplay && detailInfo.logo.imageUrl) ?
                  <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ""}
              </div>
              <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
                {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ?
                  <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ""}
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
                    whiteSpace: 'nowrap'
                  }}
                  onChange={() => { }}
                  value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                />
              </div>
            </div>
        }
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px' }}>{merchantName}</div>
          <div style={{ color: '#009999' }}>結帳單</div>
        </div>
        <div>
          日期：
          { }
          {printOrderDetail.length !== 0 &&
            format(new Date(printOrderDetail.date), 'yyyy/MM/dd HH:mm')}
        </div>
        <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail.no}</div>
        <div>
          客戶：
          {printOrderDetail.length !== 0 && printOrderDetail.customer.name}
        </div>
        <div>
          設計師：{printOrderDetail.length !== 0 && designerNameType(printOrderDetail.designer, nameDisplayOnInvoice)}
        </div>
        <div>
          <div>
            {printOrderDetail.length !== 0 &&
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === '項目消費') {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                        <div>{d.itemName}</div>
                        {d.helperList.length > 0 &&
                          d.helperList.map((d, index) => (
                            <div
                              style={{ fontSize: '8px' }}
                              key={`helperList-${index}`}
                            >助理:{d.helperNo || d.helperName}</div>
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
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === '店販銷售') {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
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
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === "會員卡銷售") {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
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
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === '卡券販賣(不入業績)') {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
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
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === '卡券販賣(入業績)') {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
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
              printOrderDetail.staticDetail.map((d, index) => {
                if (d.serviceType === '卡券使用') {
                  return (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
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
              {printOrderDetail.length !== 0 && Math.abs(printOrderDetail.walletUsedForDecount)}
            </div>
            <div>
              入金餘額：{printOrderDetail.length !== 0 && printOrderDetail.customerLeftWallet}
            </div>
            {renderPrintDetail(true)}
            <div>卡券金額：{couponSellPrice}</div>
            <div style={{ color: '#EE0000' }}>付現金額：{cashPayment}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'none' }} id="printThermal">
        <div>
          {
            (!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
              (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
              (!detailInfo.message.isDisplay || !detailInfo.message.message) ? '' :
              <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
                <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                  {(detailInfo.logo.isDisplay && detailInfo.logo.imageUrl) ?
                    <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ""}
                </div>
                <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
                  {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ?
                    <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ""}
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
                      whiteSpace: 'nowrap'
                    }}
                    onChange={() => { }}
                    value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                  />
                </div>
              </div>
          }
          <div>
            <span>{merchantName}</span>
            <span style={{ marginLeft: '20px' }}>結帳單</span>
          </div>
          <div>
            日期：
            {printOrderDetail.length !== 0 &&
              format(new Date(printOrderDetail.date), 'yyyy/MM/dd HH:mm')}
          </div>
          <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail.no}</div>
          <div>
            客戶：
            {printOrderDetail.length !== 0 && printOrderDetail.customer.name}
          </div>
          <div>設計師：{printOrderDetail.length !== 0 && designerNameType(printOrderDetail.designer, nameDisplayOnInvoice)}</div>
          <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>名稱</div>
            <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
              <div>單價</div>
              <div>數量</div>
              <div>小計</div>
            </div>
          </div>
          {printOrderDetail.length !== 0 &&
            printOrderDetail.staticDetail.map((d, index) => {
              if (d.serviceType === '項目消費') {
                return (
                  <Fragment key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {d.itemName}
                      <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
                        <div style={{ margin: '0px 2px' }}>{d.price}</div>
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
            printOrderDetail.staticDetail.map((d, index) => {
              if (d.serviceType === '店販銷售') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
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
            printOrderDetail.staticDetail.map((d, index) => {
              if (d.serviceType === '會員卡銷售') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
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
            printOrderDetail.staticDetail.map((d, index) => {
              if (d.serviceType === '卡券販賣(不入業績)') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {`${d.itemName}`}
                    <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
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
            printOrderDetail.staticDetail.map((d, index) => {
              if (d.serviceType === '卡券使用') {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.itemName}
                    <div style={{ display: 'flex', width: 150, justifyContent: 'space-between' }}>
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
              {printOrderDetail.length !== 0 && Math.abs(printOrderDetail.walletUsedForDecount)}
            </div>
            <div>
              入金餘額：{printOrderDetail.length !== 0 && printOrderDetail.customerLeftWallet}
            </div>
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
