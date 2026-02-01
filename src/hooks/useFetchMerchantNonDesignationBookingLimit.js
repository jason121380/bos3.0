import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_NON_DESIGNATION_BOOKING_LIMIT = gql`
  query GET_MERCHANT_NON_DESIGNATION_BOOKING_LIMIT {
    merchantNonDesignationBookingLimit
  }
`

export default function useFetchMerchantNonDesignationBookingLimit() {
  return useQuery(GET_MERCHANT_NON_DESIGNATION_BOOKING_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}
