import { gql, useQuery } from '@apollo/client'

const SET_MERCHANT_LEARDER_BOARD = gql`
  query SET_MERCHANT_LEARDER_BOARD(
    $startDay: DateTime
    $endDay: DateTime
    $merchantId: [ID]
    $reference: PerformanceEnum = FAKE
    $isIncludeProductPerformance: Boolean = false
    $isIncludeMembershipPerformance: Boolean = false
  ) {
    merchantLeaderBoard(
      startDay: $startDay
      endDay: $endDay
      merchantId: $merchantId
      reference: $reference
      isIncludeProductPerformance: $isIncludeProductPerformance
      isIncludeMembershipPerformance: $isIncludeMembershipPerformance
    ) {
      merchantLeaderBoard {
        userName
        storeName
        serviceTotal
        designateServiceTotal
        nonDesignateServiceTotal
        usedTicketTotal
        productTotal
        helperPaidPoint
        helperPaidPrice
        monthlyAveragePerformance
        ticketSellIntoPerformanceDesignate
        ticketSellIntoPerformanceNonDesignate
        businessPerformanceTotal
        membershipTotal
      }
      monthlyAveragePerformanceTotal
    }
  }
`

export default function useFetchMerchantLeaderBoard({
  startDay,
  endDay,
  merchantId,
  reference,
  isIncludeProductPerformance,
  isIncludeMembershipPerformance
}) {
  return useQuery(SET_MERCHANT_LEARDER_BOARD, {
    variables: {
      startDay,
      endDay,
      merchantId,
      reference,
      isIncludeProductPerformance,
      isIncludeMembershipPerformance
    },
    fetchPolicy: 'cache-and-network',
  })
}
