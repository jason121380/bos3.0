import { gql, useQuery } from '@apollo/client'

export const GET_DISABLE_BOOKING_DAY_LIMIT = gql`
  query GET_DISABLE_BOOKING_DAY_LIMIT {
    getDisableBookingDayLimit
  }
`

export default function useFetchGetDisableBookingDayLimit() {
  return useQuery(GET_DISABLE_BOOKING_DAY_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}
