import { gql, useQuery } from '@apollo/client'

const GET_BUSINESS_ANALYSIS_DATA = gql`
  query GET_BUSINESS_ANALYSIS_DATA($input: BusinessAnalysisReportInput!) {
    businessAnalysisReport(input: $input) {
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
        expenditure
        membership
        bonusDecountForReport
      }
      pageLimit
      pageOffset
      totalCount
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
        expenditure
        membership
        bonusDecountForReport
      }
    }
  }
`

export default function useFetchGetBusinessAnalysisReport({ input }) {
  return useQuery(GET_BUSINESS_ANALYSIS_DATA, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
