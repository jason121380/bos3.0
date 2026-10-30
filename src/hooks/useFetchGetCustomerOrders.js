import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_ORDER_LIST = gql`
  query GET_CUSTOMER_ORDER_LIST($input: GetCustomerOrdersInput!) {
    getCustomerOrders(input: $input) {
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
      totalCount
      pageLimit
      pageOffset
    }
  }
`

export default function useFetchGetCustomerOrders(input) {
  return useQuery(GET_CUSTOMER_ORDER_LIST, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
