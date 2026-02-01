import { gql, useMutation } from '@apollo/client'

const SET_DELAY_BOOKING_CHECKIN_TIMME = gql`
  mutation SET_DELAY_BOOKING_CHECKIN_TIMME($input: DelayBookingCheckinTimeInput!) {
    delayBookingCheckinTime(input: $input)
  }
`

export default function useFetchSetDelayBookingCheckinTime() {
  const [setDelayBookingCheckinTime] = useMutation(SET_DELAY_BOOKING_CHECKIN_TIMME)
  return {
    setDelayBookingCheckinTime: ({ input }) =>
      setDelayBookingCheckinTime({
        variables: {
          input,
        },
      }),
  }
}
