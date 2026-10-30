import { useState, useEffect, useContext } from 'react'
import billContext from 'context/keyInContext'
import { useFetchCustomerInOrderDetail } from 'hooks/useFetchCustomer'
import { useFetchServicesInOrderDetail } from 'hooks/useFetchServices'
import idx from 'idx'
import { useFetchThirdPartysInOrderDetail } from 'hooks/useFetchMerchant'
import { useFetchProductsInOrderDetail } from 'hooks/useFetchProducts'
import { useFetchTicketsInOrderDetail } from 'hooks/useFetchTickets'
import useFetchGetTicketRecordsForOrder from 'hooks/useFetchGetTicketRecordsForOrder'
import { useFetcDesignerInOrderDetail } from 'hooks/useFetchMerchantDesigner'
import { useFetchGetMembershipsForAutocomplete } from 'hooks/useFetchGetMembership'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import useInvoiceDecorations from 'views/OrderShared/useInvoiceDecorations'

// 打帳單「消費明細」彈窗的資料（2026/10/21 自 OrderDetailModal.js 原樣搬出）：
// 帳單各項目對應的名稱（服務／店販／卡券銷售／卡券使用／會員卡）、顧客與設計師、設計師名稱顯示方式、
// 收據 Logo／QR code／訊息（與掛單詳細共用 OrderShared/useInvoiceDecorations）。查詢送出的先後順序與搬出前相同。
// ready：所有資料載入完成（彈窗載入完成前不顯示，條件與搬出前逐字相同）
export default function useOrderDetailItems() {
  const { bill, reset } = useContext(billContext)
  const [orderDetail, setOrderDetail] = useState({
    servicesDetail: [],
    productsDetail: [],
    sellTicketsDetail: [],
    useTicketsDetail: [],
    membershipOrders: [],
  })
  const [sellTicketTotal, setSellTicketTotal] = useState(0)
  const [nameDisplayOnInvoice, setNameDisplayOnInvoice] = useState('NAME')
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name
  const customer = useFetchCustomerInOrderDetail({
    id: bill.customerId === undefined ? null : bill.customerId,
  })
  const designer = useFetcDesignerInOrderDetail({
    // 明細只在帳單已選服務人員時才能開啟（Header 的 valid），designerId 一定有值
    designerId: bill.designerId,
  })

  const servicesData = useFetchServicesInOrderDetail({})
  const thirdPartyCouponData = useFetchThirdPartysInOrderDetail()
  const productsData = useFetchProductsInOrderDetail()
  const ticketsData = useFetchTicketsInOrderDetail()
  const memberCardData = useFetchGetMembershipsForAutocomplete({})
  const getDesignerNameDisplayOnInvoice = useFetchGetDesignerNameDisplayOnInvoice()
  const [ticketRecordsForOrderLazy, ticketRecordsForOrderLazyData] = useFetchGetTicketRecordsForOrder()

  // 開彈窗時清空上一張帳單的明細（在收據設定之前，effect 執行順序與搬出前相同）
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

  // 收據上方的 Logo／QR code／訊息
  const {
    detailInfo, qrcodeUrl, imgUrl,
    getLogoDisplayOnInvoice, getQrcodeDisplayOnInvoice, getMessageDisplayOnInvoice,
  } = useInvoiceDecorations()

  useEffect(() => {
    if (bill.customerId) {
      ticketRecordsForOrderLazy({
        variables: {
          customerId: bill.customerId
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（ticketRecordsForOrderLazy）；只在 [bill.customerId] 變動時呼叫，補上會每次 render 重跑
  }, [bill.customerId])

  useEffect(() => {
    if (!getDesignerNameDisplayOnInvoice.loading) {
      const data = idx(getDesignerNameDisplayOnInvoice, _ => _.data.getDesignerNameDisplayOnInvoice)
      setNameDisplayOnInvoice(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getDesignerNameDisplayOnInvoice.loading])

  useEffect(() => {
    if (!ticketRecordsForOrderLazyData.loading && ticketRecordsForOrderLazyData.data) {
      // 只有帳單有顧客時才會查（上方 effect），有資料就一定有顧客
      const ticketsRecords = idx(ticketRecordsForOrderLazyData, _ => _.data.ticketRecordsForOrder)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [ticketRecordsForOrderLazyData.loading] 變動時執行；bill.useTicketOrders、orderDetail、ticketRecordsForOrderLazyData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [memberCardData.loading, thirdPartyCouponData.loading, ti…] 變動時執行；bill.membershipOrders、bill.productOrders、bill.serviceOrders、bill.ticketOrders、memberCardData、orderDetail、productsData、servicesData、thirdPartyCouponData、ticketsData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [memberCardData.loading, thirdPartyCouponData.loading, ticketsData.loading, productsData.loading, servicesData.loading])

  useEffect(() => {
    const sellTicketTotal = orderDetail.sellTicketsDetail
      .map(data => data.price)
      .reduce((accu, curVal) => (accu += curVal), 0)
    setSellTicketTotal(sellTicketTotal)
  }, [orderDetail.sellTicketsDetail])

  const ready = (
    !designer.loading &&
    !servicesData.loading &&
    !thirdPartyCouponData.loading &&
    !productsData.loading &&
    !ticketsData.loading &&
    !ticketRecordsForOrderLazyData.loading &&
    !getLogoDisplayOnInvoice.loading &&
    !getQrcodeDisplayOnInvoice.loading &&
    !getMessageDisplayOnInvoice.loading
  )

  return {
    ready,
    merchantName,
    orderDetail,
    sellTicketTotal,
    nameDisplayOnInvoice,
    customer,
    designer,
    detailInfo,
    qrcodeUrl,
    imgUrl,
  }
}
