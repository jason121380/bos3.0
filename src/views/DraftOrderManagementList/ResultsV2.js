// Divider 只用於下方列印範本（#printMain / #printThermal），維持列印輸出不變
import { Divider } from 'ui/display-compat'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import { useFetchDownloadOrderReport } from 'hooks/useFetchOrderReport'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, CircleDollarSign, Download, Eye, Printer } from 'lucide-react'
import { useLocation } from 'react-router'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import designerNameType from 'helper/designerNameType'
import _ from 'lodash'
import pagenationLabel from './../../helper/pagenationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { EmptyState } from 'ui/empty-state'
import { formatMoney } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

// 寬表（min-w 1400px）橫向捲動時固定「操作」與「帳單編號/時間」兩欄（只限螢幕，列印還原為一般欄位；比照帳單列表）：
// - sm 以上兩欄都固定：操作欄寬固定 188px（勾選 16＋間距 4＋四顆 32px 圖示鈕與間距＋左右 12px 內距），帳單編號欄接在 left-[188px]
// - 手機（< 640px）可視寬度約 320px，兩欄合計超過一半，只固定帳單編號欄（操作欄隨內容捲走，捲回最左即可操作）
// 底色跟著列：一般 surface（卡片底），hover／勾選時 surface-hover；右緣 1px 分隔線
const STICKY_BASE = 'bg-surface group-hover:bg-surface-hover group-data-[state=selected]:bg-surface-hover print:static print:bg-transparent print:shadow-none'
const STICKY_ACTION = 'sm:sticky sm:left-0 sm:w-[188px] sm:min-w-[188px]'
const STICKY_NO = 'sticky left-0 sm:left-[188px] shadow-[1px_0_0_rgb(var(--border))]'
const STICKY_ACTION_HEAD = cn('w-[160px]', STICKY_ACTION, 'z-[3] bg-surface print:static print:bg-transparent')
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
  passwordEnabled,
  orderDetailPrintLayout,
  nameDisplayOnInvoice,
  bonusActive,
  closureDelayed,
  ...rest
}) {
  const history = useHistory()
  const location = useLocation()
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
  const [password, setPassword] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editBarOnClick, setEditBarOnClick] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [dialogType, setDialogType] = useState('delete')
  const [orderIndex, setOrderIndex] = useState(0)
  const [fetchOrderReport, { called, loading, data, refetch }] = useFetchDownloadOrderReport(
    pageSetting.startDate,
    pageSetting.endDate
  )
  const { fetchReCheckoutOrder } = useFetchReCheckoutOrder()
  const { deleteOrders } = useFetchDeleteOrder()
  // 檢查是否為首次render
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (allExtend) {
      const newSelectedOrders = orders.map(order => order.id)
      setOrderExtendArr(newSelectedOrders)
    } else {
      setOrderExtendArr([])
    }
  }, [allExtend])
  useEffect(() => {
    if (called && data && !loading && isFirstRender.current) {
      window.open(data.orderReport)
      isFirstRender.current = false
    }
  }, [called, loading, data])
  useEffect(() => {
    const excelData = []
    orders.forEach(order => {
      excelData.push({
        帳單編號: `#${order.no}`,
        時間: `${format(new Date(order.date), 'yyyy/MM/dd')}/${weekDisplay(
          format(new Date(order.date), 'eeee')
        )}`,
        客戶: isCustomerDataMarked
          ? `${order.customer.name.length < 3
            ? `${order.customer.name.substring(0, 1)}*`
            : order.customer.name.length < 4
              ? `${order.customer.name.substring(0, 1)}*${order.customer.name.substring(2, 3)}`
              : `${order.customer.name.substring(0, 2)}*${order.customer.name.substring(2, 5)}`
          } ${`${order.customer.cellphone.substring(0, 4)}***${order.customer.cellphone.substring(
            7,
            10
          )}`}`
          : `${order.customer.name} ${order.customer.cellphone}`,
        設計師: `${order.designer.name}${order.designer.designerNo !== '' ? `/${order.designer.designerNo}` : ''
          }`,
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
        訂單來源: order.source
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
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [orders, membershipDisplay, bonusDisplay])
  useEffect(() => {
    if (printOrderDetail.length > 0) {
      printDiv()
    }
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
      newWin.document.write(
        '<html><body onload="window.print()" style="margin: 0mm 5mm;">' +
        printMain.innerHTML +
        '</body></html>'
      )
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
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? orders.map(order => order.id) : []
    setSelectedOrders(newSelectedPayment)
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
  const handleCancel = () => {
    setOpenDialog(true)
    setDialogType('delete')
  }
  const handleCheckout = index => {
    setOpenDialog(true)
    setOrderIndex(index)
    setDialogType('checkout')
  }
  const handleDownload = () => {
    if (!called) {
      fetchOrderReport()
    } else {
      // 若已變更選擇日期範圍之情況
      isFirstRender.current = true
      refetch()
    }
  }
  const handleConfirmCancel = () => {
    setEditBarOnClick(true)
    openSnackbar({
      message: '訂單刪除中',
      variant: 'warning',
    })
    deleteOrders({ orderIds: selectedOrders, password: password })
      .then(() => {
        setOpenDialog(false)
        setPassword('')
        setSelectedOrders([])
        refetch2()
        openSnackbar({
          message: '刪除訂單成功',
          variant: 'success',
        })
      })
      .catch(err => {
        // setOpenDialog(false)
        setEditBarOnClick(false)
        setSelectedOrders([])
        setPassword('')
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
      })
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
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
  const handlePrintOrderDetail = orderId => {
    const filterOrder = orders.filter(d => d.id === orderId)
    const servicePriceWithoutThirdPartyCoupon = filterOrder[0].serviceOrders
      .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price : 0))
      .reduce((accu, curVal) => (accu += curVal), 0)
    const productPriceWithoutThirdPartyCoupon = filterOrder[0].productOrders
      .map(d => (typeof d.thirdPartyPayName !== 'string' ? d.price * d.count : 0))
      .reduce((accu, curVal) => (accu += curVal), 0)
    const couponSellPrice = filterOrder[0].staticDetail
      .filter(d => d.serviceType === '卡券販賣(不入業績)')
      .map(d => d.price * d.count)
      .reduce((accu, curVal) => (accu += curVal), 0)
    setOrderDetailPaymentShouldPay(
      servicePriceWithoutThirdPartyCoupon + productPriceWithoutThirdPartyCoupon + couponSellPrice
    )
    setCashPayment(
      servicePriceWithoutThirdPartyCoupon +
      productPriceWithoutThirdPartyCoupon +
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
              helperDeductiontype: d.helperDeductiontype,
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
      serialNumber: Order.serialNumber
    }
    fetchReCheckoutOrder({
      updateOrderId: Order.id,
      orderInput: orderForInput,
    })
      .then(() => {
        openSnackbar({
          message: '結帳成功',
          variant: 'success',
        })
        // setOpenDialog(false)
        setPassword('')
        // setCheckoutBtn(false)
        history.push('/management/orders')

        // history.push('/management/orders')
      })
      .catch(err => {
        // setOpenDialog(false)
        setPassword('')
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
        setIsClick(false)
        // toggle()
      })
      .finally(() => {
        // useToggleRef.current()
      })
  }
  const handleComfirmCheckoutOrder = () => {
    setIsClick(true)
    const Order = _.cloneDeep(orders[orderIndex])
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
              helperDeductiontype: d.helperDeductiontype,
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
      serialNumber: Order.serialNumber
    }
    fetchReCheckoutOrder({
      updateOrderId: Order.id,
      orderInput: orderForInput,
      password: password,
    })
      .then(() => {
        openSnackbar({
          message: '結帳成功',
          variant: 'success',
        })
        // setOpenDialog(false)
        setPassword('')
        // setCheckoutBtn(false)
        history.push('/management/orders')

        // history.push('/management/orders')
      })
      .catch(err => {
        // setOpenDialog(false)
        setPassword('')
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
        setIsClick(false)
        // toggle()
      })
      .finally(() => {
        // useToggleRef.current()
      })
  }
  const serviceOrders = (order) => {
    const arr = []
    let returnString = ''

    order.serviceOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const productOrders = (order) => {
    const arr = []
    let returnString = ''

    order.productOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const membershipOrders = (order) => {
    const arr = []
    let returnString = ''

    order.membershipOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const thirdParty = (order) => {
    const arr = []
    let returnString = ''

    order.serviceOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })

    order.productOrders.map(d => {
      if (d.thirdPartyPayName) {
        if (!arr.find(elm => elm === d.thirdPartyPayName)) {
          arr.push(d.thirdPartyPayName)
        }
      }
    })

    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }

  const renderPrintDetail = isPrintMain => {
    if (printOrderDetail.length !== 0 && printOrderDetail[0].customer.name !== '不留客資') {
      const { bonusDeposit, bonusUsed, bonusDecountForReport, customerLeftBonus } = printOrderDetail[0]
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
                <CSVLink data={excelData} filename="掛單列表.csv" >
                  <Download strokeWidth={1.75} />
                  報表匯出
                </CSVLink>
              </Button>
            </Fragment>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>掛單列表</CardTitle>
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
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    indeterminate={
                      selectedOrders.length > 0 && selectedOrders.length < orders.length
                    }
                    onChange={handleSelectAll}
                    disabled={orders.length === 0}
                  />
                </TableHead>
                <TableHead className={cn('min-w-[150px]', STICKY_NO_HEAD)}>帳單編號/時間</TableHead>
                <TableHead className="min-w-[150px]">客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>指定/不指定</TableHead>
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
            <TableBody>
              {orders.length > 0 &&
                orders.map((order, index) => (
                  <Fragment key={index}>
                    <TableRow data-testid={`order-row`} data-state={selectedOrderSet.has(order.id) ? 'selected' : undefined} className="group">
                      <TableCell className={cn('whitespace-nowrap px-3', STICKY_ACTION_CELL)}>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            aria-label={`選取 #${order.no}`}
                            checked={selectedOrderSet.has(order.id)}
                            onChange={() => handleSelectOne(order.id)}
                            data-testid={`order-checkbox-${index}`}
                            disabled={order.isCloseAccount}
                            className="mr-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            aria-label={orderExtendArr.find(id => id === order.id) !== undefined ? '收合明細' : '展開明細'}
                            aria-expanded={orderExtendArr.find(id => id === order.id) !== undefined}
                            onClick={() => handleOrderExtend(order.id)}
                          >
                            {orderExtendArr.find(id => id === order.id) !== undefined ? (
                              <ChevronUp strokeWidth={1.75} />
                            ) : (
                              <ChevronDown strokeWidth={1.75} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            aria-label="列印帳單"
                            disabled={disabled}
                            onClick={() => handlePrintOrderDetail(order.id)}
                          >
                            <Printer strokeWidth={1.75} />
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                            <RouterLink
                              aria-label="查看掛單"
                              to={`/draft-order/${location.search.length > 0
                                ? `${order.id}?startDate=${location.search
                                  .split('=')[1]
                                  .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                                : `${order.id}`
                                }`}
                              data-testid={`order-${index}`}
                            >
                              <Eye strokeWidth={1.75} />
                            </RouterLink>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            aria-label="結帳"
                            disabled={isClick}
                            onClick={() => {
                              passwordEnabled.checkout ? handleCheckout(index) : handleCheckoutOrder(order)
                            }}
                            data-testid={`order-checkout-${index}`}
                          >
                            <CircleDollarSign strokeWidth={1.75} />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className={STICKY_NO_CELL}>
                        <div className="font-medium tabular-nums">#{order.no}</div>
                        <div className="text-caption tabular-nums text-text-secondary">
                          {format(new Date(order.date), 'yyyy/MM/dd')}/
                          {weekDisplay(format(new Date(order.date), 'eeee'))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {idx(order, _ => _.customer.name)}
                        <div className="text-caption tabular-nums text-text-secondary">
                          {idx(order, _ => _.customer.cellphone)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {`${idx(order, _ => _.designer.lastName)}${idx(
                          order,
                          _ => _.designer.firstName
                        )}`}
                        {idx(order, _ => _.designer.designerNo)
                          ? `/${idx(order, _ => _.designer.designerNo)}`
                          : ''}
                      </TableCell>
                      <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                      <TableCell numeric className="font-medium">
                        {formatMoney(Math.round(order.businessCash))}
                      </TableCell>
                      <TableCell numeric>
                        {formatMoney(Math.round(order.serviceFakeTotal))}
                        <div className="text-caption text-text-secondary">
                          {order.serviceOrders.length > 0 && serviceOrders(order)}
                        </div>
                      </TableCell>
                      <TableCell numeric>
                        {formatMoney(Math.round(order.productFakeTotal))}
                        <div className="text-caption text-text-secondary">
                          {order.productOrders.length > 0 && productOrders(order)}
                        </div>
                      </TableCell>
                      {membershipDisplay && (
                        <TableCell numeric>
                          {formatMoney(Math.round(order.membershipFakeTotal))}
                          <div className="text-caption text-text-secondary">
                            {order.membershipOrders.length > 0 && membershipOrders(order)}
                          </div>
                        </TableCell>
                      )}
                      <TableCell numeric>{formatMoney(Math.round(order.useTicketTotal))}</TableCell>
                      <TableCell numeric>{formatMoney(Math.round(order.ticketSellIntoPerformance))}</TableCell>
                      <TableCell numeric>{formatMoney(Math.round(order.performanceIncome))}</TableCell>
                      <TableCell numeric>{formatMoney(Math.round(order.ticketSellNotIntoPerformance))}</TableCell>
                      <TableCell numeric>{formatMoney(Math.round(order.usedTicketForDecount))}</TableCell>
                      <TableCell numeric>
                        {formatMoney(Math.round(order.thirdPartTicketForDecount))}
                        <div className="text-caption text-text-secondary">
                          {order.serviceOrders.length > 0 &&
                            order.productOrders.length > 0 &&
                            thirdParty(order)}
                        </div>
                      </TableCell>
                      <TableCell numeric>
                        {formatMoney(Math.round(order.otherPayWayForDecount))}
                        <div className="text-caption text-text-secondary">{order.payType2}</div>
                      </TableCell>
                      <TableCell numeric>{formatMoney(order.walletUsedForDecount)}</TableCell>
                      {bonusDisplay && <TableCell numeric>{formatMoney(order.bonusDecountForReport)}</TableCell>}
                      <TableCell className="text-text-secondary">{order.remark}</TableCell>
                      <TableCell className="text-text-secondary">{order.source}</TableCell>
                    </TableRow>
                    {orderExtendArr.find(id => id === order.id) !== undefined && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={23} className="bg-surface px-4 py-3">
                          {/* 明細：設計師 / 項目 / 價格 / 數量 / 互助人 */}
                          <div className="flex gap-3 border-0 border-b border-solid border-border pb-2 text-label text-text-secondary">
                            <div className="w-[100px] flex-none">設計師</div>
                            <div className="w-[300px] flex-none">項目</div>
                            <div className="w-[80px] flex-none text-right">價格</div>
                            <div className="w-[60px] flex-none text-right">數量</div>
                            <div className="w-[200px] flex-none">互助人</div>
                          </div>
                          {order.staticDetail.map((data, index) => (
                            <div key={index} className="flex items-start gap-3 py-1.5 text-body text-text">
                              <div className="w-[100px] flex-none">{data.designerName}</div>
                              <div className="w-[300px] flex-none">{`${data.itemName}(${data.serviceType})`}</div>
                              <div className="w-[80px] flex-none text-right tabular-nums">
                                {formatMoney(data.serviceType === '卡券使用' ? parseInt(data.price * 100) / 100 : data.price)}
                              </div>
                              <div className="w-[60px] flex-none text-right tabular-nums">{data.count}</div>
                              <div className="w-[200px] flex-none">
                                {data.helperList.length > 0 ? (
                                  data.helperList.map((helper, idx) => (
                                    <div key={idx}>
                                      {`${helper.helperType}[${helper.helperName}]`}
                                    </div>
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
          {orders.length === 0 && <EmptyState title="此區間沒有掛單" description="調整日期或篩選條件後再試一次。" />}
        </div>
      </Card>
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={passwordEnabled.delete ? handleCancel : handleConfirmCancel}
      />

      <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
        <DialogContent size="sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{dialogType === 'delete' ? '刪除掛單？' : '掛單結帳'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field label={dialogType === 'delete' ? '刪除密碼' : '編輯訂單密碼'} htmlFor="draft-order-password">
              <Input
                id="draft-order-password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button
              variant={dialogType === 'delete' ? 'danger' : 'primary'}
              onClick={() => {
                dialogType === 'delete' ? handleConfirmCancel() : handleComfirmCheckoutOrder()
              }}
              autoFocus
              data-testid="confirm"
              disabled={editBarOnClick || isClick}
            >
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
          {printOrderDetail.length !== 0 &&
            format(new Date(printOrderDetail[0].date), 'yyyy/MM/dd HH:mm')}
        </div>
        <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail[0].no}</div>
        <div>
          設計師:{printOrderDetail.length !== 0 && designerNameType(printOrderDetail[0].designer, nameDisplayOnInvoice)}
        </div>
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
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
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
              printOrderDetail[0].staticDetail.map((d, index) => {
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
              printOrderDetail[0].staticDetail.map((d, index) => {
                if (d.serviceType === '會員卡銷售') {
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
              printOrderDetail[0].staticDetail.map((d, index) => {
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
              printOrderDetail[0].staticDetail.map((d, index) => {
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
              printOrderDetail[0].staticDetail.map((d, index) => {
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
              format(new Date(printOrderDetail[0].date), 'yyyy/MM/dd HH:mm')}
          </div>
          <div>帳單編號：{printOrderDetail.length !== 0 && printOrderDetail[0].no}</div>
          <div>設計師:{printOrderDetail.length !== 0 && designerNameType(printOrderDetail[0].designer, nameDisplayOnInvoice)}</div>
          <div>顧客:{printOrderDetail.length !== 0 && printOrderDetail[0].customer.name}</div>
          <Divider style={{ width: '100%' }} />
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
            })}
          <Divider style={{ width: '100%' }} />
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
