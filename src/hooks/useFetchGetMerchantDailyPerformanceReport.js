import { gql, useQuery } from '@apollo/client'

const FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT = gql`
  query FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT($input: MerchantDailyPerformanceReportInput!) {
    merchantDailyPerformanceReport(input: $input) {
      performance {
        fakePerformance
        orderCount
        averagePerformance
        orderMaleCount
        orderFemaleCount
        orderUnknownCount
        orderDesignateCount
        orderNonDesignatecount
        customerMaleCount
        customerFemaleCount
        customerUnknownCount
        categoryData {
          orderCount
          fakePerformance
          categoryName
          averagePerformance
        }
        productPerformance
        productOrderCount
        productAveragePerformance
        membershipPerformance
        membershipOrderCount
        membershipAveragePerformance
      }
      date
    }
  }
`
export default function useFetchGetMerchantDailyPerformanceReport({ input }) {
  return useQuery(FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
