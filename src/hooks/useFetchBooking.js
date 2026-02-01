import { gql, useMutation } from '@apollo/client'

export const BOOKING_SERVICE = gql`
  mutation bookingV2($BookingV2Input: BookingV2Input!) {
    bookingV2(input: $BookingV2Input) {
      id
      status
      date
    }
  }
`

export default function useFetchBooking() {
  const [booking] = useMutation(BOOKING_SERVICE)
  return {
    booking: BookingV2Input =>
      booking({
        variables: {
          BookingV2Input,
        },
      }),
  }
}
