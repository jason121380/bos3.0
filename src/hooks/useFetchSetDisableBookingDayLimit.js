import { gql, useMutation } from '@apollo/client'

const SET_DISABLE_BOOKING_DAY_LIMIT = gql`
  mutation SET_DISABLE_BOOKING_DAY_LIMIT($count: Int) {
    setDisableBookingDayLimit(count: $count)
  }
`
export default function useFetchSetDisableBookingDayLimit() {
  const [setDisableBookingDayLimit] = useMutation(SET_DISABLE_BOOKING_DAY_LIMIT)
  return {
    setDisableBookingDayLimit: ({ count }) =>
      setDisableBookingDayLimit({
        variables: {
          count,
        },
      }),
  }
}
