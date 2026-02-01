import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_BOOKING_NOTIFICATION_PHONE = gql`
  query GET_MERCHANT_BOOKING_NOTIFICATION_PHONE {
    getMerchantBookingNotificationPhone
  }
`

export default function useFetchGetMerchantBookingNotificationPhone() {
  return useQuery(GET_MERCHANT_BOOKING_NOTIFICATION_PHONE, {
    fetchPolicy: 'cache-and-network',
  })
}