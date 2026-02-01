import { gql, useQuery } from '@apollo/client'

export const GET_CLOSE_CUSTOMER_BOOKING = gql`
  query GET_CLOSE_CUSTOMER_BOOKING {
    getCloseCustomerBooking
  }
`

export default function useFetchGetCloseCustomerBooking() {
  return useQuery(GET_CLOSE_CUSTOMER_BOOKING, {
    fetchPolicy: 'cache-and-network',
  })
}