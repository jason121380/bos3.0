// Divider 只用於下方列印範本（#printMain / #printThermal），維持列印輸出不變
import { Divider } from 'ui/display-compat'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { useLocation } from 'react-router'
import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Download, Eye, LoaderCircle, Printer } from 'lucide-react'
import designerNameType from 'helper/designerNameType'
import truncateDecimal from 'helper/truncateDecimal'
import { useFetchOrderForPrint } from 'hooks/useFetchOrder'
import pagenationLabel from './../../helper/pagenationLabel'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { EmptyState } from 'ui/empty-state'
import { formatMoney } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

// 寬表（min-w 1400px）橫向捲動時固定「操作」與「帳單編號/時間」兩欄（只限螢幕，列印還原為一般欄位）：
// - sm 以上兩欄都固定：操作欄寬固定 152px（勾選 16＋間距 4＋三顆 32px 圖示鈕與間距＋左右 12px 內距），帳單編號欄接在 left-[152px]
// - 手機（< 640px）可視寬度約 320px，兩欄合計超過一半，只固定帳單編號欄（操作欄隨內容捲走，捲回最左即可操作）
// 底色跟著列：一般 surface（卡片底），hover／勾選時 surface-hover；右緣 1px 分隔線
const STICKY_BASE = 'bg-surface group-hover:bg-surface-hover group-data-[state=selected]:bg-surface-hover print:static print:bg-transparent print:shadow-none'
const STICKY_ACTION = 'sm:sticky sm:left-0 sm:w-[152px] sm:min-w-[152px]'
const STICKY_NO = 'sticky left-0 sm:left-[152px] shadow-[1px_0_0_rgb(var(--border))]'
const STICKY_ACTION_HEAD = cn('w-[132px]', STICKY_ACTION, 'z-[3] bg-surface print:static print:bg-transparent')
const STICKY_NO_HEAD = cn(STICKY_NO, 'z-[3] bg-surface print:static print:bg-transparent print:shadow-none')
const STICKY_ACTION_CELL = cn(STICKY_ACTION, 'z-[2]', STICKY_BASE)
const STICKY_NO_CELL = cn(STICKY_NO, 'z-[2]', STICKY_BASE)

