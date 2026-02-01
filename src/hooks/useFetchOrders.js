import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_ORDERS = gql`
  query FETCH_ORDERS($input: OrdersInput!) {
    orders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      intervalSummary {
        service
        product
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        walletDeposit
      }
      orders {
        id
        isDesignate
        date
        isReserved
        payType
        walletPay
        amountByOtherPay
        status
        reference
        serviceFakeTotal
        productFakeTotal
        ticketFakeTotal
        serviceOtherPayFee
        serviceThirdPartyPayFee
        productOtherPayFee
        productThirdPartyPayFee
        ticketOtherPayFee
        ticketThirdPartyPayFee
        cashTotal
        payType2
        remark
        ticketSellIntoPerformance
        ticketSellNotIntoPerformance
        performanceIncome
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        serviceCategory {
          id
          name
        }
        customer {
          id
          name
          cellphone
          no
        }
        designer {
          id
          name
          designerNo
          firstName
          lastName
        }
        isCloseAccount
        closeAccountDate
        no
        serviceOrders {
          id
          price
          thirdPartyPayName
        }
        productOrders {
          id
          name
          price
          thirdPartyPayName
        }
        ticketOrders {
          id
          name
          price
        }
        useTicketOrders {
          id
          name
          price
        }
        # previewItem
        serviceRealTotal
        productTotal
        sellTicketTotal
        useTicketTotal
      }
    }
  }
`

export default function useFetchOrders(input) {
  return useQuery(FETCH_ORDERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_ORDERS_FOR_LIST = gql`
  query FETCH_ORDERS_FOR_LIST($input: OrdersInput!) {
    orders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      intervalSummary {
        service
        product
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        walletDeposit
        membership
        bonusDecountForReport
      }
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
        walletUsedForDecount
        businessCash
        customer {
          name
          cellphone
          id
          no
        }
        designer {
          name
          nickName
          designerNo
          firstName
          lastName
        }
        isCloseAccount
        no
        serviceOrders {
          price
          thirdPartyPayName
        }
        productOrders {
          price
          thirdPartyPayName
          count
        }
        membershipOrders {
          price
          thirdPartyPayName
          membership {
            name
          }
        }
        useTicketOrders {
          id
          helperList {
            id
            type
            isDesignate
            helperDeductiontype
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
        customerLeftBonus
        bonusDecountForReport
        bonusDeposit
        bonusUsed
      }
    }
  }
`

export function useFetchOrdersForList(input) {
  return useQuery(FETCH_ORDERS_FOR_LIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_ORDERS_FOR_DRAFT_LIST = gql`
  query FETCH_ORDERS_FOR_DRAFT_LIST($input: OrdersInput!) {
    orders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      intervalSummary {
        service
        product
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        walletDeposit
        membership
        bonusDecountForReport
      }
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
        walletPay
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
        serialNumber
      }
    }
  }
`
export function useFetchOrdersForDraftList(input) {
  return useQuery(FETCH_ORDERS_FOR_DRAFT_LIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

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

export function useFetchOrdersForEmployeeDetail(input) {
  return useQuery(FETCH_ORDERS_FOR_EMPLOYEE_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchOrdersLazy() {
  const [fetchOrdersLazy, ordersLazyData] = useLazyQuery(FETCH_ORDERS_FOR_EMPLOYEE_DETAIL, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchOrdersLazy, ordersLazyData }
}

const FETCH_ORDERS_FOR_CUSTOMER_DETAIL = gql`
  query FETCH_ORDERS_FOR_CUSTOMER_DETAIL($input: OrdersInput!) {
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
        ticketFakeTotal
        useTicketTotal
        walletPay
        amountByOtherPay
        cashTotal
        isReserved
        customer {
          name
          cellphone
        }
        designer {
          name
          designerNo
        }
        no
        serviceOrders {
          thirdPartyPayName
        }
        staticDetail {
          serviceType
          itemName
          count
          price
          helperList {
            helperName
            helperType
          }
        }
        bonusDecount
      }
    }
  }
`

export function useFetchOrdersForCustomerDetail(input) {
  return useQuery(FETCH_ORDERS_FOR_CUSTOMER_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
const FETCH_ORDERS_FOR_WEB_ORDER_MANAGEMENTLIST = gql`
  query FETCH_ORDERS_FOR_WEB_ORDER_MANAGEMENTLIST($input: OrdersInput!) {
    orders(input: $input) {
      pageLimit
      pageOffset
      totalCount
      orders {
        id
        isDesignate
        date
        status
        reference
        isCheckin
        isCusCheckRequired
        serviceCategory {
          name
        }
        customer {
          name
          cellphone
        }
        designer {
          name
          designerNo
        }
        no
      }
    }
  }
`

export function useFetchOrdersForWebOrderManagementList(input) {
  return useQuery(FETCH_ORDERS_FOR_WEB_ORDER_MANAGEMENTLIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
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
  })
  return {
    fetchDesignerOrderRecords,
    designerOrderRecords,
  }
}

const DECREASE_DETAIL = gql`
  query DECREASE_DETAIL($input: OrdersInput!) {
    orders(input: $input) {
      totalCount
      pageLimit
      pageOffset
      orders {
        id
        date
        no
        previewItem
        designer {
          id
          name
          designerNo
        }
        # 服務業績 (虛)
        serviceTotal
        # 固定扣項
        serviceDeductionPrice
        # 助理使用扣項
        helperDeductionPrice
        # 服務業績 (實)
        serviceRealTotal
        serviceOrders {
          id
          name
          service {
            helperDeductionSetting {
              helperDeductionType
            }
          }
          helperList {
            id
            type
            fixCommissionAmount
            commissionPercent
            commissionAmount
            point
            pointAmount
            helperDeductionType
            helper {
              id
              name
              deductionWay
            }
          }
        }
        useTicketOrders {
          id
          service {
            name
            helperDeductionSetting {
              helperDeductionType
            }
          }
          helperList {
            id
            type
            fixCommissionAmount
            commissionPercent
            commissionAmount
            point
            pointAmount
            helper {
              id
              name
              deductionWay
            }
          }
        }
      }
    }
  }
`

export const useFetchDecreaseDetail = input =>
  useQuery(DECREASE_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })

const LAST_ORDER_NO = gql`
  query LAST_ORDER_NO($input: OrdersInput!) {
    orders(input: $input) {
      orders {
        no
        isDesignate
      }
    }
  }
`

export const useFetchLastOrderNo = input =>
  useQuery(LAST_ORDER_NO, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })

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