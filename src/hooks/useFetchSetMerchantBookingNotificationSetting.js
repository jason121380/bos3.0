import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_BOOKING_NOTIFICATION_SETTING = gql`
  mutation SET_MERCHANT_BOOKING_NOTIFICATION_SETTING($input: SetMerchantBookingNotificationSettingInput!) {
    setMerchantBookingNotificationSetting(input: $input)
  }
`

export default function useFetchSetMerchantBookingNotificationSetting() {
  const [setMerchantBookingNotificationSetting] = useMutation(SET_MERCHANT_BOOKING_NOTIFICATION_SETTING)
  return {
    setMerchantBookingNotificationSetting: ({ input }) =>
    setMerchantBookingNotificationSetting({
        variables: {
          input,
        },
      }),
  }
}
