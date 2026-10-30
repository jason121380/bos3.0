import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_LINE_NOTIFY_SETTINGS = gql`
  mutation SetBookingLineNotifySettings($input: SetBookingLineNotifySettingInput!) {
    setBookingLineNotifySettings(input: $input)
  }
`

export default function useFetchSetBookingLineNotifySettings() {
  const [setBookingLineNotifySettings] = useMutation(SET_BOOKING_LINE_NOTIFY_SETTINGS)
  return {
    setBookingLineNotifySettings: ({ input }) =>
      setBookingLineNotifySettings({
        variables: {
          input,
        },
      }),
  }
}
