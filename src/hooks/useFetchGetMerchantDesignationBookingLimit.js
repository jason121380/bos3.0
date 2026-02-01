import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_DESIGNANTION_BOOKING_LIMIT = gql`
  query getMerchantDesignationBookingLimit {
    getMerchantDesignationBookingLimit
  }
`

export default function useFetchGetMerchantDesignationBookingLimit() {
  return useQuery(GET_MERCHANT_DESIGNANTION_BOOKING_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}
