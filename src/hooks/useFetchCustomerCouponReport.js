import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_COUPON_BALANCE = gql`
  query GET_CUSTOMER_COUPON_BALANCE($input: CustomerCouponBalanceReportInput!) {
    customerCouponBalanceReport(input: $input) {
      data {
        customerName
        customerNo
        customerCellPhone
        couponNo
        couponName
        totalCount
        usedCount
        remainingCount
        singleCouponPrice
        singleCouponPriceDecreaseHandingFee
        otherPaymentName
        isIntoPerformanceWhileBuying
        singleCouponHandingFee
      }
    }
  }
`

export default function useFetchCustomerCouponReport({ input }) {
  return useQuery(GET_CUSTOMER_COUPON_BALANCE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
