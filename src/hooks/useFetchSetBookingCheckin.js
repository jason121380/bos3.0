import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_CHECK_IN = gql`
  mutation SET_BOOKING_CHECK_IN($input: CheckinInput) {
    bookingCheckin(input: $input)
  }
`

export default function useFetchSetBookingCheckin() {
  const [setBookingCheckin] = useMutation(SET_BOOKING_CHECK_IN)
  return {
    setBookingCheckin: inputData =>
      setBookingCheckin({
        variables: {
          input : inputData,
        },
      }),
  }
}