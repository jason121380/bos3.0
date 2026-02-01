import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_BOOKING_TIME = gql`
  query GET_MERCHANT_BOOKING_TIME($input: DateTimeInput!) {
    getMerchantBookingTime(input: $input) {
      date
      isRegularHoliday
      bookingTimes {
        time
        status
      }
    }
  }
`

export default function useFetchMerchantOrders(input) {
  return useQuery(GET_MERCHANT_BOOKING_TIME, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
