import { gql, useMutation } from '@apollo/client'

const SET_CREATE_BOOKING_DAY_LIMIT = gql`
  mutation SET_CREATE_BOOKING_DAY_LIMIT($count: Int) {
    setCreateBookingDayLimit(count: $count)
  }
`
export default function useFetchSetCreateBookingDayLimit() {
  const [setCreateBookingDayLimit] = useMutation(SET_CREATE_BOOKING_DAY_LIMIT)
  return {
    setCreateBookingDayLimit: ({ count }) =>
      setCreateBookingDayLimit({
        variables: {
          count,
        },
      }),
  }
}
