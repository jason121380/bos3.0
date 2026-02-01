import { gql, useMutation } from '@apollo/client'

const SET_USER_DESIGNATE_BOOKING_LIMIT = gql`
  mutation SET_USER_DESIGNATE_BOOKING_LIMIT($input: SetUserBookingLimit!) {
    setUserBookingLimit(input: $input) {
      designerId
      bookingLimit
    }
  }
`

export default function useFetchSetUserBookingLimit() {
  const [setUserBookingLimit] = useMutation(SET_USER_DESIGNATE_BOOKING_LIMIT)
  return {
    setUserBookingLimit: ({ input }) =>
      setUserBookingLimit({
        variables: {
          input,
        },
      }),
  }
}
