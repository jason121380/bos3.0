import { gql, useQuery } from '@apollo/client'

export const GET_CREATE_BOOKING_DAY_LIMIT = gql`
  query GET_CREATE_BOOKING_DAY_LIMIT {
    getCreateBookingDayLimit
  }
`

export default function useFetchGetCreateBookingDayLimit() {
  return useQuery(GET_CREATE_BOOKING_DAY_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}
