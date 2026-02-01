import { gql, useQuery } from '@apollo/client'

export const GET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE = gql`
  query GET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE {
    getCancelBookingDayLimitByActionDate
  }
`

export default function useFetchGetCancelBookingDayLimitByActionDate() {
  return useQuery(GET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE, {
    fetchPolicy: 'cache-and-network',
  })
}
