import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_CANCEL_CHECK_IN = gql`
  mutation SET_BOOKING_CANCEL_CHECK_IN($input: CheckinInput) {
    bookingCancelCheckin(input: $input)
  }
`

export default function useFetchSetBookingCancelCheckin() {
  const [setBookingCancelCheckin] = useMutation(SET_BOOKING_CANCEL_CHECK_IN)
  return {
    setBookingCancelCheckin: inputData =>
      setBookingCancelCheckin({
        variables: {
          input: inputData,
        },
      }),
  }
}