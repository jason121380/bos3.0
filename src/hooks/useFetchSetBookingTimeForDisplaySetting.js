import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_TIME_FOR_DISPLAY_SETTING = gql`
  mutation SET_BOOKING_TIME_FOR_DISPLAY_SETTING($input: BookingTimeSettingInput!) {
    setBookingTimeForDisplaySetting(input: $input)
  }
`

export default function useFetchSetBookingTimeForDisplaySetting() {
  const [setBookingTimeForDisplaySetting] = useMutation(SET_BOOKING_TIME_FOR_DISPLAY_SETTING)
  return {
    setBookingTimeForDisplaySetting: ({ input }) =>
      setBookingTimeForDisplaySetting({
        variables: {
          input,
        },
      }),
  }
}