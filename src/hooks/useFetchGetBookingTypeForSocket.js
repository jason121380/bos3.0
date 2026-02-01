import { gql, useQuery } from '@apollo/client'

export const GET_IS_BOOKING_TYPE_FOR_SOCKET = gql`
  query GET_IS_BOOKING_TYPE_FOR_SOCKET {
    getBookingTypeForSocket
  }
`

export default function useFetchGetBookingTypeForSocket() {
  return useQuery(GET_IS_BOOKING_TYPE_FOR_SOCKET, {
    fetchPolicy: 'cache-and-network',
  })
}
