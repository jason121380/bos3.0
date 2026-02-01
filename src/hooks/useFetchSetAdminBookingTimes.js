import { gql, useMutation } from '@apollo/client'

const SET_ADMIN_BOOKING_TIMES = gql`
  mutation SET_ADMIN_BOOKING_TIMES($input: AdminBookingTimesInput) {
    adminBookingTimes(input: $input)
  }
`

export default function useFetchSetAdminBookingTimes() {
  const [setTimes] = useMutation(SET_ADMIN_BOOKING_TIMES)
  return {
    setTimes: ({ input }) =>
      setTimes({
        variables: {
          input,
        },
      }),
  }
}