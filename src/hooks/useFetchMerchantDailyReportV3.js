import { gql, useQuery } from '@apollo/client'

const FETCH_MERCHANT_DAILY_REPORTV3 = gql`
  query FETCH_MERCHANT_DAILY_REPORTV3($input: DateTimeInput!) {
    merchantDailyReportV2(input: $input) {
      currentDay {
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
        orderDesignateCount
        orderNonDesignateCount
        orderCount
        orderAveragePrice
        walletDepositTotal
        walletUsedTotal
        ticketSellTotal
        ticketUsedTital
        membership
        categoryPerformance {
          name
          performance
          designationCount
          nonDesignationCount
          totalCount
          averagePerformance
          orderTypeCount
          orderTypeAveragePerformance
          performanceTillNow
          designationCountTillNow
          nonDesignationCountTillNow
          totalCountTillNow
          averagePerformanceTillNow
          orderTypeCountTillNow
          orderTypeAveragePerformanceTillNow
        }
      }
      pickingRecord {
        productNumber
        productName
        cashRevenue
        cashExpenditure
        remark
      }
      generalMoneyFlow {
        subjectNumber
        subjectName
        cashRevenue
        cashExpenditure
        remark
      }
      moneyFlow {
        subjectNumber
        subjectName
        cashRevenue
        cashExpenditure
        remark
      }
      moneyFlowNotCash {
        subjectNumber
        subjectName
        cashRevenue
        cashExpenditure
        remark
      }

      businessCash
      cashBalance
      summaryRevenue
      summaryExpenditure
      orderTotalCount
      orderDesignateCount
      orderNonDesignateCount
      orderMaleCount
      orderFemaleCount
      orderUnknownCount
    }
  }
`

export default function useFetchMerchantReportV3({ input }) {
  return useQuery(FETCH_MERCHANT_DAILY_REPORTV3, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
