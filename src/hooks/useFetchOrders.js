import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_ORDERS_FOR_EMPLOYEE_DETAIL = gql`
  query FETCH_ORDERS_FOR_EMPLOYEE_DETAIL($input: OrdersInput!) {
    orders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      intervalSummary {
        bonusDecountForReport
      }
      orders {
        id
        isDesignate
        date
        payType2
        remark
        status
        serviceFakeTotal
        productFakeTotal
        useTicketTotal
        walletPay
        amountByOtherPay
        cashTotal
        customer {
          name
          cellphone
        }
        designer {
          name
          designerNo
          firstName
          lastName
        }
        no
        serviceOrders {
          thirdPartyPayName
        }
        ticketOrders {
          price
        }
        bonusDecount
      }
    }
  }
`

export function useFetchOrdersLazy() {
  const [fetchOrdersLazy, ordersLazyData] = useLazyQuery(FETCH_ORDERS_FOR_EMPLOYEE_DETAIL, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchOrdersLazy, ordersLazyData }
}

const DESIGNER_ORDER_RECORDS = gql`
  query DESIGNER_ORDER_RECORDS($input: OrdersInput!) {
    orders(input: $input) {
      orders {
        id
        no
        date
        serviceFakeTotal
        serviceOtherPayFee
        serviceThirdPartyPayFee
        productFakeTotal
        productOtherPayFee
        productThirdPartyPayFee
        ticketFakeTotal
        ticketOtherPayFee
        ticketThirdPartyPayFee
        walletPay
        amountByOtherPay
        cashTotal
        designer {
          id
          designerNo
          name
        }
        customer {
          id
          name
          cellphone
        }
        serviceOrders {
          id
          price
          thirdPartyPayName
        }
        productOrders {
          price
        }
        useTicketOrders {
          price
        }
        ticketOrders {
          price
        }
        isDesignate
        serviceTotal
        productTotal
        sellTicketTotal
        useTicketTotal
        payType
        payType2
      }
    }
  }
`

export const useFetchDesignerOrderRecords = input => {
  const [fetchDesignerOrderRecords, designerOrderRecords] = useLazyQuery(DESIGNER_ORDER_RECORDS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchDesignerOrderRecords,
    designerOrderRecords,
  }
}

const FETCH_ORDERS_FOR_FAST_CHECK = gql`
  query FETCH_ORDERS_FOR_FAST_CHECK($input: OrdersInput!) {
    orders(input: $input) {
      intervalSummary {
        service
        product
        usedTicket
        membership
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        bonusDecountForReport
      }
      orders {
        id
        isDesignate
        walletPay
        serviceFakeTotal 
        productFakeTotal
        membershipFakeTotal
        payType2
        useTicketTotal
        ticketSellIntoPerformance
        ticketSellNotIntoPerformance
        performanceIncome
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        bonusDecountForReport
        customer {
          name
        }
        designer {
          name
        }
        no
        serviceOrders {
          thirdPartyPayName
        }
        productOrders {
          thirdPartyPayName
        }
        membershipOrders {
          thirdPartyPayName
        }
        bonusDecountForReport
        remark
        source
      }
    }
  }
`

export function useFetchOrdersFastCheckLazy() {
  const [ordersFastCheckLazy, ordersFastCheckLazyData] = useLazyQuery(FETCH_ORDERS_FOR_FAST_CHECK, {
    fetchPolicy: 'cache-and-network',
  })
  return [ordersFastCheckLazy, ordersFastCheckLazyData]
}

const FETCH_PENDING_ORDERS = gql`
  query FETCH_PENDING_ORDERS($input: PendingOrderInput!) {
    pendingOrders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      orders {
        id
        customerLeftWallet
        isDesignate
        date
        serviceFakeTotal
        productFakeTotal
        membershipFakeTotal
        payType2
        remark
        ticketSellIntoPerformance
        ticketSellNotIntoPerformance
        performanceIncome
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        amountByOtherPay
        walletUsedForDecount
        businessCash
        customer {
          name
          cellphone
          id
          no
        }
        designer {
          id
          name
          nickName
          designerNo
          firstName
          lastName
        }
        isCloseAccount
        no
        serviceOrders {
          id
          price
          thirdPartyPayName
          thirdPartyPayId
          service {
            id
            name
          }
          helperList {
            helper {
              id
            }
            type
            isDesignate
            helperDeductionType
          }
        }
        ticketOrders {
          id
          price
          count
          availableCount
        }
        productOrders {
          product {
            id
          }
          price
          thirdPartyPayName
          count
          thirdPartyPayId
          seller {
            id
          }
        }
        useTicketOrders {
          id
          helperList {
            helper {
              id
            }
            type
            isDesignate
            helperDeductiontype
          }
        }
        ticketOrders {
          service {
            id
          }
          price
          availableCount
          count
          remark
          intoPerformanceWhileBuying
        }
        membershipOrders {
          seller {
            id
          }
          purchaseDate
          expiryDate
          price
          thirdPartyPayId
          thirdPartyPayName
          remark
          membership {
            uuid
            name
          }
        }
        useTicketTotal
        staticDetail {
          designerName
          serviceType
          itemName
          count
          price
          helperList {
            helperName
            helperType
            helperNo
          }
        }
        walletPay
        customerLeftBonus
        bonusDecountForReport
        bonusDecount
        bonusDeposit
        bonusUsed
        source
      }
    }
  }
`
export function useFetchPendingOrders(input) {
  return useQuery(FETCH_PENDING_ORDERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
