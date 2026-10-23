import { useContext, useState, useEffect } from 'react'
import billContext from 'context/keyInContext'
import idx from 'idx'
import useFetchMerchantOrderDetailPrintLayout from 'hooks/useFetchGetMerchantPrintFormatSettings'
import { useFetchCustomerInOrderDetail } from 'hooks/useFetchCustomer'
import { useFetcDesignerInOrderDetail } from 'hooks/useFetchMerchantDesigner'
import { useFetchServicesInOrderDetail } from 'hooks/useFetchServices'
import { useFetchThirdPartysInOrderDetail } from 'hooks/useFetchMerchant'
import { useFetchProductsInOrderDetail } from 'hooks/useFetchProducts'
import { useFetchTicketsInOrderDetail } from 'hooks/useFetchTickets'
import { useFetchMembershipsInOrderDetail } from 'hooks/useFetchGetMembership'
import { useFetchTicketRecordsInOrderDetail } from 'hooks/useFetchTicketRecords'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import useInvoiceDecorations from 'views/OrderShared/useInvoiceDecorations'
import billPaymentSummary from 'helper/billPaymentSummary'

// 掛單詳細「列印」用的資料（2026/10/21 自 Footer.js 原樣搬出，Footer 只留畫面與列印範本）：
// 列印格式設定、帳單各項目對應的名稱（服務／店販／卡券／會員卡／使用預收卡）、顧客與設計師、助理編號、收據 Logo／QR code／訊息，
// 以及把 #printMain／#printThermal 的內容寫進列印視窗的 printDiv。查詢與 effect 的先後順序與搬出前相同。
export default function useDraftPrint() {
  const { bill, orderId, closureDelayed } = useContext(billContext)
  const [orderDetailPrintLayout, setOrderDetailPrintLayout] = useState('A4')
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name
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
  // 收據的「合計」與「付現金額」以打帳單收據為準（Jason 2026/10/22「照建議」）：合計＝應付帳款（第三方卡券支付的項目不計、
  // 預收卡販賣計入），付現金額＝合計扣掉扣入金、其他付款方式與紅利點數折抵（helper/billPaymentSummary，與打帳單同一份）
  const { shouldPay: printShouldPay, cashDue: printCashDue } = billPaymentSummary(bill)
  const getHelper = id => {
    const helper = getHelperForPrint.filter(d => d.userId === id)
    return helper[0].userNo || helper[0].userName
  }
  // 收據上方的 Logo／QR code／訊息（與打帳單的明細彈窗共用）
  const {
    detailInfo, qrcodeUrl, imgUrl,
    getLogoDisplayOnInvoice, getQrcodeDisplayOnInvoice, getMessageDisplayOnInvoice,
  } = useInvoiceDecorations()

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

  return {
    merchantName,
    nameDisplayOnInvoice,
    orderDetail,
    customer,
    designer,
    userOrderableList,
    getHelper,
    detailInfo,
    qrcodeUrl,
    imgUrl,
    getLogoDisplayOnInvoice,
    getQrcodeDisplayOnInvoice,
    getMessageDisplayOnInvoice,
    printDiv,
    printShouldPay,
    printCashDue,
  }
}
