import { gql, useMutation } from '@apollo/client'

const SET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE = gql`
  mutation SET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE($count: Int) {
    setCancelBookingDayLimitByActionDate(count: $count)
  }
`
export default function useFetchSetCancelBookingDayLimitByActionDate() {
  const [setCancelBookingDayLimitByActionDate] = useMutation(SET_CANCEL_BOOKING_DAY_LIMIT_BY_ACTION_DATE)
  return {
    setCancelBookingDayLimitByActionDate: ({ count }) =>
      setCancelBookingDayLimitByActionDate({
        variables: {
          count,
        },
      }),
  }
}
