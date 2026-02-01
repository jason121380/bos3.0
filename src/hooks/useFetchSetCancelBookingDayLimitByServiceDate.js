import { gql, useMutation } from '@apollo/client'

const SET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE = gql`
  mutation SET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE($count: Int) {
    setCancelBookingDayLimitByServiceDate(count: $count)
  }
`
export default function useFetchSetCancelBookingDayLimitByServiceDate() {
  const [setCancelBookingDayLimitByServiceDate] = useMutation(SET_CANCEL_BOOKING_DAY_LIMIT_BY_SERVICE_DATE)
  return {
    setCancelBookingDayLimitByServiceDate: ({ count }) =>
    setCancelBookingDayLimitByServiceDate({
        variables: {
          count,
        },
      }),
  }
}
