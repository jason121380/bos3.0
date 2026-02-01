/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Checkbox, Divider,
  TextField, Table, TableBody, TableCell, TableHead, TableContainer,
  TablePagination, TableRow, Typography, IconButton, Collapse, Box, Grid,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle
} from '@mui/material'
import clsx from 'clsx'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { useLocation } from 'react-router'
import { KeyboardArrowDown, KeyboardArrowUp, Print, Visibility } from '@mui/icons-material'
import designerNameType from 'helper/designerNameType'
import { useFetchOrderForPrint } from 'hooks/useFetchOrder'
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
          message: '刪除訂單成功',
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
        '卡券使用(入業績)': parseInt(order.usedTicket * 100) / 100,
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

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card>
        <CardHeader
          sx={{ pb: 1 }}
          action={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="inherit"
                size="small"
                onClick={() => setAllExtend(!allExtend)}
              >
                {allExtend ? '全部收合' : '全部展開'}
              </Button>
              <CSVLink data={excelData} filename="訂單列表.csv" >
                <Button variant="contained" color="inherit" size="small">
                  報表匯出
                </Button>
              </CSVLink>
            </div>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                訂單列表
              </Typography>
              <Typography color="textSecondary" variant="body2" data-testid="result-counter">
                共 {totalCount} 筆
              </Typography>
            </div>
          }
        />

        <CardContent css={styles.content}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ padding: '4px 8px', width: '130px' }}>
                    <Checkbox
                      checked={selectedOrders.length === noCloseOrder.length && noCloseOrder.length > 0}
                      color="primary"
                      indeterminate={
                        selectedOrders.length > 0 && selectedOrders.length < noCloseOrder.length
                      }
                      onChange={handleSelectAll}
                      disabled={orders.length === 0}
                      sx={{ padding: '4px' }}
                    />
                  </TableCell>
                  <TableCell>帳單編號/時間</TableCell>
                  <TableCell>客戶</TableCell>
                  <TableCell>設計師</TableCell>
                  <TableCell>指定</TableCell>
                  {raffleDisplay ? <TableCell>活動券</TableCell> : null}
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
              <TableBody id="whiteSpace">
                {orders.length > 0 &&
                  orders.map((order, index) => (
                    <Fragment key={order.id}>
                      <TableRow data-testid={`order-row`}>
                        <TableCell style={{ padding: '0 8px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Checkbox
                              color="primary"
                              checked={selectedOrders.indexOf(order.id) > -1}
                              onChange={() => handleSelectOne(order.id)}
                              sx={{ padding: '4px' }}
                              inputProps={{
                                'data-testid': `order-checkbox-${index}`,
                              }}
                              disabled={order.isCloseAccount || order.status === '建立中'}
                            />
                            <IconButton
                              sx={{
                                padding: '4px !important',
                                color: '#999'
                              }}
                              aria-label="expand row"
                              size="small"
                              disabled={orderStaticDetailLoading || order.status === '建立中'}
                              onClick={() => handleOrderExtend(order.id)}
                            >
                              {orderExtendArr.find(id => id === order.id) !== undefined ? (
                                <KeyboardArrowUp fontSize="small" />
                              ) : (
                                <KeyboardArrowDown fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ padding: '4px !important', color: '#999' }}
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
                              {orderDataLazy.loading && printOrderId === order.id ? <CircularProgress size={18} /> : <Print fontSize="small" />}
                            </IconButton>
                            <IconButton
                              component={RouterLink}
                              size="small"
                              sx={{ padding: '4px !important', color: '#999' }}
                              to={`/order/${location.search.length > 0
                                ? `${order.id}?startDate=${location.search
                                  .split('=')[1]
                                  .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                                : order.id
                                }`}
                              disabled={order.status === '建立中'}
                              data-testid={`order-${index}`}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                        <TableCell>
                          {`#${order.orderNo}`}{serialNumberUsing && order.serialNumber ? ` (${order.serialNumber})` : ''}
                          <Typography variant="body2">
                            {format(new Date(order.date), 'MM/dd')}
                            {weekDisplay(format(new Date(order.date), 'eeee'))}
                            {format(new Date(order.date), 'HH:mm')}
                          </Typography>
                        </TableCell>
                        {order.status === '建立中' ? <TableCell colSpan={19}>訂單建立中</TableCell> :
                          <>
                            <TableCell>
                              <div style={{ display: 'flex' }}>
                                {order.customerName}
                                <Typography variant="body2">
                                  {order.customerNo && `(${order.customerNo})`}
                                </Typography>
                              </div>
                              <Typography variant="body2">
                                {order.customerCellphone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.designerName}
                              {order.designerNo ? `/${order.designerNo}` : ''}
                            </TableCell>
                            <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                            {raffleDisplay ? <TableCell>{order.raffleCount}</TableCell> : null}
                            <TableCell className="cellHighlight">
                              {Math.round(order.businessCash)}
                            </TableCell>
                            <TableCell>
                              {Math.round(order.service)}
                              <Typography variant="body2">
                                {order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {Math.round(order.product)}
                              <Typography variant="body2">
                                {order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}
                              </Typography>
                            </TableCell>
                            {membershipDisplay && (
                              <TableCell>
                                {Math.round(order.membership)}
                                <Typography variant="body2">
                                  {order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>{parseInt(order.usedTicket * 100) / 100}</TableCell>
                            <TableCell>{Math.round(order.ticketSellIntoPerformance)}</TableCell>
                            <TableCell>{Math.round(order.performanceIncome)}</TableCell>
                            <TableCell>{Math.round(order.ticketSellNotIntoPerformance)}</TableCell>
                            <TableCell>{parseInt(order.usedTicketForDecount * 100) / 100}</TableCell>
                            <TableCell>
                              {Math.round(order.thirdPartTicketForDecount)}
                              <Typography variant="body2">
                                {order.TPTName.overAll.length > 0 && renderTpName(order.TPTName.overAll)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {Math.round(order.otherPayWayForDecount)}
                              <Typography variant="body2">{order.otherPayName}</Typography>
                            </TableCell>
                            <TableCell>{order.walletUsedForDecount}</TableCell>
                            {bonusDisplay && <TableCell>{order.bonusDecountForReport}</TableCell>}
                            <TableCell>{order.remark}</TableCell>
                            <TableCell>{order.source}</TableCell>
                          </>
                        }
                      </TableRow>
                      <TableRow >
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={24}>
                          <Collapse
                            in={orderExtendArr.find(id => id === order.id) !== undefined}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 2, backgroundColor: '#fff', borderLeft: '4px solid #007AFF' }}>
                              {/* Headers */}
                              <div style={{ display: 'flex', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px', gap: '12px' }}>
                                <div style={{ width: '100px', flex: '0 0 100px', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>設計師</div>
                                <div style={{ width: '300px', flex: '0 0 300px', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>項目</div>
                                <div style={{ width: '80px', flex: '0 0 80px', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>價格</div>
                                <div style={{ width: '60px', flex: '0 0 60px', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>數量</div>
                                <div style={{ width: '200px', flex: '0 0 200px', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>互助人</div>
                              </div>
                              {/* Body */}
                              {order.staticDetail && order.staticDetail.map((data, index) => (
                                <div key={index} style={{ display: 'flex', marginBottom: '6px', alignItems: 'flex-start', gap: '12px' }}>
                                  <div style={{ width: '100px', flex: '0 0 100px', fontSize: '14px', color: '#333' }}>{data.designerName}</div>
                                  <div style={{ width: '300px', flex: '0 0 300px', fontSize: '14px', color: '#333' }}>{`${data.itemName}(${data.serviceType})`}</div>
                                  <div style={{ width: '80px', flex: '0 0 80px', fontSize: '14px', color: '#333' }}>
                                    {data.serviceType === '卡券使用' ? parseInt(data.price * 100) / 100 : data.price}
                                  </div>
                                  <div style={{ width: '60px', flex: '0 0 60px', fontSize: '14px', color: '#333' }}>{data.count}</div>
                                  <div style={{ width: '200px', flex: '0 0 200px', fontSize: '14px', color: '#333' }}>
                                    {data.helperList.length > 0 ? (
                                      data.helperList.map((helper, idx) => (
                                        <div key={idx} style={{ fontSize: '14px', color: '#333' }}>
                                          {`${helper.helperType}[${helper.helperName}]`}
                                        </div>
                                      ))
                                    ) : (
                                      '-'
                                    )}
                                  </div>
                                </div>
                              ))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>

      </Card>
      <TableEditBar
        editBarOnClick={editBarOnClick}
        selected={selectedOrders}
        onCancel={disableDeleteOrders ? handleCancel : handleConfirmCancel}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除訂單?'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={deleteOrderPwd}
              label="刪除密碼"
              onChange={event => setDeleteOrderPwd(event.target.value)}
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
          <Button disabled={isClick} onClick={handleConfirmCancel} color="primary" autoFocus data-testid="confirm">
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
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default React.memo(Results)
