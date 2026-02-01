import { gql, useQuery } from '@apollo/client'

const FETCH_DAILY_MONEY_FLOW_REPORT = gql`
  query dailyMoneyFlowReport($input: DailyMoneyFlowInput!) {
    dailyMoneyFlowReport(input: $input) {
      pageLimit
      pageOffset
      totalCount
      data {
        date
        service
        product
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        walletDeposit
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        cashRevenue
        cashExpenditure
        cashBalance
        lastCheckoutDateTime
        checkoutStaff {
          name
        }
        membership
        picking
        bonusDecountForReport
      }
      summary {
        service
        product
        usedTicket
        ticketSellIntoPerformance
        performanceIncome
        ticketSellNotIntoPerformance
        walletDeposit
        usedTicketForDecount
        thirdPartTicketForDecount
        otherPayWayForDecount
        walletUsedForDecount
        businessCash
        cashRevenue
        cashExpenditure
        cashBalance
        membership
        picking
        bonusDecountForReport
      }
    }
  }
`

export default function useFetchDailyMoneyFlowReport(input) {
  return useQuery(FETCH_DAILY_MONEY_FLOW_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
