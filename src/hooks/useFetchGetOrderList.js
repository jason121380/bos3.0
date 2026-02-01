import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_ORDER_LIST = gql`
  query GET_ORDER_LIST($input: OrderListInput!) {
    getOrderList(input: $input) {
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
      orderList {
        id
        date
        orderNo
        isDesignate
        customerName
        customerCellphone
        customerNo
        designerName
        designerNo
        otherPayName
        isCloseAccount
        service
        product
        membership
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        bonusDecountForReport
        businessCash
        remark
        TPTName {
          service
          product
          membership
          overAll
        }
        source
        raffleCount
        status
        serialNumber
      }
    }
  }
`

const GET_ORDER_LIST_FOR_DETAIL = gql`
  query GET_ORDER_LIST_FOR_DETAIL($input: OrderListInput!) {
    getOrderList(input: $input) {
      intervalSummary {
        membership
        bonusDecountForReport
      }
      orderList {
        id
        date
        orderNo
        isDesignate
        customerName
        customerCellphone
        designerName
        designerNo
        otherPayName
        service
        product
        membership
        usedTicket
        ticketSellIntoPerformance
        ticketSellNotIntoPerformance
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        bonusDecountForReport
        remark
        TPTName {
          service
          product
          membership
        }
        source
        raffleCount
      }
    }
  }
`

export default function useFetchGetOrderList(input) {
  return useQuery(GET_ORDER_LIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetOrderListLazy() {
  const [getOrderListLazy, getOrderListLazyData] = useLazyQuery(GET_ORDER_LIST_FOR_DETAIL, {
    fetchPolicy: 'cache-and-network',
  })
  return { getOrderListLazy, getOrderListLazyData }
}