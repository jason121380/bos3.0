/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Divider,
} from '@mui/material'
import billContext from 'context/keyInContext'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import useFetchTicketRecords, { useFetchTicketRecordsInOrderDetail } from 'hooks/useFetchTicketRecords'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import { format } from 'date-fns'
import useToggle from 'hooks/useToggle'
import _ from 'lodash'
import idx from 'idx'
import React, { useContext, useCallback, useRef, useState, useEffect, Fragment } from 'react'
import { useHistory, useLocation } from 'react-router'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchMerchantOrderDetailPrintLayout from 'hooks/useFetchGetMerchantPrintFormatSettings'
import { useFetchCustomerInOrderDetail } from 'hooks/useFetchCustomer'
import { useFetcDesignerInOrderDetail } from 'hooks/useFetchMerchantDesigner'
import { useFetchServicesInOrderDetail } from 'hooks/useFetchServices'
import { useFetchThirdPartysInOrderDetail } from 'hooks/useFetchMerchant'
import { useFetchProductsInOrderDetail } from 'hooks/useFetchProducts'
import { useFetchTicketsInOrderDetail } from 'hooks/useFetchTickets'
import { useFetchMembershipsInOrderDetail } from 'hooks/useFetchGetMembership'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import designerNameType from 'helper/designerNameType'
import { red } from '@mui/material/colors'
import useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'
import QRCode from 'qrcode'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import produce from 'immer'
import { cloneDeep } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import giveBonus from 'helper/giveBonus'

const styles = {
  card: css({
    marginTop: theme.spacing(3),
    '& span': {
      whiteSpace: 'nowrap'
    }
  }),
  cardContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  price: css({
    padding: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(3),
  }),
  action: css({
    padding: theme.spacing(1),
  }),
  saveButton: css({
    marginRight: theme.spacing(1),
  }),
  font: css({
    fontWeight: 'bold',
    color: '#3865AC',
    padding: theme.spacing(1),
  }),
  checkoutBtn: css({
    backgroundColor: red[500] + '!important',
    '&:hover': {
      backgroundColor: red[700] + '!important',
    },
  }),
}

