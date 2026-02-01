import { gql, useQuery } from '@apollo/client'

export const GET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE = gql`
  query GET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE {
    getCancelBookingDayLimitByServiceDate
  }
`

export default function useFetchGetCancelBookingDayLimitByServiceDate() {
  return useQuery(GET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE, {
    fetchPolicy: 'cache-and-network',
  })
}
