import { gql, useQuery } from '@apollo/client'

const GET_BOOKING_NOTIFICATION_LINE = gql`
  query GET_BOOKING_NOTIFICATION_LINE {
    getBookingNotificationLine {
      isUsing
      notifyDayCount
    }
  }
`

export default function useFetchGetBookingNotificationLine() {
  return useQuery(GET_BOOKING_NOTIFICATION_LINE, {
    fetchPolicy: 'cache-and-network',
  })
}