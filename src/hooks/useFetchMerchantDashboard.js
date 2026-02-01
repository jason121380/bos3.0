import { gql, useQuery } from '@apollo/client'

const FETCH_MERCHNAT_DASHBOARD = gql`
  query FETCH_MERCHNAT_DASHBOARD($input: DateTimeInput!) {
    merchantDashboard(input: $input) {
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
      }
      otherPayway {
        paywayName
        usedPrice
        usedPriceWithNoCash
      }
      thirdPartTicket {
        ticketName
        usedPrice
        usedPriceWithNoCash
      }
      walletDeposit {
        paywayName
        usedPrice
        usedPriceWithNoCash
      }
    }
  }
`

export default function useFetchMerchantDashboard({ input }) {
  return useQuery(FETCH_MERCHNAT_DASHBOARD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
