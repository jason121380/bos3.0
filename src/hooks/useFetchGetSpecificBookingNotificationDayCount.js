import { gql, useQuery } from '@apollo/client'

export const GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT = gql`
  query GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT {
    getSpecificBookingNotificationDayCount
  }
`

export default function useFetchGetSpecificBookingNotificationDayCount() {
  return useQuery(GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT, {
    fetchPolicy: 'cache-and-network',
  })
}
