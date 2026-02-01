import { gql, useQuery } from '@apollo/client'

const GET_IS_BOOKING_ITEM_REQUIRED = gql`
  query GET_IS_BOOKING_ITEM_REQUIRED {
    getIsBookingItemRequired
  }
`

export default function useFetchGetIsBookingItemRequired() {
  return useQuery(GET_IS_BOOKING_ITEM_REQUIRED, {
    fetchPolicy: 'cache-and-network',
  })
}