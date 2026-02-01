import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_NOTIFICATION_LINE = gql`
  mutation SET_BOOKING_NOTIFICATION_LINE($input: SetBookingNotificationLineInput!) {
    setBookingNotificationLine(input: $input)
  }
`

export default function useFetchSetBookingNotificationLine() {
  const [setBookingNotificationLineSetting] = useMutation(SET_BOOKING_NOTIFICATION_LINE)
  return {
    setBookingNotificationLineSetting: ({ input }) =>
      setBookingNotificationLineSetting({
        variables: {
          input,
        },
      }),
  }
}