export default function Footer() {
  const history = useHistory()
  const { open, toggle, setOpen } = useToggle()
  const [printOrderDetail, setPrintOrderDetail] = useState([])
  const [orderDetailPrintLayout, setOrderDetailPrintLayout] = useState('A4')
  const [isClick, setIsClick] = useState(false)
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name
  const {
    stayInCreateOrder, bill, orderSetting, orderId, order, handleBillChange,
    bonusActive, customerBonus, closureDelayed, bonusSetting, setBill,
    isLineBinded, bonusRewardWithLINE
  } = React.useContext(billContext)
  const inputRef = useRef(null)
  const [reCheckoutPwd, setReCheckoutPwd] = useState('')
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [openDialog, setOpenDialog] = useState(false)
  const [disableRecheckoutOrders, setDisableRecheckoutOrders] = useState(false)
  const [isRecheckoutOrders, setIsRecheckoutOrders] = useState(false)
  const passwordData = useFetchMerchantPassword()
  const merchantOrderDetailPrintLayoutData = useFetchMerchantOrderDetailPrintLayout()
  const getDesignerNameDisplayOnInvoice = useFetchGetDesignerNameDisplayOnInvoice()
  const [nameDisplayOnInvoice, setNameDisplayOnInvoice] = useState('NAME')

  const [orderDetail, setOrderDetail] = useState({
    servicesDetail: [],
    productsDetail: [],
    sellTicketsDetail: [],
    useTicketsDetail: [],
    membershipsDetail: [],
  })
  const [detailInfo, setDetailInfo] = useState({
    logo: {
      isDisplay: false,
      imageUrl: null
    },
    qrcode: {
      isDisplay: false,
      url: null,
      imageUrl: null
    },
    message: {
      isDisplay: false,
      message: null,
    }
  })
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [imgUrl, setImgUrl] = useState('')

  const customer = useFetchCustomerInOrderDetail({
    id: bill.customerId === undefined ? null : bill.customerId,
  })
  const designer = useFetcDesignerInOrderDetail({
    designerId: bill.designerId === '' || bill.designerId === undefined ? null : bill.designerId,
  })
  const servicesData = useFetchServicesInOrderDetail({ orderId: orderId })
  const thirdPartyCouponData = useFetchThirdPartysInOrderDetail()
  const productsData = useFetchProductsInOrderDetail()
  const membershipData = useFetchMembershipsInOrderDetail()
  const ticketsData = useFetchTicketsInOrderDetail()
  const ticketRecordData = useFetchTicketRecordsInOrderDetail(
    bill.customerId === undefined
      ? {
        pageOffset: 0,
        pageLimit: 0,
      }
      : {
        pageOffset: 0,
        pageLimit: 20,
        customerId: bill.customerId,
        isUseTicket: false,
      }
  )
  const userOrderableList = useFetchUsersOrderableList()
  const getHelperForPrint = idx(userOrderableList, _ => _.data.getUserOrderableList)
  const getHelper = id => {
    const helper = getHelperForPrint.filter(d => d.userId === id)
    return helper[0].userNo || helper[0].userName
  }
  const getLogoDisplayOnInvoice = useFetchGetLogoDisplayOnInvoice()
  const getQrcodeDisplayOnInvoice = useFetchGetQrcodeDisplayOnInvoice()
  const getMessageDisplayOnInvoice = useFetchGetMessageDisplayOnInvoice()

  useEffect(() => {
    if (
      !getLogoDisplayOnInvoice.loading &&
      !getQrcodeDisplayOnInvoice.loading &&
      !getMessageDisplayOnInvoice.loading
    ) {
      const logo = idx(getLogoDisplayOnInvoice, _ => _.data.getLogoDisplayOnInvoice)
      const qrcode = idx(getQrcodeDisplayOnInvoice, _ => _.data.getQrcodeDisplayOnInvoice)
      const message = idx(getMessageDisplayOnInvoice, _ => _.data.getMessageDisplayOnInvoice)
      setDetailInfo({
        logo: logo,
        qrcode: qrcode,
        message: message
      })
      QRCode.toDataURL(qrcode.url, (err, string) => {
        !err && setQrcodeUrl(string)
      })
      const getDataUrl = async () => {
        let blob = await fetch(logo.imageUrl).then(r => r.blob());
        let dataUrl = await new Promise(resolve => {
          let reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
        setImgUrl(dataUrl)
      }
      getDataUrl()
    }
  }, [
    getLogoDisplayOnInvoice.loading,
    getQrcodeDisplayOnInvoice.loading,
    getMessageDisplayOnInvoice.loading
  ])

  useEffect(() => {
    if (!getDesignerNameDisplayOnInvoice.loading) {
      const data = idx(getDesignerNameDisplayOnInvoice, _ => _.data.getDesignerNameDisplayOnInvoice)
      setNameDisplayOnInvoice(data)
    }
  }, [getDesignerNameDisplayOnInvoice.loading])
  useEffect(() => {
    if (
      !servicesData.loading &&
      !thirdPartyCouponData.loading &&
      !productsData.loading &&
      !ticketsData.loading &&
      !ticketRecordData.loading &&
      !userOrderableList.loading &&
      !membershipData.loading
    ) {
      const serviceArr = []
      const productArr = []
      const sellTicketsArr = []
      const useTicketsArr = []
      const membershipsArr = []
      const services = idx(servicesData, _ => _.data.services.data)
      const products = idx(productsData, _ => _.data.products.data)
      const tickets = idx(ticketsData, _ => _.data.tickets)
      const memberships = idx(membershipData, _ => _.data.memberships.data)
      const ticketsRecords = idx(ticketRecordData, _ => _.data.ticketRecords.data)
      const thirdPartyCoupon = idx(thirdPartyCouponData, _ => _.data.merchant.thirdpartyCoupons)

      for (let i = 0; i < bill.serviceOrders.length; i++) {
        services.forEach(service => {
          if (service.id === bill.serviceOrders[i].serviceId) {
            serviceArr.push({
              name: service.name,
              price: bill.serviceOrders[i].price,
              thirdPartyCoupon: null,
              serviceOrderHelpers: bill.serviceOrders[i].serviceOrderHelpers,
            })
          }
        })
        if (bill.serviceOrders[i].thirdPartyCouponMerchantId !== null) {
          thirdPartyCoupon.forEach(thirdCoupon => {
            if (thirdCoupon.id === bill.serviceOrders[i].thirdPartyCouponMerchantId) {
              serviceArr[i].thirdPartyCoupon = thirdCoupon.name
            }
          })
        }
      }
      for (let i = 0; i < bill.productOrders.length; i++) {
        products.forEach(product => {
          if (product.id === bill.productOrders[i].productId) {
            productArr.push({
              name: product.name,
              count: bill.productOrders[i].count,
              price: bill.productOrders[i].price,
              thirdPartyCoupon: null,
            })
          }
        })
        if (bill.productOrders[i].thirdPartyCouponMerchantId !== null) {
          thirdPartyCoupon.forEach(thirdCoupon => {
            if (thirdCoupon.id === bill.productOrders[i].thirdPartyCouponMerchantId) {
              productArr[i].thirdPartyCoupon = thirdCoupon.name
            }
          })
        }
      }
      for (let i = 0; i < bill.ticketOrders.length; i++) {
        tickets.forEach(ticket => {
          if (ticket.id === bill.ticketOrders[i].serviceId) {
            sellTicketsArr.push({
              name: ticket.name,
              availableCount: bill.ticketOrders[i].availableCount,
              price: bill.ticketOrders[i].price,
              count: bill.ticketOrders[i].count,
              thirdPartyCoupon: null,
            })
          }
        })
      }

      for (let i = 0; i < bill.useTicketOrders.length; i++) {
        ticketsRecords.forEach(ticketRecord => {
          if (ticketRecord.id === bill.useTicketOrders[i].customerTicketId) {
            useTicketsArr.push({
              name: ticketRecord.name,
              price: ticketRecord.price,
            })
          }
        })
      }

      for (let i = 0; i < bill.membershipOrders.length; i++) {
        memberships.forEach(member => {
          if (member.uuid === bill.membershipOrders[i].membershipUUID) {
            membershipsArr.push({
              name: member.name,
              price: bill.membershipOrders[i].price,
              thirdPartyCoupon: null,
            })
          }
        })
        if (bill.membershipOrders[i].thirdPartyCouponMerchantId !== null) {
          thirdPartyCoupon.forEach(thirdCoupon => {
            if (thirdCoupon.id === bill.membershipOrders[i].thirdPartyCouponMerchantId) {
              membershipsArr[i].thirdPartyCoupon = thirdCoupon.name
            }
          })
        }
      }
      setOrderDetail({
        ...orderDetail,
        servicesDetail: serviceArr,
        productsDetail: productArr,
        sellTicketsDetail: sellTicketsArr,
        useTicketsDetail: useTicketsArr,
        membershipsDetail: membershipsArr,
      })
    }
  }, [
    servicesData.loading,
    thirdPartyCouponData.loading,
    productsData.loading,
    ticketsData.loading,
    ticketRecordData.loading,
    userOrderableList.loading,
    membershipData.loading,
    bill,
  ])
  function printDiv() {
    var printMain = document.getElementById('printMain')
    var printThermal = document.getElementById('printThermal')
    var newWin = window.open('', 'Print-Window')

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

  useEffect(() => {
    if (!merchantOrderDetailPrintLayoutData.loading) {
      const merchantOrderDetailPrintLayout = idx(
        merchantOrderDetailPrintLayoutData,
        _ => _.data.getMerchantPrintFormatSettings
      )
      setOrderDetailPrintLayout(merchantOrderDetailPrintLayout)
    }
  }, [merchantOrderDetailPrintLayoutData.loading])
  useEffect(() => {
    if (order) {
      const filterOrder = order
      setPrintOrderDetail(filterOrder)
    }
  }, [order])

  useEffect(() => {
    if (!passwordData.loading) {
      const disableRecheckoutOrders = idx(
        passwordData,
        _ => _.data.merchantPassword.reCheckoutOrder.isUsing
      )
      setDisableRecheckoutOrders(disableRecheckoutOrders)
    }
  }, [passwordData.loading])
  const { fetchReCheckoutOrder } = useFetchReCheckoutOrder()

  const location = useLocation()
  const handleReCheckoutOrder = () => {
    setIsClick(true)
    setIsRecheckoutOrders(true)
    const tmp = handleTidyBill(bill)
    const checkService = checkServicesOrders(tmp.serviceOrders)
    const checkProduct = checkProductOrders(tmp.productOrders)
    const checkMember = checkMembershipOrders(tmp.membershipOrders)

    if (!checkService.verify) {
      openSnackbar({
        message: checkService.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      return;
    } else {
      fetchReCheckoutOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: { ...tmp, isPending: false },
        password: reCheckoutPwd,
      })
        .then(() => {
          toggle()
          if (tmp.seatNumber && tmp.seatNumber !== undefined) {
            openSnackbar({
              message: `座位開單結帳成功`,
              variant: 'success',
            })
            history.push(
              `/management/${location.search.length > 0
                ? `orders?startDate=${location.search.split('=').substring(0, 13)}&endDate=${location.search.split('=')[1]
                }`
                : 'orders'
              }`
            )
          } else {
            openSnackbar({
              message: `掛單結帳成功`,
              variant: 'success',
            })
            history.push(
              `/management/${location.search.length > 0
                ? `orders?startDate=${location.search.split('=').substring(0, 13)}&endDate=${location.search.split('=')[1]
                }`
                : 'orders'
              }`
            )
          }
          setIsClick(false)
          setOpenDialog(false)
          setIsRecheckoutOrders(false)
          setReCheckoutPwd('')
        }).catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setIsClick(false)
          setIsRecheckoutOrders(false)
        })
    }
  }

  const usehandleSaveDraftOrder = useCallback(() => {
    setIsClick(true)
    setIsRecheckoutOrders(true)
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
      setIsClick(false)
      setIsRecheckoutOrders(false)
      setOpen(false)
    } else if (!checkProduct.verify) {
      openSnackbar({
        message: checkProduct.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      setOpen(false)
      return;
    } else if (!checkMember.verify) {
      openSnackbar({
        message: checkMember.message,
        variant: "error",
      });
      setIsClick(false)
      setIsRecheckoutOrders(false)
      setOpen(false)
      return;
    } else {
      fetchReCheckoutOrder({
        updateOrderId: orderSetting.orderId,
        orderInput: { ...tmp, isPending: true },
        password: '',
      })
        .then(() => {
          if (tmp.seatNumber && tmp.seatNumber !== undefined) {
            openSnackbar({
              message: `座位開單儲存成功`,
              variant: 'success',
            })
            setIsClick(false)
            if (stayInCreateOrder) {
              window.location.reload()
            } else {
              history.push('/seat-order-manage')
            }
            setIsRecheckoutOrders(false)
          } else {
            openSnackbar({
              message: '掛單儲存成功',
              variant: 'success',
            })
            setIsClick(false)
            setIsRecheckoutOrders(false)
            history.push('/management/draft-orders')
          }
        })
        .catch(err => {
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          setIsClick(false)
          setIsRecheckoutOrders(false)
        })
        .finally(() => {
          setOpen(false)
        })
    }
  }, [bill, history])

  const customerTicketRecords = useFetchTicketRecords({
    ids: bill.useTicketOrders.map(d => d.customerTicketId),
  })

  const vaild = !(
    bill.date &&
    (bill.customerId || bill.withoutCustomerData || bill.customerCellphone) &&
    bill.designerId &&
    (bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)
  )

  const disabledEditOrder = open || vaild

  useEffect(() => {
    const handleEditOrderShortCut = event => {
      if (event.code === 'F9') {
        disableRecheckoutOrders ? handleOpenReCheckout() : handleReCheckoutOrder()
      }
    }
    document.addEventListener('keydown', handleEditOrderShortCut, false)
    return () => {
      document.removeEventListener('keydown', handleEditOrderShortCut)
    }
  }, [disabledEditOrder, handleReCheckoutOrder, disableRecheckoutOrders])

  const serviceTotalPriceArray = idx(bill, _ =>
    _.serviceOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price : 0
    )
  )
  const productTotalPriceArray = idx(bill, _ =>
    _.productOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price * d.count
        : 0
    )
  )
  const membershipTotalPriceArray = idx(bill, _ =>
    _.membershipOrders.map(d =>
      d.thirdPartyCouponMerchantId === null || d.thirdPartyCouponMerchantId === undefined
        ? d.price : 0
    )
  )

  const serviceTotalPriceWithoutThirdPartyCoupon = serviceTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )
  const productTotalPriceWithoutThirdPartyCoupon = productTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )
  const membershipTotalPriceWithoutThirdPartyCoupon = membershipTotalPriceArray.reduce(
    (total, item) => (total = total + item),
    0
  )

  const serviceTotalPrice =
    bill.serviceOrders.length > 0 ? bill.serviceOrders.reduce((a, b) => a + b.price, 0) : 0

  const merchantSellTotalPrice =
    bill.productOrders.length > 1
      ? bill.productOrders.reduce((a, b) => (a += b.count * b.price), 0)
      : bill.productOrders.length === 1
        ? bill.productOrders[0].count * bill.productOrders[0].price
        : 0

  const couponSellPrice =
    bill.ticketOrders.length > 1
      ? bill.ticketOrders.reduce((a, b) => (a += b.count * b.price), 0)
      : bill.ticketOrders.length === 1
        ? bill.ticketOrders[0].count * bill.ticketOrders[0].price
        : 0

  const membershipTotalPrice =
    bill.membershipOrders.length > 0 ? bill.membershipOrders.reduce((a, b) => a + b.price, 0) : 0

  const couponUsageTotalPrice = idx(customerTicketRecords, _ =>
    _.data.ticketRecords.data.length > 1
      ? _.data.ticketRecords.data.reduce((r, b) => r + b.price, 0)
      : _.data.ticketRecords.data.length === 1
        ? _.data.ticketRecords.data[0].price
        : 0
  ) ?? 0

  const handleOpenReCheckout = () => {
    if (disableRecheckoutOrders) {
      setOpenDialog(true)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handlePasswordChange = e => {
    const value = e.target.value
    const { start, end } = selection;
    const clonePassword = cloneDeep(reCheckoutPwd)
    const delta = value.length - reCheckoutPwd.length
    let combineValue = ''
    
    if (delta > 0) {
      combineValue = clonePassword.slice(0, start) + value.slice(start, start + delta) + clonePassword.slice(end, clonePassword.length)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = start + delta;
          inputRef.current.selectionEnd = start + delta;
        }
      }, 0);
    } else {
      if (end - start === Math.abs(delta)) {
        combineValue = clonePassword.slice(0, start) + clonePassword.slice(end, clonePassword.length)
      } else if (start === end) {
        combineValue = clonePassword.slice(0, start - 1) + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start - 1;
            inputRef.current.selectionEnd = start - 1;
          }
        }, 0);
      } else {
        const sliceValue = value.slice(start, start + 1)
        combineValue = clonePassword.slice(0, start) + sliceValue + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start + 1;
            inputRef.current.selectionEnd = start + 1;
          }
        }, 0);
      }
    }
    setReCheckoutPwd(combineValue)
  }

  const handleSelect = (event) => {
    setSelection({
      start: event.target.selectionStart,
      end: event.target.selectionEnd,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Delete') {
      event.preventDefault();
    }
    if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text");
    const { start, end } = selection;

    const newActualValue =
      reCheckoutPwd.slice(0, start) + pasteData + reCheckoutPwd.slice(end);

    setReCheckoutPwd(newActualValue);

    // 更新光标位置
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          start + pasteData.length;
      }
    }, 0);
  };

  useEffect(() => {
    if (
      serviceTotalPriceWithoutThirdPartyCoupon +
      productTotalPriceWithoutThirdPartyCoupon +
      couponSellPrice +
      membershipTotalPriceWithoutThirdPartyCoupon -
      bill.walletPay -
      bill.amountByOtherPay -
      bill.bonusDecount <
      0
    ) {
      setBill(
        produce(draft => {
          draft.amountByOtherPay = 0
          draft.walletPay = 0
          draft.bonusDecount = 0
        })
      )
    }
  }, [
    serviceTotalPriceWithoutThirdPartyCoupon, productTotalPriceWithoutThirdPartyCoupon,
    couponSellPrice, membershipTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount
  ])

  useEffect(() => {
    if (bonusSetting.isUsing) {
      let bonusDeposit = 0; // 預設為 0
    
      if (!bonusRewardWithLINE || (bonusRewardWithLINE && isLineBinded)) {
        const total =
          serviceTotalPriceWithoutThirdPartyCoupon +
          productTotalPriceWithoutThirdPartyCoupon +
          couponSellPrice +
          membershipTotalPriceWithoutThirdPartyCoupon -
          bill.walletPay -
          bill.amountByOtherPay -
          bill.bonusDecount;
    
        bonusDeposit = giveBonus[bonusSetting.rule.mode](total, bonusSetting.rule.price, bonusSetting.rule.bonus);
      }
    
      setBill(
        produce(draft => {
          draft.bonusDeposit = bonusDeposit;
        })
      );
    }
  }, [
    serviceTotalPriceWithoutThirdPartyCoupon, productTotalPriceWithoutThirdPartyCoupon,
    couponSellPrice, membershipTotalPriceWithoutThirdPartyCoupon, bill.walletPay,
    bill.amountByOtherPay, bill.bonusDecount, bill.customerId, bonusRewardWithLINE,
    isLineBinded
  ])
  
  return (
    <Card css={styles.card}>
      <CardContent css={styles.cardContent}>
        <Grid container spacing={3}>
          <Grid container item md={9} xs={12}>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>服務消費 {serviceTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>店販消費 {merchantSellTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>使用預收卡 {Math.round(couponUsageTotalPrice)}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.font}>
              <span>
                業績合計{' '}
                {Math.round(
                  serviceTotalPrice +
                  merchantSellTotalPrice +
                  couponUsageTotalPrice +
                  membershipTotalPrice
                )}
              </span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>預收卡販賣 {couponSellPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>會員卡銷售 {membershipTotalPrice}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>扣入金 {bill.walletPay}</span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.font}>
              <span>
                現金應收{' '}
                {serviceTotalPriceWithoutThirdPartyCoupon +
                  productTotalPriceWithoutThirdPartyCoupon +
                  membershipTotalPriceWithoutThirdPartyCoupon +
                  couponSellPrice -
                  bill.walletPay -
                  bill.amountByOtherPay -
                  bill.bonusDecount}
              </span>
            </Grid>
            <Grid item md={3} xs={12} css={styles.price}>
              <span>其他付款方式 {bill.amountByOtherPay}</span>
            </Grid>
            <Grid item xs={3} css={styles.price}>
              <span>紅利點數折抵 {bill.bonusDecount}</span>
            </Grid>
          </Grid>
          <Grid className='orderButtonGroup' container item md={3} xs={12} css={styles.actions} justifyContent="flex-start">
            <Grid item css={styles.action}>
              <Button
                className='fixDisabled'
                size="large"
                variant="contained"
                color="error"
                onClick={disableRecheckoutOrders ? handleOpenReCheckout : handleReCheckoutOrder}
                disabled={open || vaild || isRecheckoutOrders}
                data-testid="checkout"
              >
                結帳
              </Button>
            </Grid>
            <Grid item css={styles.action}>
              <Button
                className='fixDisabled'
                size="large"
                variant="contained"
                color="primary"
                onClick={usehandleSaveDraftOrder}
                disabled={open || vaild || isClick}
                data-testid="savedraft"
              >
                儲存
              </Button>
            </Grid>
            <Grid item css={styles.action}>
              <Button
                onClick={() => printDiv()}
                size="large"
                variant="contained"
                color="primary"
                disabled={
                  getLogoDisplayOnInvoice.loading ||
                  getQrcodeDisplayOnInvoice.loading ||
                  getMessageDisplayOnInvoice.loading
                }
              >
                列印
              </Button>
            </Grid>
          </Grid>
        </Grid>
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
            {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
          </div>
          <div>帳單編號：{order.no}</div>
          {!designer.loading && (
            <div>
              設計師:
              {designer.data.merchantDesigner === null
                ? '未選擇'
                : designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
            </div>
          )}
          {!customer.loading && (
            <div>
              顧客:
              {customer.data.customer === null ? '未選擇' : customer.data.customer.name}
            </div>
          )}
          <div>
            <div>
              {orderDetail.servicesDetail.length > 0 &&
                orderDetail.servicesDetail.map((service, index) => (
                  <div
                    key={`servicesDetail-${index}`}
                    style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                      <div>{service.name}</div>
                      {service.serviceOrderHelpers.map((d, index) => {
                        return (
                          <div
                            style={{ fontSize: '8px' }}
                            key={`helperList-${index}`}
                          >
                            助理:{getHelper(d.helperId)}
                          </div>
                        )
                      })}
                    </div>
                    <div>{service.price}x1</div>
                  </div>
                ))}
            </div>
            <div>
              {orderDetail.productsDetail.map((d, index) => {
                return (
                  <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              {orderDetail.sellTicketsDetail.map((d, index) => {
                return (
                  <div key={`ticketSell-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {`${d.name}`}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              {order &&
                order.useTicketOrders.map((d, index) => {
                  return (
                    <div key={`ticketUse-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {d.name}
                      <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                        <div>{d.price}</div>
                        <div>1</div>
                        <div>{d.price}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
            <Divider style={{ width: '100%' }} />
            <div>
              合計：{Math.round(serviceTotalPrice + merchantSellTotalPrice + couponUsageTotalPrice + membershipTotalPrice)}
            </div>
            <div>結帳：</div>
            <div style={{ display: 'flex', margin: '0 15px', justifyContent: 'space-between' }}>
              <div>
                扣入金：
                {bill.walletPay}
              </div>
              {/* <div>入金餘額：{0}</div> */}
              {(bonusActive && !bill.withoutCustomerData) && (
                <>
                  <div>增點：{bill.bonusDeposit}</div>
                  <div>扣點：{bill.bonusUsed}</div>
                  <div>折抵：{bill.bonusDecount}</div>
                  <div>點數餘額：{customerBonus}</div>
                </>
              )}
              <div>卡券金額：{couponSellPrice}</div>
              <div style={{ color: '#EE0000' }}>
                付現金額：
                {serviceTotalPriceWithoutThirdPartyCoupon +
                  productTotalPriceWithoutThirdPartyCoupon +
                  membershipTotalPriceWithoutThirdPartyCoupon +
                  couponSellPrice -
                  bill.walletPay -
                  bill.amountByOtherPay -
                  bill.bonusDecount}
              </div>
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
              {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
            </div>
            <div>帳單編號：{order.no}</div>
            {!designer.loading && (
              <div>
                設計師:
                {designer.data.merchantDesigner === null
                  ? '未選擇'
                  : designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
              </div>
            )}
            {!customer.loading && (
              <div>
                顧客:
                {customer.data.customer === null ? '未選擇' : customer.data.customer.name}
              </div>
            )}

            <Divider style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>名稱</div>
              <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                <div>單價</div>
                <div>數量</div>
                <div>小計</div>
              </div>
            </div>
            {orderDetail.servicesDetail.map((d, index) => {
              return (
                <Fragment key={`service-${index}`} >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>1</div>
                      <div>{d.price}</div>
                    </div>
                  </div>
                  {!userOrderableList.loading &&
                    d.serviceOrderHelpers.map((d, index) => {
                      return (
                        <span key={`helper-${index}`} style={{ fontSize: '6px', marginRight: '10px' }}>
                          助理:{getHelper(d.helperId)}
                        </span>
                      )
                    })}
                </Fragment>
              )
            })}
            {orderDetail.productsDetail.map((d, index) => {
              return (
                <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {d.name}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>{d.count}</div>
                    <div>{d.price * d.count}</div>
                  </div>
                </div>
              )
            })}
            {orderDetail.sellTicketsDetail.map((d, index) => {
              return (
                <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {`${d.name}`}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>{d.count}</div>
                    <div>{d.price * d.count}</div>
                  </div>
                </div>
              )
            })}
            {orderDetail.membershipsDetail.map((d, index) => {
              return (
                <div key={`member-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {`${d.name}`}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>1</div>
                    <div>{d.price}</div>
                  </div>
                </div>
              )
            })}
            {order &&
              order.useTicketOrders.map((d, index) => {
                return (
                  <div key={`TicketUse-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>1</div>
                      <div>{d.price}</div>
                    </div>
                  </div>
                )
              })}
            <Divider style={{ width: '100%' }} />
            <div>
              合計：{Math.round(serviceTotalPrice + merchantSellTotalPrice + couponUsageTotalPrice + membershipTotalPrice)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                扣入金：
                {bill.walletPay}
              </div>
              {/* <div>入金餘額：{walletPayBalanceForDetail}</div> */}
            </div>
            {(bonusActive && !bill.withoutCustomerData) && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>增點：{bill.bonusDeposit}</div>
                  <div>扣點：{bill.bonusUsed}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>折抵：{bill.bonusDecount}</div>
                  <div>點數餘額：{customerBonus}</div>
                </div>
              </>
            )}
            <div>卡券金額：{couponSellPrice}</div>
            <div>
              付現金額：
              {serviceTotalPriceWithoutThirdPartyCoupon +
                productTotalPriceWithoutThirdPartyCoupon +
                membershipTotalPriceWithoutThirdPartyCoupon +
                couponSellPrice -
                bill.walletPay -
                bill.amountByOtherPay -
                bill.bonusDecount}
            </div>
            <div>謝謝惠顧,歡迎下次光臨!</div>
          </div>
        </div>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">結帳</DialogTitle>
          <DialogContent style={{ overflow: 'visible' }}>
            <DialogContentText id="alert-dialog-description">
              <TextField
                label="密碼"
                inputRef={inputRef}
                value={new Array(reCheckoutPwd.length).fill('*').join('')}
                onChange={handlePasswordChange}
                onSelect={handleSelect}
                onCopy={e => e.preventDefault()}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                type='text'
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button disabled={isClick} color="primary" onClick={handleReCheckoutOrder} autoFocus data-testid="confirm">
              確認
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}
