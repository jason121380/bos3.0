import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_BOOKING_NOTIFICATION_PHONE = gql`
  mutation SET_MERCHANT_BOOKING_NOTIFICATION_PHONE($input:  [String]!) {
    setMerchantBookingNotificationPhone(input: $input)
  }
`

export default function useFetchSetMerchantBookingNotificationPhone() {
  const [setMerchantBookingNotificationPhone] = useMutation(SET_MERCHANT_BOOKING_NOTIFICATION_PHONE)
  return {
    setMerchantBookingNotificationPhone: ({ input }) =>
    setMerchantBookingNotificationPhone({
        variables: {
          input,
        },
      }),
  }
}
