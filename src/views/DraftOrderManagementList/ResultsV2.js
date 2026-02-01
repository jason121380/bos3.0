/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Checkbox,
  Divider, TextField, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Typography, IconButton, Collapse,
  Box, Grid, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import { useFetchDownloadOrderReport } from 'hooks/useFetchOrderReport'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState, Fragment } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { useLocation } from 'react-router'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import designerNameType from 'helper/designerNameType'
import _ from 'lodash'
import pagenationLabel from './../../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1400,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  paymentLinePay: css({
    width: '50px',
    imageRendering: '-webkit-optimize-contrast',
  }),
}

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
    <div {...rest} css={css([styles.root, className])}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px',
          alignItems: 'center',
        }}
      >
        <Typography color="textSecondary" variant="body2" data-testid="result-counter">
          共 {totalCount} 筆, {pageSetting.pageOffset + 1} /{' '}
          {Math.ceil(pageSetting.pageOffset + 1 / pageSetting.pageLimit)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setAllExtend(!allExtend)}
        >
          全部展開
        </Button>
      </div>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="掛單列表.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="掛單列表"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        color="primary"
                        indeterminate={
                          selectedOrders.length > 0 && selectedOrders.length < orders.length
                        }
                        onChange={handleSelectAll}
                        disabled={orders.length === 0}
                      />
                    </TableCell>
                    <TableCell>展開</TableCell>
                    <TableCell>列印</TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>結帳</TableCell>
                    <TableCell>帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>指定/不指定</TableCell>
                    <TableCell className="cellHighlight">營業現金應收</TableCell>
                    <TableCell>服務消費</TableCell>
                    <TableCell>店販消費</TableCell>
                    {membershipDisplay && <TableCell>會員卡販賣</TableCell>}
                    <TableCell>卡券使用 (入業績)</TableCell>
                    <TableCell>卡券販賣 (入業績)</TableCell>
                    <TableCell>業績收入</TableCell>
                    <TableCell>卡券販賣 (不入業績)</TableCell>
                    <TableCell>卡券使用(-)</TableCell>
                    <TableCell>第三方卡券(-)</TableCell>
                    <TableCell>其他付款方式(-)</TableCell>
                    <TableCell>入金使用(-)</TableCell>
                    {bonusDisplay && <TableCell>點數折抵金額(-)</TableCell>}
                    <TableCell>備註</TableCell>
                    <TableCell>訂單來源</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length > 0 &&
                    orders.map((order, index) => (
                      <Fragment key={index}>
                        <TableRow data-testid={`order-row`}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={selectedOrders.indexOf(order.id) > -1}
                              onChange={() => handleSelectOne(order.id)}
                              inputProps={{
                                'data-testid': `order-checkbox-${index}`,
                              }}
                              disabled={order.isCloseAccount}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              sx={{ padding: '3px !important' }}
                              onClick={() => handleOrderExtend(order.id)}
                            >
                              {orderExtendArr.find(id => id === order.id) !== undefined ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              color="primary"
                              size="small"
                              variant="outlined"
                              disabled={disabled}
                              onClick={() => {
                                handlePrintOrderDetail(order.id)
                              }}
                            >
                              列印
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              color="primary"
                              component={RouterLink}
                              size="small"
                              to={`/draft-order/${location.search.length > 0
                                ? `${order.id}?startDate=${location.search
                                  .split('=')[1]
                                  .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                                : `${order.id}`
                                }`}
                              variant="outlined"
                              data-testid={`order-${index}`}
                            >
                              詳情
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              color="primary"
                              size="small"
                              disabled={isClick}
                              onClick={() => {
                                passwordEnabled.checkout ? handleCheckout(index) : handleCheckoutOrder(order)
                              }}
                              variant="outlined"
                              data-testid={`order-${index}`}
                            >
                              結帳
                            </Button>
                          </TableCell>

                          <TableCell>
                            #{order.no}
                            <Typography variant="body2">
                              {format(new Date(order.date), 'yyyy/MM/dd')}/
                              {weekDisplay(format(new Date(order.date), 'eeee'))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {idx(order, _ => _.customer.name)}
                            <Typography variant="body2">
                              {idx(order, _ => _.customer.cellphone)}
                            </Typography>
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
                          <TableCell className="cellHighlight">
                            {Math.round(order.businessCash)}
                          </TableCell>
                          <TableCell>
                            {Math.round(order.serviceFakeTotal)}
                            <Typography variant="body2">
                              {order.serviceOrders.length > 0 && serviceOrders(order)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {Math.round(order.productFakeTotal)}
                            <Typography variant="body2">
                              {order.productOrders.length > 0 && productOrders(order)}
                            </Typography>
                          </TableCell>
                          {membershipDisplay && (
                            <TableCell>
                              {Math.round(order.membershipFakeTotal)}
                              <Typography variant="body2">
                                {order.membershipOrders.length > 0 && membershipOrders(order)}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>{Math.round(order.useTicketTotal)}</TableCell>
                          <TableCell>{Math.round(order.ticketSellIntoPerformance)}</TableCell>
                          <TableCell>{Math.round(order.performanceIncome)}</TableCell>
                          <TableCell>{Math.round(order.ticketSellNotIntoPerformance)}</TableCell>
                          <TableCell>{Math.round(order.usedTicketForDecount)}</TableCell>
                          <TableCell>
                            {Math.round(order.thirdPartTicketForDecount)}
                            <Typography variant="body2">
                              {order.serviceOrders.length > 0 &&
                                order.productOrders.length > 0 &&
                                thirdParty(order)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {Math.round(order.otherPayWayForDecount)}
                            <Typography variant="body2">{order.payType2}</Typography>
                          </TableCell>
                          <TableCell>{order.walletUsedForDecount}</TableCell>
                          {bonusDisplay && <TableCell>{order.bonusDecountForReport}</TableCell>}
                          <TableCell>{order.remark}</TableCell>
                          <TableCell>{order.source}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                            <Collapse
                              in={orderExtendArr.find(id => id === order.id) !== undefined}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 1 }}>
                                <Grid container style={{ justifyContent: 'space-between' }}>
                                  <Grid item xs={2}>
                                    <Typography variant="button">設計師</Typography>
                                  </Grid>
                                  <Grid item xs={5}>
                                    <Typography variant="button">項目</Typography>
                                  </Grid>
                                  <Grid item xs={1}>
                                    <Typography variant="button">價格</Typography>
                                  </Grid>
                                  <Grid item xs={1}>
                                    <Typography variant="button">數量</Typography>
                                  </Grid>
                                  <Grid item xs={3}>
                                    <Typography variant="button">互助人</Typography>
                                  </Grid>
                                </Grid>
                                {order.staticDetail.map((data, index) => (
                                  <Grid container key={index} style={{ justifyContent: 'space-between' }}>
                                    <Grid item xs={2}>
                                      <Typography variant="body1">{data.designerName}</Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                      <Typography variant="body1">
                                        {`${data.itemName}(${data.serviceType})`}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                      <Typography variant="body1">{data.price}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                      <Typography variant="body1">{data.count}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                      {data.helperList.length > 0 &&
                                        data.helperList.map((helper, index) => (
                                          <Typography key={index} variant="body1">
                                            {`${helper.helperType}[${helper.helperName}]`}
                                          </Typography>
                                        ))}
                                    </Grid>
                                  </Grid>
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} />
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7} />
                        </TableRow>
                      </Fragment>
                    ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={pageSetting.pageOffset}
            rowsPerPage={pageSetting.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={passwordEnabled.delete ? handleCancel : handleConfirmCancel}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogType === 'delete' ? '刪除訂單？' : '訂單結帳'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={password}
              label={dialogType === 'delete' ? '刪除密碼' : '編輯訂單密碼'}
              onChange={event => setPassword(event.target.value)}
              inputProps={{
                type: 'password',
                'data-testid': 'delete-password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button
            onClick={() => {
              dialogType === 'delete' ? handleConfirmCancel() : handleComfirmCheckoutOrder()
            }}
            color="primary"
            autoFocus
            data-testid="confirm"
            disabled={editBarOnClick || isClick}
          >
            確認
          </Button>
        </DialogActions>
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
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default React.memo(Results)
