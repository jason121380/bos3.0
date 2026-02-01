import { gql, useQuery } from '@apollo/client'

const FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT = gql`
  query FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT(
    $input: DateTimeInput!
    $displayReference: DisplayReferenceEnum
  ) {
    merchantImmediatePerformanceReport(input: $input, displayReference: $displayReference) {
      wholeStore {
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
          categoryName
          fakePerformance
          orderCount
          averagePerformance
        }
        productPerformance
        productOrderCount
        productAveragePerformance
        membershipPerformance
        membershipOrderCount
        membershipAveragePerformance
      }
      users {
        userNo
        userName
        userId
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
          categoryName
          fakePerformance
          orderCount
          averagePerformance
        }
        productPerformance
        productOrderCount
        productAveragePerformance
        membershipPerformance
        membershipOrderCount
        membershipAveragePerformance
      }
    }
  }
`
export default function useFetchMerchantImmediatePerformReport({
  input,
  displayReference = 'FAKE',
}) {
  return useQuery(FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT, {
    variables: {
      input,
      displayReference,
    },
    fetchPolicy: 'cache-and-network',
  })
}