function Results({
  className,
  orders,
  refetch2,
  totalCount,
  pageSetting,
  onPageChange,
  onRowsPerPageChange,
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
  const pageRef = useRef(null)
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
  }, [allExtend])

  const [openDialog, setOpenDialog] = useState(false)
  const handleConfirmCancel = () => {
    setEditBarOnClick(true)
    setIcClick(true)
    openSnackbar({
      message: '訂單刪除中',
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
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
        setEditBarOnClick(false)
        setIcClick(false)
      })
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setIcClick(false)
  }

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return '(一)'
      case 'Tuesday':
        return '(二)'
      case 'Wednesday':
        return '(三)'
      case 'Thursday':
        return '(四)'
      case 'Friday':
        return '(五)'
      case 'Saturday':
        return '(六)'
      case 'Sunday':
        return '(日)'
      default:
        break
    }
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
          ? `${order.customerName.length < 3
            ? `${order.customerName.substring(0, 1)}*`
            : order.customerName.length < 4
              ? `${order.customerName.substring(0, 1)}*${order.customerName.substring(2, 3)}`
              : `${order.customerName.substring(0, 2)}*${order.customerName.substring(2, 5)}`
          } ${`${order.customerCellphone.substring(0, 4)}***${order.customerCellphone.substring(
            7,
            10
          )}`}`
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
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [orders, membershipDisplay, bonusDisplay, pageRef.current, serialNumberUsing])

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

  const renderTpName = names => {
    let returnString = ''
    const arr = names.map(d => d)
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }

  useEffect(() => {
    if (printOrderDetail.length !== 0) {
      printDiv()
    }
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
  }, [orderDataLazy.loading])

  useEffect(() => {
    setPageSetting({ ...pageSetting, pageOffset: 0 })
  }, [])

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
  // 不可點的列操作（建立中帳單）：連結無 disabled 屬性，改用 aria-disabled + 取消指標事件
  const linkDisabled = disabledLink => (disabledLink ? { 'aria-disabled': true, tabIndex: -1, className: 'pointer-events-none opacity-40' } : {})
  return (
    <div {...rest} className={className}>
      <Card className="mt-6">
        <CardHeader
          className="items-center pb-4"
          action={
            <Fragment>
              <Button size="sm" variant="secondary" onClick={() => setAllExtend(!allExtend)}>
                {allExtend ? <ChevronsDownUp strokeWidth={1.75} /> : <ChevronsUpDown strokeWidth={1.75} />}
                {allExtend ? '全部收合' : '全部展開'}
              </Button>
              <Button asChild size="sm" variant="secondary">
                <CSVLink data={excelData} filename="訂單列表.csv">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </CSVLink>
              </Button>
            </Fragment>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>帳單列表</CardTitle>
            <span className="text-label text-text-secondary tabular-nums" data-testid="result-counter">
              共 {totalCount} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1400px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={STICKY_ACTION_HEAD}>
                  <Checkbox
                    aria-label="全選"
                    checked={selectedOrders.length === noCloseOrder.length && noCloseOrder.length > 0}
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < noCloseOrder.length}
                    onChange={handleSelectAll}
                    disabled={orders.length === 0}
                  />
                </TableHead>
                <TableHead className={cn('min-w-[150px]', STICKY_NO_HEAD)}>帳單編號/時間</TableHead>
                <TableHead className="min-w-[150px]">客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>指定</TableHead>
                {raffleDisplay ? <TableHead numeric>活動券</TableHead> : null}
                <TableHead numeric className="text-text">營業現金應收</TableHead>
                <TableHead numeric>服務消費</TableHead>
                <TableHead numeric>店販消費</TableHead>
                {membershipDisplay && <TableHead numeric>會員卡販賣</TableHead>}
                <TableHead numeric>卡券使用 (入業績)</TableHead>
                <TableHead numeric>卡券販賣 (入業績)</TableHead>
                <TableHead numeric>業績收入</TableHead>
                <TableHead numeric>卡券販賣 (不入業績)</TableHead>
                <TableHead numeric>卡券使用(-)</TableHead>
                <TableHead numeric>第三方卡券(-)</TableHead>
                <TableHead numeric>其他付款方式(-)</TableHead>
                <TableHead numeric>入金使用(-)</TableHead>
                {bonusDisplay && <TableHead numeric>點數折抵金額(-)</TableHead>}
                <TableHead>備註</TableHead>
                <TableHead>帳單來源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody id="whiteSpace">
              {orders.length > 0 &&
                orders.map((order, index) => (
                  <Fragment key={order.id}>
                    <TableRow data-testid={`order-row`} data-state={selectedOrderSet.has(order.id) ? 'selected' : undefined} className="group">
                      <TableCell className={cn('whitespace-nowrap px-3', STICKY_ACTION_CELL)}>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            aria-label={`選取 #${order.orderNo}`}
                            checked={selectedOrderSet.has(order.id)}
                            onChange={() => handleSelectOne(order.id)}
                            data-testid={`order-checkbox-${index}`}
                            disabled={order.isCloseAccount || order.status === '建立中'}
                            className="mr-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            aria-label={isExtended(order.id) ? '收合明細' : '展開明細'}
                            aria-expanded={isExtended(order.id)}
                            disabled={orderStaticDetailLoading || order.status === '建立中'}
                            onClick={() => handleOrderExtend(order.id)}
                          >
                            {isExtended(order.id) ? <ChevronUp strokeWidth={1.75} /> : <ChevronDown strokeWidth={1.75} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            aria-label="列印帳單"
                            onClick={() => {
                              getOrderLazy({
                                variables: {
                                  orderId: order.id,
                                },
                              })
                              setPrintOrderId(order.id)
                              setIsPrint(true)
                            }}
                            disabled={disabled || order.status === '建立中'}
                          >
                            {orderDataLazy.loading && printOrderId === order.id ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : <Printer strokeWidth={1.75} />}
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                            <RouterLink
                              aria-label="查看帳單"
                              to={`/order/${location.search.length > 0
                                ? `${order.id}?startDate=${location.search
                                  .split('=')[1]
                                  .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                                : order.id
                                }`}
                              data-testid={`order-${index}`}
                              {...linkDisabled(order.status === '建立中')}
                            >
                              <Eye strokeWidth={1.75} />
                            </RouterLink>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className={STICKY_NO_CELL}>
                        <div className="font-medium tabular-nums">
                          {`#${order.orderNo}`}{serialNumberUsing && order.serialNumber ? ` (${order.serialNumber})` : ''}
                        </div>
                        <div className="text-caption tabular-nums text-text-secondary">
                          {format(new Date(order.date), 'yyyy/MM/dd')}
                          {weekDisplay(format(new Date(order.date), 'eeee'))}
                          {format(new Date(order.date), 'HH:mm')}
                        </div>
                      </TableCell>
                      {order.status === '建立中' ? (
                        <TableCell colSpan={19}>
                          <Badge variant="warning">帳單建立中</Badge>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell>
                            <div className="flex items-baseline gap-1">
                              {order.customerName}
                              <span className="text-caption text-text-secondary">{order.customerNo && `(${order.customerNo})`}</span>
                            </div>
                            <div className="text-caption tabular-nums text-text-secondary">{order.customerCellphone}</div>
                          </TableCell>
                          <TableCell>
                            {order.designerName}
                            {order.designerNo ? `/${order.designerNo}` : ''}
                          </TableCell>
                          <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                          {raffleDisplay ? <TableCell numeric>{order.raffleCount}</TableCell> : null}
                          <TableCell numeric className="font-medium">{formatMoney(Math.round(order.businessCash))}</TableCell>
                          <TableCell numeric>
                            {formatMoney(Math.round(order.service))}
                            <div className="text-caption text-text-secondary">{order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}</div>
                          </TableCell>
                          <TableCell numeric>
                            {formatMoney(Math.round(order.product))}
                            <div className="text-caption text-text-secondary">{order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}</div>
                          </TableCell>
                          {membershipDisplay && (
                            <TableCell numeric>
                              {formatMoney(Math.round(order.membership))}
                              <div className="text-caption text-text-secondary">{order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}</div>
                            </TableCell>
                          )}
                          <TableCell numeric>{formatMoney(truncateDecimal(order.usedTicket))}</TableCell>
                          <TableCell numeric>{formatMoney(Math.round(order.ticketSellIntoPerformance))}</TableCell>
                          <TableCell numeric>{formatMoney(Math.round(order.performanceIncome))}</TableCell>
                          <TableCell numeric>{formatMoney(Math.round(order.ticketSellNotIntoPerformance))}</TableCell>
                          <TableCell numeric>{formatMoney(truncateDecimal(order.usedTicketForDecount))}</TableCell>
                          <TableCell numeric>
                            {formatMoney(Math.round(order.thirdPartTicketForDecount))}
                            <div className="text-caption text-text-secondary">{order.TPTName.overAll.length > 0 && renderTpName(order.TPTName.overAll)}</div>
                          </TableCell>
                          <TableCell numeric>
                            {formatMoney(Math.round(order.otherPayWayForDecount))}
                            <div className="text-caption text-text-secondary">{order.otherPayName}</div>
                          </TableCell>
                          <TableCell numeric>{formatMoney(order.walletUsedForDecount)}</TableCell>
                          {bonusDisplay && <TableCell numeric>{formatMoney(order.bonusDecountForReport)}</TableCell>}
                          <TableCell className="text-text-secondary">{order.remark}</TableCell>
                          <TableCell className="text-text-secondary">{order.source}</TableCell>
                        </>
                      )}
                    </TableRow>
                    {isExtended(order.id) && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={24} className="bg-surface px-4 py-3">
                          {/* 明細：設計師 / 項目 / 價格 / 數量 / 互助人 */}
                          <div className="flex gap-3 border-0 border-b border-solid border-border pb-2 text-label text-text-secondary">
                            <div className="w-[100px] flex-none">設計師</div>
                            <div className="w-[300px] flex-none">項目</div>
                            <div className="w-[80px] flex-none text-right">價格</div>
                            <div className="w-[60px] flex-none text-right">數量</div>
                            <div className="w-[200px] flex-none">互助人</div>
                          </div>
                          {order.staticDetail && order.staticDetail.map((data, index) => (
                            <div key={index} className="flex items-start gap-3 py-1.5 text-body text-text">
                              <div className="w-[100px] flex-none">{data.designerName}</div>
                              <div className="w-[300px] flex-none">{`${data.itemName}(${data.serviceType})`}</div>
                              <div className="w-[80px] flex-none text-right tabular-nums">
                                {formatMoney(data.serviceType === '卡券使用' ? truncateDecimal(data.price) : data.price)}
                              </div>
                              <div className="w-[60px] flex-none text-right tabular-nums">{data.count}</div>
                              <div className="w-[200px] flex-none">
                                {data.helperList.length > 0 ? (
                                  data.helperList.map((helper, idx) => (
                                    <div key={idx}>{`${helper.helperType}[${helper.helperName}]`}</div>
                                  ))
                                ) : (
                                  '-'
                                )}
                              </div>
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
            </TableBody>
          </Table>
          {orders.length === 0 && <EmptyState title="此區間沒有帳單" description="調整日期或篩選條件後再試一次。" />}
        </div>
      </Card>
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={disableDeleteOrders ? handleCancel : handleConfirmCancel}
      />

      <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>刪除帳單？</DialogTitle>
            <DialogDescription>刪除後無法復原，請輸入刪除密碼確認。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="刪除密碼" htmlFor="delete-order-password">
              <Input
                id="delete-order-password"
                type="password"
                value={deleteOrderPwd}
                onChange={event => setDeleteOrderPwd(event.target.value)}
                data-testid="delete-password"
                autoFocus
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button variant="danger" disabled={isClick} onClick={handleConfirmCancel} data-testid="confirm">
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              })}
          </div>
          <Divider style={{ width: '100%' }} />
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
          <Divider style={{ width: '100%' }} />
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
            })}
          <Divider style={{ width: '100%' }} />
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
