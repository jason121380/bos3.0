import { gql, useQuery } from '@apollo/client'

export const GET_CUSTOMER_BOOKING_LIMIT= gql`
  query GET_CUSTOMER_BOOKING_LIMIT {
    customerBookingLimit {
      isCusBookingPreferDesOnly
      isCusNonDesBookingUsing
    }
  }
`

export default function useFetGetCustomerBookingLimit() {
  return useQuery(GET_CUSTOMER_BOOKING_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}