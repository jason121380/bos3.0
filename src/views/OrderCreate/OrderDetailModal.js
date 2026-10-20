/** @jsxImportSource @emotion/react */
import { Divider } from 'ui/display-compat'
import { Grid } from 'ui/grid-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent } from 'ui/card-compat'
import { Modal } from '@mui/material'
import PropTypes from 'prop-types'
import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useContext,
  useRef,
  useCallback,
  Fragment,
} from 'react'
import { red, blue } from 'ui/colors'
import _ from 'lodash'
import { format } from 'date-fns'
import billContext from 'context/keyInContext'
import { useFetchCustomerInOrderDetail } from 'hooks/useFetchCustomer'
import { useFetchServicesInOrderDetail } from 'hooks/useFetchServices'
import idx from 'idx'
import { useFetchThirdPartysInOrderDetail } from 'hooks/useFetchMerchant'
import { useFetchProductsInOrderDetail } from 'hooks/useFetchProducts'
import { useFetchTicketsInOrderDetail } from 'hooks/useFetchTickets'
import useFetchGetTicketRecordsForOrder from 'hooks/useFetchGetTicketRecordsForOrder'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import { useHistory, useLocation } from 'react-router'
import { useFetcDesignerInOrderDetail } from 'hooks/useFetchMerchantDesigner'
import { useLazyFetchCustomerWallet } from 'hooks/useFetchCustomerWallet'
import { useFetchGetMembershipsForAutocomplete } from 'hooks/useFetchGetMembership'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import designerNameType from 'helper/designerNameType'
import useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'
import QRCode from 'qrcode'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 500,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  backBtn: css({
    margin: '16px 24px',
  }),
  btnDiv: css({
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  rowOfGrid: css({
    margin: '5px 0px',
  }),
  dividerDiv: css({
    margin: '8px 0px',
  }),
  detailBottomCash: css({
    fontSize: '20px',
    fontWeight: 'bold',
  }),
}

function OrderDetailModal({ openOrderDetail, orderDetailPrintLayout, onClose, getHelperForPrint }) {
  const {
    bill,
    orderDetailPaymentShouldPay,
    cashPayment,
    stayInCreateOrder,
    walletPayBalanceForDetail,
    addKeydown,
    setAddKeyDown,
    setCheckoutBtnClick,
    checkoutBtnClick,
    customerBonus,
    bonusActive,
    setReset,
    customerWallet,
    closureDelayed,
    reset,
    disablePendingOrder
  } = useContext(billContext)
  const { createOrder } = useFetchCreateOrder()
  const { open, toggle, setOpen } = useToggle()
  const useCreateOrder = useRef(createOrder)
  const history = useHistory()

  const [orderDetail, setOrderDetail] = useState({
    servicesDetail: [],
    productsDetail: [],
    sellTicketsDetail: [],
    useTicketsDetail: [],
    membershipOrders: [],
  })
  const [isClick, setIsClick] = useState(false)
  const [orderNumber, setOrderNumber] = useState(0)
  const [checkoutBtn, setCheckoutBtn] = useState(false)
  const [sellTicketTotal, setSellTicketTotal] = useState(0)
  const [orderNoInPrint, setOrderNoInPrint] = useState('')
  const [nameDisplayOnInvoice, setNameDisplayOnInvoice] = useState('NAME')
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
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name
  const customer = useFetchCustomerInOrderDetail({
    id: bill.customerId === undefined ? null : bill.customerId,
  })
  const designer = useFetcDesignerInOrderDetail({
    designerId: bill.designerId === '' || bill.designerId === undefined ? null : bill.designerId,
  })
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [imgUrl, setImgUrl] = useState('')

  const servicesData = useFetchServicesInOrderDetail({})
  const thirdPartyCouponData = useFetchThirdPartysInOrderDetail()
  const productsData = useFetchProductsInOrderDetail()
  const ticketsData = useFetchTicketsInOrderDetail()
  const memberCardData = useFetchGetMembershipsForAutocomplete({})
  const getDesignerNameDisplayOnInvoice = useFetchGetDesignerNameDisplayOnInvoice()
  const [ticketRecordsForOrderLazy, ticketRecordsForOrderLazyData] = useFetchGetTicketRecordsForOrder()
  const getLogoDisplayOnInvoice = useFetchGetLogoDisplayOnInvoice()
  const getQrcodeDisplayOnInvoice = useFetchGetQrcodeDisplayOnInvoice()
  const getMessageDisplayOnInvoice = useFetchGetMessageDisplayOnInvoice()
  const checkOrderRef = useRef(null)
  const checkOrderPrintRef = useRef(null)
  const printMainRef = useRef()
  const printThermalRef = useRef()

  useEffect(() => {
    if (reset === 'reset') {
      setOrderDetail({
        servicesDetail: [],
        productsDetail: [],
        sellTicketsDetail: [],
        useTicketsDetail: [],
        membershipOrders: [],
      })
    }
  }, [reset])

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
    if (bill.customerId) {
      ticketRecordsForOrderLazy({
        variables: {
          customerId: bill.customerId
        }
      })
    }
  }, [bill.customerId])

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
  }, [bill, history])

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
  }, [bill, history])

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
  }, [bill, history])

  useEffect(() => {
    if (!getDesignerNameDisplayOnInvoice.loading) {
      const data = idx(getDesignerNameDisplayOnInvoice, _ => _.data.getDesignerNameDisplayOnInvoice)
      setNameDisplayOnInvoice(data)
    }
  }, [getDesignerNameDisplayOnInvoice.loading])

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

  useEffect(() => {
    if (!ticketRecordsForOrderLazyData.loading && ticketRecordsForOrderLazyData.data) {
      const ticketsRecords = bill.customerId ? idx(ticketRecordsForOrderLazyData, _ => _.data.ticketRecordsForOrder) : []
      const useTicketsArr = []
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
      setOrderDetail({
        ...orderDetail,
        useTicketsDetail: useTicketsArr,
      })
    }
  }, [ticketRecordsForOrderLazyData.loading])

  useEffect(() => {
    if (!memberCardData.loading && !thirdPartyCouponData.loading && !ticketsData.loading && !productsData.loading && !servicesData.loading) {
      const membershipArr = []
      const sellTicketsArr = []
      const productArr = []
      const serviceArr = []
      const membership = idx(memberCardData, _ => _.data.memberships.data)
      const tickets = idx(ticketsData, _ => _.data.tickets)
      const products = idx(productsData, _ => _.data.products.data)
      const services = idx(servicesData, _ => _.data.services.data)
      const thirdPartyCoupon = idx(thirdPartyCouponData, _ => _.data.merchant.thirdpartyCoupons)
      for (let i = 0; i < bill.membershipOrders.length; i++) {
        membership.forEach(membership => {
          if (membership.uuid === bill.membershipOrders[i].membershipUUID) {
            membershipArr.push({
              name: membership.name,
              price: bill.membershipOrders[i].price,
              thirdPartyCoupon: null,
            })
          }
        })
        if (bill.membershipOrders[i].thirdPartyCouponMerchantId !== null) {
          thirdPartyCoupon.forEach(thirdCoupon => {
            if (thirdCoupon.id === bill.membershipOrders[i].thirdPartyCouponMerchantId) {
              membershipArr[i].thirdPartyCoupon = thirdCoupon.name
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
      for (let i = 0; i < bill.serviceOrders.length; i++) {
        services.forEach(service => {
          if (service.id === bill.serviceOrders[i].serviceId) {
            serviceArr.push({
              name: service.name,
              price: bill.serviceOrders[i].price,
              thirdPartyCoupon: null,
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
      setOrderDetail({
        ...orderDetail,
        membershipOrders: membershipArr,
        sellTicketsDetail: sellTicketsArr,
        productsDetail: productArr,
        servicesDetail: serviceArr,
      })
    }

  }, [memberCardData.loading, thirdPartyCouponData.loading, ticketsData.loading, productsData.loading, servicesData.loading])

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
  useEffect(() => {
    const sellTicketTotal = orderDetail.sellTicketsDetail
      .map(data => data.price)
      .reduce((accu, curVal) => (accu += curVal), 0)
    setSellTicketTotal(sellTicketTotal)
  }, [orderDetail.sellTicketsDetail])
  // 移除座號相關邏輯

  const handleOrderPendingConfirm = () => {
    openSnackbar({
      message: `確認要掛單嗎，掛單只會紀錄此筆訂單的紀錄，不會正式成立訂單唷`,
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
  const getHelper = id => {
    const helper = getHelperForPrint.filter(d => d.userId === id)
    return helper[0].userNo || helper[0].userName
  }
  return (
    !designer.loading &&
    !servicesData.loading &&
    !thirdPartyCouponData.loading &&
    !productsData.loading &&
    !ticketsData.loading &&
    !ticketRecordsForOrderLazyData.loading &&
    !getLogoDisplayOnInvoice.loading &&
    !getQrcodeDisplayOnInvoice.loading &&
    !getMessageDisplayOnInvoice.loading && (
      <Modal open={openOrderDetail}>
        <Card css={styles.root}>
          <div css={styles.header}>
            <CardHeader title="消費明細" />
            <Button
              color="primary"
              variant="contained"
              onClick={closeModal}
              css={styles.backBtn}
              disabled={checkoutBtnClick}
            >
              返回
            </Button>
          </div>
          <CardContent id="DivIdToPrint">
            <Grid container>
              <Grid container css={styles.rowOfGrid}>
                <Grid item xs={8}>
                  {merchantName}
                </Grid>
                <Grid item xs={4}>
                  {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
                </Grid>
              </Grid>
              <Grid container css={styles.rowOfGrid}>
                <Grid item xs={2}>
                  {bill.isDesignate ? '指定' : '不指定'}
                </Grid>
                <Grid item xs={5}>
                  顧客:{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
                </Grid>
                <Grid item xs={5}>
                  設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
                </Grid>
              </Grid>
              <Grid container css={styles.dividerDiv}>
                <Divider style={{ width: '100%' }} />
              </Grid>
              <Grid container css={styles.rowOfGrid}>
                {orderDetail.servicesDetail.length === 0 ? (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}>
                      項目消費
                    </Grid>
                    <Grid item xs={5}>
                      未選擇
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                ) : (
                  orderDetail.servicesDetail.length > 0 &&
                  orderDetail.servicesDetail.map((service, index) => (
                    <Fragment key={index}>
                      <Grid item xs={2}>
                        項目消費
                      </Grid>
                      <Grid item xs={5}>
                        {service.name}
                      </Grid>
                      <Grid item xs={2}>
                        {service.price}
                      </Grid>
                      {service.thirdPartyCoupon === null ? (
                        <Grid item xs={3}></Grid>
                      ) : (
                        <Grid item xs={3}>
                          {service.thirdPartyCoupon}
                        </Grid>
                      )}
                    </Fragment>
                  ))
                )}
                {orderDetail.productsDetail.length === 0 ? (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}>
                      店販銷售
                    </Grid>
                    <Grid item xs={5}>
                      未選擇
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                ) : (
                  orderDetail.productsDetail.length > 0 &&
                  orderDetail.productsDetail.map((product, index) => (
                    <Fragment key={index}>
                      <Grid item xs={2}>
                        店販銷售
                      </Grid>
                      <Grid item xs={5}>
                        {`${product.name}*${product.count}`}
                      </Grid>
                      <Grid item xs={2}>
                        {product.price * product.count}
                      </Grid>
                      {product.thirdPartyCoupon === null ? (
                        <Grid item xs={3}></Grid>
                      ) : (
                        <Grid item xs={3}>
                          {product.thirdPartyCoupon}
                        </Grid>
                      )}
                    </Fragment>
                  ))
                )}
                {orderDetail.sellTicketsDetail.length === 0 ? (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}>
                      卡券銷售
                    </Grid>
                    <Grid item xs={5}>
                      未選擇
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                ) : (
                  orderDetail.sellTicketsDetail.length > 0 &&
                  orderDetail.sellTicketsDetail.map((sellTicket, index) => (
                    <Fragment key={index}>
                      <Grid item xs={2}>
                        卡券銷售
                      </Grid>
                      <Grid item xs={5}>
                        {`${sellTicket.name}含(${sellTicket.availableCount})次*${sellTicket.count}`}
                      </Grid>
                      <Grid item xs={2}>
                        {sellTicket.price * sellTicket.count}
                      </Grid>
                      <Grid item xs={3}></Grid>
                    </Fragment>
                  ))
                )}
                {orderDetail.useTicketsDetail.length === 0 ? (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}>
                      卡券使用
                    </Grid>
                    <Grid item xs={5}>
                      未選擇
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                ) : (
                  orderDetail.useTicketsDetail.length > 0 &&
                  orderDetail.useTicketsDetail.map((useTicket, index) => (
                    <Fragment key={index}>
                      <Grid item xs={2}>
                        卡券使用
                      </Grid>
                      <Grid item xs={5}>
                        {useTicket.name}
                      </Grid>
                      <Grid item xs={2}>
                        {useTicket.price}
                      </Grid>
                      <Grid item xs={3}></Grid>
                    </Fragment>
                  ))
                )}
              </Grid>
              {orderDetail.membershipOrders.length === 0 ? (
                <Grid container css={styles.rowOfGrid}>
                  <Grid item xs={3}>
                    會員卡銷售
                  </Grid>
                  <Grid item xs={5}>
                    未選擇
                  </Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}></Grid>
                </Grid>
              ) : (
                orderDetail.membershipOrders.length > 0 &&
                orderDetail.membershipOrders.map((memberShipCard, index) => (
                  <Fragment key={index}>
                    <Grid item xs={3}>
                      會員卡銷售
                    </Grid>
                    <Grid item xs={4}>
                      {memberShipCard.name}
                    </Grid>
                    <Grid item xs={2}>
                      {memberShipCard.price}
                    </Grid>
                    <Grid item xs={2}></Grid>
                  </Fragment>
                ))
              )}
              <Grid container css={styles.dividerDiv}>
                <Divider style={{ width: '100%' }} />
              </Grid>
              <Grid container css={styles.rowOfGrid}>
                <Grid item xs={2}>
                  應付帳款
                </Grid>
                <Grid item xs={5}></Grid>
                <Grid item xs={2}>
                  {orderDetailPaymentShouldPay}
                </Grid>
                <Grid item xs={3}></Grid>
              </Grid>
              <Grid container css={styles.rowOfGrid}>
                <Grid container css={styles.rowOfGrid}>
                  <Grid item xs={4}>
                    其他支付方式
                  </Grid>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
                {bill.payType.length === 0 && bill.walletPay === 0 && (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={5}>
                      無
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                )}
                {bill.payType.length > 0 && (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={5}>
                      {bill.payType[0]}
                    </Grid>
                    <Grid item xs={2}>
                      {bill.amountByOtherPay}
                    </Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                )}
                {bill.walletPay > 0 && (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={5}>
                      扣入金
                    </Grid>
                    <Grid item xs={2}>
                      {bill.walletPay}
                    </Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                )}
                {bill.walletPay > 0 && (
                  <Grid container css={styles.rowOfGrid}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={5}>
                      入金剩餘
                    </Grid>
                    <Grid item xs={2}>
                      {walletPayBalanceForDetail}
                    </Grid>
                    <Grid item xs={3}></Grid>
                  </Grid>
                )}
              </Grid>
              <Grid container css={styles.dividerDiv}>
                <Divider style={{ width: '100%' }} />
              </Grid>
              <Grid container css={styles.rowOfGrid}>
                <Grid item xs={3} css={styles.detailBottomCash}>
                  現金應收
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={2} css={styles.detailBottomCash}>
                  {cashPayment}
                </Grid>
                <Grid item xs={3}></Grid>
              </Grid>
            </Grid>
          </CardContent>
          <div css={styles.btnDiv}>
            {!disablePendingOrder && (
              <Button
                color="primary"
                variant="contained"
                size="small"
                onClick={handleOrderPendingConfirm}
                disabled={valid || isClick || checkoutBtn}
                style={{ margin: '0 3px' }}
              >
                掛單
              </Button>
            )}
            <Button
              color="error"
              variant="contained"
              size="small"
              ref={checkOrderRef}
              onClick={usehandleCreateOrder}
              style={{ margin: '0 3px' }}
              disabled={valid || checkoutBtn || isClick}
            >
              結帳
            </Button>

            <Button
              color="primary"
              variant="contained"
              size="small"
              ref={checkOrderPrintRef}
              onClick={usehandleCreateOrderAndPrint}
              style={{ margin: '0 3px' }}
              disabled={valid || checkoutBtn || isClick}
            >
              結帳並列印
            </Button>
          </div>

          <div style={{ display: 'none' }} ref={printMainRef} >
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
                      value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                    />
                  </div>
                </div>
            }
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px' }}>{merchantName}</div>
              <div style={{ color: '#009999' }}>結帳單</div>
            </div>
            <div>日期：{format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}</div>
            <div>帳單編號：{orderNumber}</div>
            <div>
              設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
            </div>
            <div>
              顧客：{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
            </div>
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
                        {bill.serviceOrders[index].serviceOrderHelpers.map((d, index) => {
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
                {orderDetail.productsDetail.length > 0 &&
                  orderDetail.productsDetail.map((product, index) => (
                    <div
                      key={`productsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{`${product.name}`}</div>
                      <div>
                        {product.price * product.count}x{product.count}
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.sellTicketsDetail.length > 0 &&
                  orderDetail.sellTicketsDetail.map((sellTicket, index) => (
                    <div
                      key={`sellTicketsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div item xs={5}>
                        {`${sellTicket.name}含(${sellTicket.availableCount})次`}
                      </div>
                      <div item xs={2}>
                        {sellTicket.price}
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.useTicketsDetail.length > 0 &&
                  orderDetail.useTicketsDetail.map((useTicket, index) => (
                    <div
                      key={`useTicketsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{useTicket.name}</div>
                      <div>{useTicket.price}</div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.membershipOrders.length > 0 &&
                  orderDetail.membershipOrders.map((memberShipCard, index) => (
                    <div
                      key={`membershipOrders-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{memberShipCard.name}</div>
                      <div>{memberShipCard.price}</div>
                    </div>
                  ))}
              </div>
              <Divider style={{ width: '100%' }} />
              <div>合計：{orderDetailPaymentShouldPay}</div>
              <div>結帳：</div>
              <div style={{ display: 'flex', margin: '0 15px', justifyContent: 'space-between' }}>
                <div>扣入金：{bill.walletPay}</div>
                <div>入金餘額：{customerWallet - bill.walletPay}</div>
                {(bonusActive && !bill.withoutCustomerData) && (
                  <>
                    <div>增點：{bill.bonusDeposit}</div>
                    <div>扣點：{bill.bonusUsed}</div>
                    <div>折抵：{bill.bonusDecount}</div>
                    <div>點數餘額：{customerBonus + bill.bonusDeposit - bill.bonusUsed}</div>
                  </>
                )}
                <div>卡券金額：{sellTicketTotal}</div>
                <div style={{ color: '#EE0000' }}>付現金額：{cashPayment}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'none' }} ref={printThermalRef} >
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
                        value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                      />
                    </div>
                  </div>
              }
              <div>
                <span>{merchantName}</span>
                <span style={{ marginLeft: '20px' }}>結帳單</span>
              </div>
              <div>日期：{format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}</div>
              <div>
                帳單編號：{orderNoInPrint}
                {/* {format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(0, 4) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(5, 7) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(8, 10) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(11, 13) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(14, 16)} */}
              </div>
              <div>
                設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
              </div>
              <div>
                顧客：{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
              </div>
              <Divider style={{ width: '100%' }} />
              <table style={{ width: '100%' }}>
                <thead style={{ sizeWidth: 'bold' }}>
                  <td style={{ minWidth: '4ch' }}>名稱</td>
                  <td style={{ minWidth: '4ch' }}>單價</td>
                  <td style={{ minWidth: '4ch' }}>數量</td>
                  <td style={{ minWidth: '4ch' }}>小計</td>
                </thead>
                <tbody>
                  {orderDetail.servicesDetail.length > 0 &&
                    orderDetail.servicesDetail.map((service, index) => {
                      return (
                        <Fragment key={`servicesDetail-${index}`}>
                          <tr>
                            <td>{service.name}</td>
                            <td>{service.price}</td>
                            <td>1</td>
                            <td>{service.price}</td>
                          </tr>
                          <tr>
                            {bill.serviceOrders[index].serviceOrderHelpers.map((d, index) => {
                              return (
                                <td key={`helper-${index}`} style={{ fontSize: '6px', width: 'fit-content' }}>
                                  助理:{getHelper(d.helperId)}
                                </td>
                              )
                            })}
                          </tr>
                        </Fragment>
                      )
                    })}

                  {orderDetail.productsDetail.length > 0 &&
                    orderDetail.productsDetail.map((product, index) => (
                      <tr key={`productsDetail-${index}`}>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.count}</td>
                        <td>{product.price * product.count}</td>
                      </tr>
                    ))}
                  {orderDetail.sellTicketsDetail.length > 0 &&
                    orderDetail.sellTicketsDetail.map((sellTicket, index) => (
                      <tr key={`sellTicketsDetail-${index}`}>
                        <td>{`${sellTicket.name}含(${sellTicket.availableCount})次`}</td>
                        <td>{sellTicket.price}</td>
                        <td>1</td>
                        <td>{sellTicket.price}</td>
                      </tr>
                    ))}
                  {orderDetail.useTicketsDetail.length > 0 &&
                    orderDetail.useTicketsDetail.map((useTicket, index) => (
                      <tr key={`useTicketsDetail-${index}`}>
                        <td>{useTicket.name}</td>
                        <td>{useTicket.price}</td>
                        <td>1</td>
                        <td>{useTicket.price}</td>
                      </tr>
                    ))}
                  {orderDetail.membershipOrders.length > 0 &&
                    orderDetail.membershipOrders.map((memberShipCard, index) => (
                      <tr key={`membershipOrders-${index}`}>
                        <td>{memberShipCard.name}</td>
                        <td>{memberShipCard.price}</td>
                        <td></td>
                        <td>{memberShipCard.price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Divider style={{ width: '100%' }} />
              <div>合計：{orderDetailPaymentShouldPay}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>扣入金：{bill.walletPay}</div>
                <div>入金餘額：{customerWallet - bill.walletPay}</div>
              </div>
              {(bonusActive && !bill.withoutCustomerData) && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>增點：{bill.bonusDeposit}</div>
                    <div>扣點：{bill.bonusUsed}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>折抵：{bill.bonusDecount}</div>
                    <div>點數餘額：{customerBonus + bill.bonusDeposit - bill.bonusUsed}</div>
                  </div>
                </>
              )}
              <div>卡券金額：{sellTicketTotal}</div>
              <div>付現金額：{cashPayment}</div>
              <div>謝謝惠顧,歡迎下次光臨!</div>
            </div>
          </div>
        </Card>
      </Modal>
    )
  )
}

OrderDetailModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

OrderDetailModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(OrderDetailModal)
