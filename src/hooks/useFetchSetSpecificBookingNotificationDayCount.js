import { gql, useMutation } from '@apollo/client'

const SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT = gql`
  mutation SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT($input: Int) {
    setSpecificBookingNotificationDayCount(input: $input)
  }
`

export default function useFetchSetSpecificBookingNotificationDayCount() {
  const [setSpecificBookingNotificationDayCount] = useMutation(SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT)
  return {
    setSpecificBookingNotificationDayCount: ({ input }) =>
      setSpecificBookingNotificationDayCount({
        variables: {
          input,
        },
      }),
  }
}
