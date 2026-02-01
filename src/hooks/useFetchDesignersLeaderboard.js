import { gql, useQuery } from '@apollo/client'

const FETCH_DESIGNERS_LEADERBOARD = gql`
  query FETCH_DESIGNERS_LEADERBOARD(
    $startDay: DateTime
    $endDay: DateTime
    $merchantId: [ID]
    $reference: PerformanceEnum
    $isIncludeProductPerformance: Boolean = false
    $isIncludeMembershipPerformance: Boolean = false
  ) {
    designerLeaderboard(
      startDay: $startDay
      endDay: $endDay
      merchantId: $merchantId
      reference: $reference
      isIncludeProductPerformance: $isIncludeProductPerformance
      isIncludeMembershipPerformance: $isIncludeMembershipPerformance
    ) {
      designerLeaderBoard {
        userName
        storeName
        serviceTotal
        designateServiceTotal
        nonDesignateServiceTotal
        usedTicketTotal
        productTotal
        membershipTotal
        helperPaidPoint
        helperPaidPrice
        monthlyAveragePerformance
        ticketSellIntoPerformanceDesignate
        ticketSellIntoPerformanceNonDesignate
        businessPerformanceTotal
        orderCount
        performanceEV
        mergedDetails {
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
          orderCount
          performanceEV
        }
      }
      monthlyAveragePerformanceTotal
    }
  }
`
export default function useFetchDesignersLeaderboard({
  startDay,
  endDay,
  merchantId,
  reference,
  isIncludeProductPerformance,
  isIncludeMembershipPerformance
}) {
  return useQuery(FETCH_DESIGNERS_LEADERBOARD, {
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
