import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_OTHER_PAYMENT_REPORT = gql`
  query GET_MERCHANT_OTHER_PAYMENT_REPORT($input: DateTimeInput!) {
    merchantOtherPayWayDetailReport(input: $input) {
      merchantOtherPayWayDetailReport {
        date
        payTypeDetail {
          name
          price
        }
      }
      usedPayType
    }
  }
`

export default function useFetchMerchantOtherPayWayDetailReport({ input }) {
  return useQuery(GET_MERCHANT_OTHER_PAYMENT_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
